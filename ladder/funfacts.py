"""Records and curiosities of the word-ladder graph. Writes reports/funfacts.json."""
import json
from collections import defaultdict

import numpy as np
from rapidfuzz.distance import Levenshtein
from rapidfuzz.process import cdist

from ladder.analyze import REPORTS
from ladder.clusters import load_igraph
from ladder.graph import load_words


def describe(w, info):
    row = info.get(w, {})
    return {"word": w, "gloss": row.get("gloss") or (f"form of {row['form_of']}" if row.get("form_of") else ""),
            "freq": int(row.get("freq", 0))}


def nearest_distance(queries, choices):
    """For each query, the Levenshtein distance to the closest *other* word in choices."""
    out = np.empty(len(queries), dtype=np.int16)
    for a in range(0, len(queries), 400):
        d = cdist(queries[a:a + 400], choices, scorer=Levenshtein.distance, dtype=np.uint8, workers=-1)
        d[d == 0] = 255  # the word itself
        out[a:a + 400] = d.min(axis=1)
    return out


def shrink_chains(words):
    """Longest chain from a word down to a 1-2 letter word, deleting one letter per step."""
    ws = set(words)
    best, nxt = {}, {}
    for w in sorted(ws, key=len):
        if len(w) <= 2:
            best[w] = 1
            continue
        best[w] = 0
        for i in range(len(w)):
            d = w[:i] + w[i + 1:]
            if best.get(d, 0) + 1 > best[w] and best.get(d, 0) > 0:
                best[w], nxt[w] = best[d] + 1, d
    top = max(best, key=lambda w: (best[w], -len(w)))
    chain = [top]
    while chain[-1] in nxt:
        chain.append(nxt[chain[-1]])
    return chain


def wildcard_families(words, top=5):
    buckets = defaultdict(list)
    for w in words:
        for i in range(len(w)):
            buckets[w[:i] + "_" + w[i + 1:]].append(w)
    return [(p, len(v), sorted(v)) for p, v in sorted(buckets.items(), key=lambda kv: -len(kv[1]))[:top]]


