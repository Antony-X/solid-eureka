"""Bundle the word list, stats, puzzles and cluster maps into the explorer page.

Writes web/index.html from web/template.html with web/atlas.js (the cluster map) inlined. The
page is self-contained except for the large map of all word forms, web/clusters-standard.bin,
which it fetches when that map is first opened.
"""
import base64
import csv
import gzip
import json
import struct

import numpy as np
import pandas as pd

from ladder.analyze import GAME, REPORTS, ROOT
from ladder.graph import load_words

WEB = ROOT / "web"


def page_words(df):
    """The page's word list: every headword and form, alphabetical. Map data refers to it by index."""
    return df[df.tier.isin(["headword", "form"])].sort_values("word")


def words_blob(words):
    """One line per word: `word` (form), `word\\t=<lemma index>` (form of a listed lemma) or
    `word\\t*<gloss>` (dictionary headword). Gzipped and base64-encoded for embedding."""
    index = {w: i for i, w in enumerate(words.word)}
    lines = []
    for w, tier, gloss, form_of in zip(words.word, words.tier, words.gloss, words.form_of):
        if tier == "headword":
            lines.append(f"{w}\t*{gloss.replace(chr(9), ' ').replace(chr(10), ' ')}")
        else:
            lemma = form_of.split(" (")[0]
            lines.append(f"{w}\t={index[lemma]}" if lemma in index else w)
    return base64.b64encode(gzip.compress("\n".join(lines).encode("utf8"), 9)).decode("ascii")


def cluster_blob(mode, words):
    """Gzipped binary map of one mode's clusters (words with no neighbours are left out).

    Little-endian layout:
        "WLC1", uint32 clusters, uint32 nodes, float32 unit, uint32 width, uint32 height
        uint32 size[clusters]       words per cluster, largest first
        uint32 word_delta[nodes]    page word index, delta-coded within each cluster
        uint8  prio[nodes]          label priority, 11 * log2(1 + corpus frequency)
        padding to a multiple of 4
        uint16 x[nodes], y[nodes]   positions; the longer side of the map spans 0..65535
    `unit` is how many position steps one map unit (the typical gap between neighbours) takes.
    """
    index = {w: i for i, w in enumerate(words.word)}
    freq = dict(zip(words.word, words.freq))
    cl = pd.read_csv(GAME / f"{mode}_clusters.tsv.gz", sep="\t", keep_default_na=False, dtype={"x": str, "y": str})
    cl = cl[cl.x != ""].astype({"x": float, "y": float})
    cl["idx"] = cl.word.map(index)
    cl = cl.sort_values(["cluster", "idx"])

    sizes = cl.groupby("cluster").size().sort_index().to_numpy(np.uint32)
    idx = cl.idx.to_numpy(np.int64)
    first = np.r_[True, cl.cluster.to_numpy()[1:] != cl.cluster.to_numpy()[:-1]]
    delta = np.where(first, idx, idx - np.r_[0, idx[:-1]]).astype(np.uint32)
    prio = np.clip(np.round(11 * np.log2(1 + cl.word.map(freq).to_numpy(float))), 0, 255).astype(np.uint8)

    x, y = cl.x.to_numpy(), cl.y.to_numpy()
    x0, y0 = x.min() - 2, y.min() - 2  # room for the shore around the outermost words
    scale = 65535 / max(x.max() + 2 - x0, y.max() + 2 - y0)
    qx = np.round((x - x0) * scale).astype(np.uint16)
    qy = np.round((y - y0) * scale).astype(np.uint16)

    n = len(cl)
    head = struct.pack("<4sIIfII", b"WLC1", len(sizes), n, scale, int(qx.max()) + 1, int(qy.max()) + 1)
    body = sizes.tobytes() + delta.tobytes() + prio.tobytes()
    body += b"\0" * (-(len(head) + len(body)) % 4)
    raw = head + body + qx.tobytes() + qy.tobytes()
    return gzip.compress(raw, 9), n, len(sizes)


def main():
    df = load_words()
    words = page_words(df)
    stats = json.loads((REPORTS / "stats.json").read_text(encoding="utf8"))
    for m in stats["modes"].values():  # keep the page lean: drop what it does not show
        for key in ("component_size_hist", "second_component", "degree_hist", "betweenness_top", "hubs"):
            m.pop(key, None)
    stats.pop("letter_freq", None)
    with open(GAME / "puzzles.tsv", encoding="utf8") as fh:
        puzzles = [{"mode": r["mode"], "start": r["start"], "target": r["target"]} for r in csv.DictReader(fh, delimiter="\t")]

    strict_map, n, k = cluster_blob("strict", words)
    print(f"strict map: {n:,} words in {k:,} clusters, {len(strict_map) / 1e3:.0f} KB (embedded)")
    standard_map, n, k = cluster_blob("standard", words)
    (WEB / "clusters-standard.bin").write_bytes(standard_map)
    print(f"standard map: {n:,} words in {k:,} clusters, {len(standard_map) / 1e6:.2f} MB -> web/clusters-standard.bin")

    safe = lambda obj: json.dumps(obj, ensure_ascii=False).replace("</", "<\\/")
    page = (WEB / "template.html").read_text(encoding="utf8")
    page = (page.replace("__WORDS__", words_blob(words)).replace("__STATS__", safe(stats))
            .replace("__PUZZLES__", safe(puzzles)).replace("__MAP_STRICT__", base64.b64encode(strict_map).decode("ascii"))
            .replace("/*__ATLAS__*/", (WEB / "atlas.js").read_text(encoding="utf8")))
    (WEB / "index.html").write_text(page, encoding="utf8")
    print(f"wrote {WEB / 'index.html'} ({len(page.encode('utf8')) / 1e6:.2f} MB)")


if __name__ == "__main__":
    main()
