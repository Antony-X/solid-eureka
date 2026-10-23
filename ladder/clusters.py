"""Lay out every cluster (connected component) of the ladder graphs as one map.

The largest cluster starts from a DrL layout, which places related regions near each other
(about 2 minutes for 68k words). A short Fruchterman-Reingold run seeded with it pulls every
word close to its neighbours, a radial warp spreads the words evenly over a disc so that no part
of the map is empty, and a last pass pushes overlapping words apart. Every smaller cluster gets
its own Fruchterman-Reingold layout and becomes an island, placed in rings around the main
cluster with the biggest islands closest. One map unit is about the gap between neighbours.

Output: data/game/{mode}_clusters.tsv.gz with columns word, cluster, x, y.
    Cluster 0 is the largest and ids follow size. Words with no neighbours come last, each its
    own cluster, with no coordinates.
"""
import gzip
import math
import random

import igraph as ig
import numpy as np
from scipy.spatial import cKDTree

from ladder.analyze import GAME, MODES

MIN_SPACING = 0.7   # no two words closer than this (map units)
MAIN_AREA = 4.0     # map area per word in the main cluster
ISLAND_GAP = 3.0    # sea between neighbouring islands
ISLAND_MARGIN = 0.9  # land between an island's outermost word and its shore


def load_igraph(mode):
    words = (GAME / f"{mode}_words.txt").read_text(encoding="utf8").split()
    index = {w: i for i, w in enumerate(words)}
    with gzip.open(GAME / f"{mode}_edges.tsv.gz", "rt", encoding="utf8") as fh:
        next(fh)
        edges = [(index[a], index[b]) for a, b, _ in (line.rstrip("\n").split("\t") for line in fh)]
    g = ig.Graph(n=len(words), edges=edges)
    g.vs["word"] = list(range(len(words)))
    return g, words


def spread(xy, dmin=MIN_SPACING, iters=60):
    """Push apart pairs of points closer than dmin; leaves the global shape alone."""
    xy = xy.copy()
    rng = np.random.default_rng(0)
    for _ in range(iters):
        pairs = cKDTree(xy).query_pairs(dmin, output_type="ndarray")
        if not len(pairs):
            break
        a, b = pairs[:, 0], pairs[:, 1]
        d = xy[b] - xy[a]
        dist = np.linalg.norm(d, axis=1)
        same = dist < 1e-9
        d[same] = rng.normal(size=(same.sum(), 2))
        dist[same] = np.linalg.norm(d[same], axis=1)
        step = d / dist[:, None] * ((dmin - dist) / 4)[:, None]
        delta = np.zeros_like(xy)
        np.add.at(delta, a, -step)
        np.add.at(delta, b, step)
        xy += delta
    return xy


def equalize(xy, area):
    """Move words along their bearing from the centre so they fill a disc evenly.

    Keeps every word's direction and the order of distances; only the spacing changes."""
    c = xy - np.median(xy, axis=0)
    r = np.linalg.norm(c, axis=1)
    rank = np.argsort(np.argsort(r, kind="stable"), kind="stable")
    target = np.sqrt(len(xy) * area / np.pi) * np.sqrt((rank + 0.5) / len(xy))
    return c * (target / np.maximum(r, 1e-9))[:, None]


def layout_main(g):
    xy = np.array(g.layout_drl().coords)
    xy = (xy - xy.mean(axis=0)) / np.ptp(xy, axis=0).max() * np.sqrt(g.vcount()) * 0.6  # FR's natural scale
    xy = np.array(g.layout_fruchterman_reingold(seed=xy.tolist(), niter=80, start_temp=2.0, grid=True).coords)
    xy = spread(equalize(xy, MAIN_AREA))
    return xy - xy.mean(axis=0)


def layout_island(g):
    n = g.vcount()
    if n == 2:
        return np.array([[-0.5, 0.0], [0.5, 0.0]])
    xy = np.array(g.layout_fruchterman_reingold(niter=500).coords)
    e = np.array(g.get_edgelist())
    xy /= np.median(np.linalg.norm(xy[e[:, 0]] - xy[e[:, 1]], axis=1))
    xy = spread(xy, iters=15)
    return xy - xy.mean(axis=0)


def place_islands(radii, inner, rng):
    """Centres for islands (sorted biggest first) in concentric rings starting at radius `inner`."""
    centres = np.zeros((len(radii), 2))
    ring, i, turn = inner, 0, 0.0
    while i < len(radii):
        rmax = radii[i]
        R = ring + rmax
        circumference = 2 * math.pi * R
        j, used = i, 0.0
        while j < len(radii) and used + 2 * radii[j] + ISLAND_GAP <= circumference:
            used += 2 * radii[j] + ISLAND_GAP
            j += 1
        j = max(j, i + 1)
        slack = max(0.0, circumference - used) / (j - i)
        pos = turn * R
        for k in range(i, j):
            pos += radii[k] + (ISLAND_GAP + slack) / 2
            jitter = rng.uniform(-1, 1) * (rmax - radii[k])  # smaller islands drift off the ring line
            centres[k] = (R + jitter) * math.cos(pos / R), (R + jitter) * math.sin(pos / R)
            pos += radii[k] + (ISLAND_GAP + slack) / 2
        turn += 2.39996  # golden angle, so rings don't line up
        ring = R + rmax + ISLAND_GAP
        i = j
    return centres


def build(mode):
    random.seed(0)  # igraph's layouts draw from Python's random module
    g, words = load_igraph(mode)
    parts = sorted(g.decompose(minelements=2), key=lambda h: (-h.vcount(), min(h.vs["word"])))
    print(f"   {len(parts):,} clusters with 2+ words; laying out the largest ({parts[0].vcount():,} words) ...")

    main = layout_main(parts[0])
    islands = [layout_island(h) for h in parts[1:]]
    radii = np.array([np.linalg.norm(xy, axis=1).max() + ISLAND_MARGIN for xy in islands])
    inner = np.linalg.norm(main, axis=1).max() + 2 + ISLAND_GAP * 2
    centres = place_islands(radii, inner, np.random.default_rng(0))

    rows, clustered = [], set()
    for cid, (h, xy) in enumerate(zip(parts, [main] + [xy + c for xy, c in zip(islands, centres)])):
        for w, (x, y) in zip(h.vs["word"], xy):
            rows.append(f"{words[w]}\t{cid}\t{x:.2f}\t{y:.2f}")
            clustered.add(w)
    cid = len(parts)
    for w in range(len(words)):
        if w not in clustered:
            rows.append(f"{words[w]}\t{cid}\t\t")
            cid += 1
    with gzip.open(GAME / f"{mode}_clusters.tsv.gz", "wt", encoding="utf8") as fh:
        fh.write("word\tcluster\tx\ty\n" + "\n".join(rows) + "\n")
    print(f"   wrote {mode}_clusters.tsv.gz: {len(clustered):,} words on the map, {cid - len(parts):,} without neighbours")


def main():
    for mode in MODES:
        print(f"== {mode}")
        build(mode)


if __name__ == "__main__":
    main()
