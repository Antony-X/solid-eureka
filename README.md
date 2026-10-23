# Georgian word ladder

A Georgian word list and a word-ladder graph for a game. In the game you turn one word into another
by changing one letter at a time (substitute, insert or delete, which is Levenshtein distance 1), and
every step must be a real word.

```
$ python -m ladder.cli path ვაშლი მსხალი --mode strict
ვაშლი → მსხალი: 4 steps, 2 shortest ladder(s) [strict]

   ვაშლი                                     apple (fruit)
   ვალი             -შ (delete at 3)         debt
   ხალი             ვ→ხ (position 1)         birthmark, mole
   სხალი            +ს (insert at 1)         alternative form of მსხალი (msxali)
   მსხალი           +მ (insert at 1)         pear (fruit)
```

The other optimal ladder goes through სალი (steep) instead of ხალი.

The two words are 4 edits apart, so 4 steps is the shortest any ladder can be.

## What's here

| Path | Contents |
|---|---|
| `data/words_all.tsv.gz` | every distinct string from all sources, with frequency, source votes, tier, Wiktionary POS and gloss, and the lemma for inflected forms |
| `data/game/strict_words.txt` | 20,522 dictionary headwords (the strict game dictionary) |
| `data/game/standard_words.txt` | 187,038 headwords and attested word forms |
| `data/game/{strict,standard}_edges.tsv.gz` | the graph: every pair of words one edit apart (`sub` or `ins`) |
| `data/game/puzzles.tsv` | 480 generated puzzles in four difficulty levels, with step count, number of optimal solutions and one example solution |
| `data/game/{strict,standard}_clusters.tsv.gz` | every word's cluster (connected component; 0 = largest) and its position on the cluster map |
| `reports/EDA.md` | findings: graph structure, hubs, bottlenecks, longest ladders, everyday pairs, game-design advice |
| `reports/stats.json` | every number behind the report |
| `web/index.html` | the explorer, with three pages: **Ladder** (shortest ladders between any two words), **Clusters** (a pan-and-zoom map of every cluster) and **Findings** (the charts) |
| `web/clusters-standard.txt` | map data for "All word forms" (gzipped binary, base64), loaded by the Clusters page on demand; the dictionary-word map is embedded |
| `web/template.html`, `web/atlas.js` | page source and the cluster-map engine; `ladder.export_web` combines them with the data |

## Dictionary modes

- **strict**: dictionary headwords only. These are Wiktionary lemmas, plus nominatives whose case forms
  (‑ს, ‑მა, ‑ში, ‑ზე, ‑თან) are attested in the corpora. The graph is sparse: 15% of words are in the main component.
- **standard**: adds every inflected form attested in ≥ 3 independent sources. 36% of words are in the main
  component (67.8k words).

For the game, the recommendation is to draw start and target from strict and accept any standard word as a step.
See `reports/EDA.md` §5.

## Cluster map

A cluster is a connected component: a ladder joins any two of its words, and no ladder leaves it.
The Clusters page draws every cluster with two or more words. The largest is a disc in the middle and the
others are islands in rings around it, biggest first. Tap a word for its gloss, cluster and neighbours,
search for a word to fly to it, or use "Show on map" on the Ladder page to see a ladder as a route.

The layout is computed offline by `ladder/clusters.py`. The main cluster starts from a DrL force layout,
refined by a short Fruchterman–Reingold run, then spread evenly over a disc. Islands get their own
force layouts. To stay smooth on phones the page draws at most a few thousand words directly. Further
out it uses cached 256 px tiles and a 2048 px overview image. Labels are capped and picked by word frequency.

## Rebuild

```bash
pip install -r requirements.txt
scripts/fetch_sources.sh               # ~400 MB of raw sources into data/raw (git-ignored)
python -m ladder.build_wordlist        # -> data/words_all.tsv.gz        (~2 min)
python -m ladder.analyze               # -> data/game/*, reports/stats.json (~5 min)
python -m ladder.clusters              # -> data/game/*_clusters.tsv.gz (~3 min)
python -m ladder.export_web            # -> web/index.html, web/clusters-standard.txt
python -m http.server -d web           # the "All word forms" map is fetched, so open it over HTTP
```

Other CLI commands:

```bash
python -m ladder.cli path დღე ღამე --all          # list every shortest ladder
python -m ladder.cli neighbors ვაშლი --mode strict
```

From Python:

```python
from ladder.cli import load_graph
g = load_graph("standard")
g.shortest_path("ძაღლი", "კატა")       # ['ძაღლი', 'ძალი', 'ძალა', 'კალა', 'კატა']
g.count_shortest_paths("ქარი", "წვიმა")  # 35
```

## Sources and licences

- [GeoWordsDatabase](https://github.com/bumbeishvili/GeoWordsDatabase) by Dato Bumbeishvili (MIT), including its scraped 4.8M-string web list
- [akalongman/geo-words](https://github.com/akalongman/geo-words) (MIT)
- Hunspell `ka_GE` via [wooorm/dictionaries](https://github.com/wooorm/dictionaries) (MIT / CC-BY 4.0)
- [Crúbadán](http://crubadan.org/languages/ka) by Kevin Scannell (CC-BY 4.0)
- English Wiktionary, Georgian section, via [kaikki.org](https://kaikki.org/dictionary/Georgian/) (CC-BY-SA 4.0). Glosses and lemma links in `data/` come from here.
