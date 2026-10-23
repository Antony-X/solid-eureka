"""Build the strict and standard ladder graphs, run the EDA and export game data.

Outputs
    data/game/{mode}_words.txt        one word per line (the game dictionary)
    data/game/{mode}_edges.tsv.gz     source, target, op (sub | ins)
    data/game/puzzles.tsv             generated start/target pairs with difficulty
    reports/stats.json                every number quoted in reports/EDA.md
"""
import json
import random
import statistics
from collections import Counter, defaultdict
from pathlib import Path

import networkx as nx

from ladder.graph import DATA, WordGraph, load_words

ROOT = DATA.parent
GAME = DATA / "game"
REPORTS = ROOT / "reports"
MODES = {"strict": ("headword",), "standard": ("headword", "form")}

# Semantic pairs a player might try: (start, target, English)
PAIRS = [
    ("ვაშლი", "მსხალი", "apple → pear"),
    ("დღე", "ღამე", "day → night"),
    ("კაცი", "ქალი", "man → woman"),
    ("დედა", "მამა", "mother → father"),
    ("ძაღლი", "კატა", "dog → cat"),
    ("მზე", "მთვარე", "sun → moon"),
    ("შავი", "თეთრი", "black → white"),
    ("ცხელი", "ცივი", "hot → cold"),
    ("წყალი", "ცეცხლი", "water → fire"),
    ("პური", "ღვინო", "bread → wine"),
    ("ომი", "მშვიდობა", "war → peace"),
    ("ცა", "მიწა", "sky → earth"),
    ("ბიჭი", "გოგო", "boy → girl"),
    ("თავი", "ფეხი", "head → foot"),
    ("ზღვა", "მთა", "sea → mountain"),
    ("მგელი", "ცხვარი", "wolf → sheep"),
    ("ჩაი", "ყავა", "tea → coffee"),
    ("ხე", "ქვა", "tree → stone"),
    ("ქარი", "წვიმა", "wind → rain"),
    ("ღმერთი", "ეშმაკი", "god → devil"),
    ("სიცოცხლე", "სიკვდილი", "life → death"),
]


def levenshtein(a, b):
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def keystones(adj, component):
    """For each articulation point of a connected component: how many words it cuts off.

    Removing the word splits the component; everything outside the largest remaining piece
    is "cut off". Iterative Tarjan DFS with subtree sizes.
    """
    n = len(component)
    root = component[0]
    disc, low, size = {root: 0}, {root: 0}, {root: 1}
    pieces = defaultdict(list)
    stack = [(root, None, iter(adj[root]))]
    clock = 0
    while stack:
        u, parent, it = stack[-1]
        for v in it:
            if v not in disc:
                clock += 1
                disc[v] = low[v] = clock
                size[v] = 1
                stack.append((v, u, iter(adj[v])))
                break
            if v != parent:
                low[u] = min(low[u], disc[v])
        else:
            stack.pop()
            if parent is not None:
                low[parent] = min(low[parent], low[u])
                size[parent] += size[u]
                if low[u] >= disc[parent]:
                    pieces[parent].append(size[u])
    result = {}
    for u, ps in pieces.items():
        if u == root and len(ps) < 2:
            continue
        rest = n - 1 - sum(ps)
        cut = n - 1 - max(ps + [rest])
        if cut > 0:
            result[u] = cut
    return result


def edit_profile(g):
    """Where edits happen and which letters swap, over all edges."""
    position, sub_pairs, indel = Counter(), Counter(), Counter()
    for u, nbrs in g.adj.items():
        for v in nbrs:
            if u >= v:
                continue
            if len(u) == len(v):
                i = next(i for i in range(len(u)) if u[i] != v[i])
                sub_pairs["↔".join(sorted((u[i], v[i])))] += 1
                last = len(u) - 1
            else:
                a, b = (u, v) if len(u) < len(v) else (v, u)
                i = next((i for i in range(len(a)) if a[i] != b[i]), len(a))
                indel[b[i]] += 1
                last = len(b) - 1
            position["first" if i == 0 else "last" if i == last else "middle"] += 1
    return position, sub_pairs, indel


