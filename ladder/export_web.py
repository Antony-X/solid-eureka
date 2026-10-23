"""Bundle the word list, stats and puzzles into the self-contained explorer page web/index.html."""
import base64
import csv
import gzip
import json

from ladder.analyze import GAME, REPORTS, ROOT
from ladder.graph import load_words

WEB = ROOT / "web"


def words_blob(df):
    """One line per word: `word` (form), `word\\t=<lemma index>` (form of a listed lemma) or
    `word\\t*<gloss>` (dictionary headword). Gzipped and base64-encoded for embedding."""
    df = df[df.tier.isin(["headword", "form"])].sort_values("word")
    index = {w: i for i, w in enumerate(df.word)}
    lines = []
    for w, tier, gloss, form_of in zip(df.word, df.tier, df.gloss, df.form_of):
        if tier == "headword":
            lines.append(f"{w}\t*{gloss.replace(chr(9), ' ').replace(chr(10), ' ')}")
        else:
            lemma = form_of.split(" (")[0]
            lines.append(f"{w}\t={index[lemma]}" if lemma in index else w)
    return base64.b64encode(gzip.compress("\n".join(lines).encode("utf8"), 9)).decode("ascii")


def main():
    df = load_words()
    stats = json.loads((REPORTS / "stats.json").read_text(encoding="utf8"))
    for m in stats["modes"].values():  # keep the page lean: drop what it does not show
        for key in ("component_size_hist", "second_component", "degree_hist", "betweenness_top", "hubs"):
            m.pop(key, None)
    stats.pop("letter_freq", None)
    with open(GAME / "puzzles.tsv", encoding="utf8") as fh:
        puzzles = [{"mode": r["mode"], "start": r["start"], "target": r["target"]} for r in csv.DictReader(fh, delimiter="\t")]

    safe = lambda obj: json.dumps(obj, ensure_ascii=False).replace("</", "<\\/")
    page = (WEB / "template.html").read_text(encoding="utf8")
    page = page.replace("__WORDS__", words_blob(df)).replace("__STATS__", safe(stats)).replace("__PUZZLES__", safe(puzzles))
    (WEB / "index.html").write_text(page, encoding="utf8")
    print(f"wrote {WEB / 'index.html'} ({len(page.encode('utf8')) / 1e6:.2f} MB)")


if __name__ == "__main__":
    main()
