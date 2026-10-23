"""Find word ladders from the command line.

    python -m ladder.cli path ვაშლი მსხალი            # one shortest ladder (standard mode)
    python -m ladder.cli path ვაშლი მსხალი --all      # every shortest ladder
    python -m ladder.cli path ვაშლი მსხალი --mode strict
    python -m ladder.cli neighbors ვაშლი
"""
import argparse
import gzip

from ladder.analyze import GAME
from ladder.graph import WordGraph, describe_step, load_words


def load_graph(mode):
    words = (GAME / f"{mode}_words.txt").read_text(encoding="utf8").split()
    with gzip.open(GAME / f"{mode}_edges.tsv.gz", "rt", encoding="utf8") as fh:
        next(fh)
        edges = [line.rstrip("\n").split("\t") for line in fh]
    return WordGraph(words, edges)


def explain(word, info):
    row = info.get(word)
    if not row:
        return ""
    return row["gloss"] or (f"form of {row['form_of']}" if row["form_of"] else "")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("command", choices=["path", "neighbors"])
    ap.add_argument("words", nargs="+")
    ap.add_argument("--mode", choices=["strict", "standard"], default="standard")
    ap.add_argument("--all", action="store_true", help="list every shortest ladder")
    args = ap.parse_args()

    g = load_graph(args.mode)
    info = load_words().set_index("word")[["gloss", "form_of"]].to_dict("index")

    if args.command == "neighbors":
        for w in args.words:
            print(f"{w} ({explain(w, info)}): {len(g.adj.get(w, []))} neighbours")
            for v in sorted(g.adj.get(w, [])):
                print(f"   {v:<16} {describe_step(w, v):<24} {explain(v, info)}")
        return

    a, b = args.words[:2]
    missing = [w for w in (a, b) if w not in g.words]
    if missing:
        print(f"not in the {args.mode} dictionary: {', '.join(missing)}")
        return
    paths =g.all_shortest_paths(a, b) if args.all else [g.shortest_path(a, b)]
    if not paths or paths[0] is None:
        print(f"no ladder from {a} to {b} in {args.mode} mode")
        return
    print(f"{a} → {b}: {len(paths[0]) - 1} steps, {g.count_shortest_paths(a, b)} shortest ladder(s) [{args.mode}]")
    for path in paths:
        print()
        print(f"   {path[0]:<16} {'':<24} {explain(path[0], info)}")
        for x, y in zip(path, path[1:]):
            print(f"   {y:<16} {describe_step(x, y):<24} {explain(y, info)}")


if __name__ == "__main__":
    main()