def distance_sample(g, giant, n_sources, seed=0):
    rnd = random.Random(seed)
    hist, ecc = Counter(), []
    for s in rnd.sample(giant, min(n_sources, len(giant))):
        dist, _ = g.bfs(s)
        ecc.append(max(dist.values()))
        hist.update(d for d in dist.values() if d > 0)
    total, running = sum(hist.values()), 0
    for median, v in sorted(hist.items()):
        running += v
        if running * 2 >= total:
            break
    return {
        "hist": dict(sorted(hist.items())),
        "mean": round(sum(k * v for k, v in hist.items()) / total, 2),
        "median": median,
        "median_eccentricity": statistics.median(ecc),
    }


def longest_ladder(g, giant, exact):
    """Exact diameter for small components, double-sweep lower bound otherwise."""
    if exact:
        best = (0, None, None)
        for s in giant:
            dist, _ = g.bfs(s)
            t = max(dist, key=dist.get)
            if dist[t] > best[0]:
                best = (dist[t], s, t)
        _, a, b = best
    else:
        best, start = (0, None, None), giant[0]
        for _ in range(6):  # repeated double sweep: hop to the farthest word each time
            dist, _ = g.bfs(start)
            far = max(dist, key=dist.get)
            if dist[far] <= best[0]:
                break
            best, start = (dist[far], start, far), far
        _, a, b = best
    path = g.shortest_path(a, b)
    return {"length": len(path) - 1, "exact": exact, "path": path}


def make_puzzles(g, giant, words, rnd, per_level=60):
    """Start/target pairs drawn from common, glossed headwords in the giant component."""
    pool = [w for w in giant if words[w]["gloss"] and words[w]["pos"] in ("noun", "adj")
            and words[w]["freq"] >= 500 and not words[w]["sensitive"]]
    levels = {"easy": (3, 4), "medium": (5, 6), "hard": (7, 9), "expert": (10, 99)}
    found = {k: [] for k in levels}
    for _ in range(20000):
        if all(len(v) >= per_level for v in found.values()):
            break
        a = rnd.choice(pool)
        dist, parents = g.bfs(a)
        count = {a: 1}  # number of distinct shortest ladders from a
        for v in sorted(dist, key=dist.get)[1:]:
            count[v] = sum(count[p] for p in parents[v])
        targets = [w for w in pool if dist.get(w, 0) >= 3]
        rnd.shuffle(targets)
        for b in targets[:3]:  # few targets per start word keeps the puzzle set varied
            d = dist[b]
            level = next(k for k, (lo, hi) in levels.items() if lo <= d <= hi)
            if len(found[level]) < per_level:
                found[level].append((level, d, count[b], a, b, " ".join(g.shortest_path(a, b))))
    return [p for v in found.values() for p in v]