def mode_facts(mode, info, all_words):
    g, words = load_igraph(mode)
    deg = np.array(g.degree())
    comps = g.connected_components()
    main = g.induced_subgraph(max(comps, key=len))
    mw = [words[v] for v in main.vs["word"]]
    f = {"words": len(words)}

    order = np.argsort(-deg, kind="stable")
    f["most_neighbours"] = [{**describe(words[i], info), "neighbours": int(deg[i])} for i in order[:10]]
    long = [i for i in order if len(words[i]) >= 7][:5]
    f["most_neighbours_7plus_letters"] = [{**describe(words[i], info), "neighbours": int(deg[i])} for i in long]

    isolated = [w for w, d in zip(words, deg) if d == 0]
    f["isolated_count"] = len(isolated)
    f["most_common_isolated"] = [describe(w, info) for w in sorted(isolated, key=lambda w: -info[w]["freq"])[:10]]
    f["shortest_isolated"] = [describe(w, info) for w in sorted(isolated, key=lambda w: (len(w), -info[w]["freq"]))[:8]]
    f["longest_with_a_neighbour"] = [describe(w, info) for w in sorted((w for w, d in zip(words, deg) if d), key=len, reverse=True)[:5]]

    print(f"   {mode}: diameter ...", flush=True)
    path = main.get_diameter(directed=False)
    f["diameter"] = {"steps": len(path) - 1, "path": [mw[v] for v in path]}
    print(f"   {mode}: closeness ...", flush=True)
    clo = np.array(main.closeness())
    f["most_central"] = [{**describe(mw[i], info), "avg_steps_to_others": round(1 / clo[i], 2)} for i in np.argsort(-clo)[:5]]
    f["least_central"] = [{**describe(mw[i], info), "avg_steps_to_others": round(1 / clo[i], 2)} for i in np.argsort(clo)[:5]]
    if main.vcount() < 10000:   # all-pairs eccentricity is too slow for the 68k-word cluster
        ecc = np.array(main.eccentricity())
        f["radius"] = int(ecc.min())
        f["center"] = [describe(mw[i], info) for i in np.where(ecc == ecc.min())[0][:8]]

    f["biggest_families"] = [{"pattern": p, "size": n, "words": ws[:40]} for p, n, ws in wildcard_families(words)]
    f["longest_shrink_chain"] = shrink_chains(words)

    # common words one letter apart, both glossed
    glossed = {w for w in words if info[w]["gloss"]}
    pairs = []
    for e in g.es:
        a, b = words[e.source], words[e.target]
        if a in glossed and b in glossed and len(a) >= 3 and len(b) >= 3:
            pairs.append((min(info[a]["freq"], info[b]["freq"]), a, b))
    f["common_neighbour_pairs"] = [[describe(a, info), describe(b, info)] for _, a, b in sorted(pairs, reverse=True)[:15]]

    # hardest pair among very common glossed words in the main cluster
    pool = sorted((v for v in range(main.vcount()) if mw[v] in glossed and len(mw[v]) >= 3),
                  key=lambda v: -info[mw[v]]["freq"])[:300]
    dist = np.array(main.distances(source=pool, target=pool))
    i, j = np.unravel_index(dist.argmax(), dist.shape)
    f["hardest_common_pair"] = {"from": describe(mw[pool[i]], info), "to": describe(mw[pool[j]], info), "steps": int(dist[i, j]),
                                "path": [mw[v] for v in main.get_shortest_paths(pool[i], pool[j])[0]]}

    # a neighbour at every letter position: change any single letter and you can still land on a word
    ws = set(words)
    def flexible(w):
        return all(any(w[:i] + c + w[i + 1:] in ws for c in "აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ" if c != w[i]) for i in range(len(w)))
    flex = [w for w in words if len(w) >= 4 and flexible(w)]
    f["fully_flexible_count"] = len(flex)
    f["fully_flexible_longest"] = [describe(w, info) for w in sorted(flex, key=lambda w: (-len(w), -info[w]["freq"]))[:6]]
    return f


def main():
    df = load_words()
    info = df.set_index("word")[["gloss", "form_of", "freq", "tier"]].to_dict("index")
    standard = (df[df.tier.isin(["headword", "form"])]).word.tolist()
    facts = {}
    for mode in ("strict", "standard"):
        print(f"== {mode}", flush=True)
        facts[mode] = mode_facts(mode, info, standard)

    print("== loneliest words (edit distance to the nearest other word)", flush=True)
    heads = df[df.tier == "headword"].word.tolist()
    near = nearest_distance(heads, standard)
    rows = sorted(zip(near, heads), key=lambda t: (-t[0], -info[t[1]]["freq"]))
    facts["loneliest"] = [{**describe(w, info), "nearest_edits": int(d)} for d, w in rows[:10]]
    common = [(d, w) for d, w in rows if info[w]["freq"] >= 1000]
    facts["loneliest_common"] = [{**describe(w, info), "nearest_edits": int(d)} for d, w in common[:10]]
    short = [(d, w) for d, w in rows if len(w) <= 5]
    facts["loneliest_short"] = [{**describe(w, info), "nearest_edits": int(d)} for d, w in short[:10]]
    for d, w in rows[:3]:
        best = min(standard, key=lambda s: (Levenshtein.distance(w, s) if s != w else 99))
        facts.setdefault("loneliest_nearest", []).append({"word": w, "nearest": best, "edits": int(d)})
    facts["palindromes"] = sorted((w for w in heads if len(w) >= 4 and w == w[::-1]), key=len, reverse=True)[:10]

    (REPORTS / "funfacts.json").write_text(json.dumps(facts, ensure_ascii=False, indent=1), encoding="utf8")
    print("wrote", REPORTS / "funfacts.json")


if __name__ == "__main__":
    main()
