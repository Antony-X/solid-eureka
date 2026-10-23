#!/usr/bin/env bash
# Download the raw Georgian word sources into data/raw (git-ignored).
set -euo pipefail

RAW="${1:-$(dirname "$0")/../data/raw}"
mkdir -p "$RAW"
cd "$RAW"

# 1. GeoWordsDatabase (MIT): ~310k words with per-source counts, plus a 4.8M-word web scrape
[ -d GeoWordsDatabase ] || git clone --depth 1 https://github.com/bumbeishvili/GeoWordsDatabase.git
[ -f scraped/allwords-unique-sorted.txt ] || unzip -o -q \
  GeoWordsDatabase/DifferentDatasets/Scraped/allwords-unique-sorted.txt.zip -d scraped

# 2. akalongman/geo-words (MIT): ~193k words (crubadan + National Parliamentary Library dictionary + ebooks)
[ -d geo-words ] || git clone --depth 1 https://github.com/akalongman/geo-words.git

# 3. Hunspell ka_GE spell-check dictionary (MIT / CC-BY 4.0)
curl -sSL -o hun_index.dic https://raw.githubusercontent.com/wooorm/dictionaries/main/dictionaries/ka/index.dic
curl -sSL -o hun_index.aff https://raw.githubusercontent.com/wooorm/dictionaries/main/dictionaries/ka/index.aff

# 4. English Wiktionary, Georgian section, machine-readable (kaikki.org / wiktextract, CC-BY-SA)
curl -sSL -o kaikki_ka.jsonl https://kaikki.org/dictionary/Georgian/kaikki.org-dictionary-Georgian.jsonl

ls -la "$RAW"