def analyse(mode, tiers, df, words):
    print(f"== {mode}")
    sub = df[df.tier.isin(tiers)]
    g = WordGraph(sub.word)
    comps = g.components()
    giant = sorted(comps[0])  # fixed order so the sampled statistics are reproducible
    giant_set = set(giant)
    deg = {w: len(n) for w, n in g.adj.items()}
    position, sub_pairs, indel = edit_profile(g)
    ops = Counter(g.ops[(u, v)] for u in g.adj for v in g.adj[u] if u < v)

    by_len = {}
    for L, group in sub.groupby(sub.length.clip(upper=16)):
        ws = list(group.word)
        by_len[int(L)] = {
            "words": len(ws),
            "isolated_pct": round(100 * sum(deg[w] == 0 for w in ws) / len(ws), 1),
            "giant_pct": round(100 * sum(w in giant_set for w in ws) / len(ws), 1),
            "mean_degree": round(sum(deg[w] for w in ws) / len(ws), 2),
        }

    G = nx.Graph()
    G.add_edges_from((u, v) for u in giant for v in g.adj[u] if u < v)
    print("   betweenness ...")
    k = None if len(giant) < 5000 else 300
    btw = nx.betweenness_centrality(G, k=k, seed=1)
    print("   clustering, keystones, distances ...")
    keys = keystones(g.adj, giant)
    hermits = [w for w in sub.sort_values("freq", ascending=False).word if deg[w] == 0][:40]

    stats = {
        "words": len(g),
        "edges": g.n_edges(),
        "edge_ops": dict(ops),
        "mean_degree": round(2 * g.n_edges() / len(g), 2),
        "isolated": sum(d == 0 for d in deg.values()),
        "components": len(comps),
        "component_sizes_top": [len(c) for c in comps[:15]],
        "component_size_hist": dict(sorted(Counter(min(len(c), 1000) for c in comps).items())),
        "giant": len(giant),
        "giant_pct": round(100 * len(giant) / len(g), 1),
        "giant_clustering": round(nx.average_clustering(G), 3),
        "giant_assortativity": round(nx.degree_assortativity_coefficient(G), 3),
        "giant_articulation_points": len(keys),
        "giant_bridges": sum(1 for _ in nx.bridges(G)),
        "degree_hist": dict(sorted(Counter(min(d, 30) for d in deg.values()).items())),
        "hubs": [(w, deg[w]) for w in sorted(deg, key=deg.get, reverse=True)[:30]],
        "hub_headwords": [(w, deg[w]) for w in sorted(deg, key=deg.get, reverse=True)
                          if words[w]["tier"] == "headword" and len(w) >= 4][:20],
        "betweenness_top": [(w, round(b, 4)) for w, b in sorted(btw.items(), key=lambda x: -x[1])[:25]],
        "keystones_top": sorted(keys.items(), key=lambda x: -x[1])[:25],
        "hermits": hermits,
        "by_length": by_len,
        "edit_position": dict(position),
        "sub_pairs_top": sub_pairs.most_common(20),
        "indel_letters_top": indel.most_common(15),
        "distances": distance_sample(g, giant, 400 if len(giant) < 10000 else 150),
        "longest_ladder": longest_ladder(g, giant, exact=len(giant) < 5000),
        "pairs": [],
        "second_component": comps[1][:40],
    }
    for a, b, en in PAIRS:
        entry = {"start": a, "target": b, "english": en, "edit_distance": levenshtein(a, b)}
        if a in g.words and b in g.words:
            paths = g.all_shortest_paths(a, b, limit=50)
            entry.update(steps=len(paths[0]) - 1 if paths else None,
                         n_shortest=g.count_shortest_paths(a, b) if paths else 0,
                         paths=paths[:5])
        else:
            entry.update(steps=None, missing=[w for w in (a, b) if w not in g.words])
        stats["pairs"].append(entry)

    GAME.mkdir(parents=True, exist_ok=True)
    (GAME / f"{mode}_words.txt").write_text("\n".join(sorted(g.words)) + "\n", encoding="utf8")
    g.save_edges(GAME / f"{mode}_edges.tsv.gz")
    return g, giant, stats


def main():
    df = load_words()
    words = df.set_index("word")[["tier", "freq", "gloss", "form_of", "pos", "length", "sensitive"]].to_dict("index")
    tier_counts = df.tier.value_counts().to_dict()
    report = {
        "vocabulary_any_source": len(df),
        "tiers": tier_counts,
        "length_by_tier": {t: df[df.tier == t].length.describe().round(2).to_dict() for t in tier_counts},
        "headword_pos": df[df.tier == "headword"].pos.replace("", "(paradigm)").value_counts().head(10).to_dict(),
        "source_combos_top": df[df.tier != "rare"].sources.value_counts().head(15).to_dict(),
        "letter_freq": dict(Counter("".join(df[df.tier == "headword"].word)).most_common()),
        "modes": {},
    }
    rnd = random.Random(7)
    puzzles = []
    for mode, tiers in MODES.items():
        g, giant, stats = analyse(mode, tiers, df, words)
        report["modes"][mode] = stats
        print("   puzzles ...")
        puzzles += [(mode, *p) for p in make_puzzles(g, giant, words, rnd)]

    with open(GAME / "puzzles.tsv", "w", encoding="utf8") as fh:
        fh.write("mode\tlevel\tsteps\tn_shortest\tstart\ttarget\tstart_en\ttarget_en\texample_solution\n")
        for mode, level, d, n, a, b, path in puzzles:
            fh.write(f"{mode}\t{level}\t{d}\t{n}\t{a}\t{b}\t{words[a]['gloss']}\t{words[b]['gloss']}\t{path}\n")

    REPORTS.mkdir(parents=True, exist_ok=True)
    with open(REPORTS / "stats.json", "w", encoding="utf8") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=1)
    print("wrote", REPORTS / "stats.json")


if __name__ == "__main__":
    main()
