"""Merge the raw Georgian word sources into one scored word table.

Output: data/words_all.tsv.gz with one row per normalised word:
    word, length, freq, n_sources, sources, wikt_lemma, paradigm, proper, pos, gloss, form_of, sensitive, tier

Tiers (see assign_tier):
    headword - a dictionary form: a Wiktionary lemma, or a noun/adjective/masdar in the
               nominative whose case forms (-ს, -მა, -ში, -ზე, ...) are attested in the corpora
    form     - any other word form (inflections, clitics) attested in >= 3 independent sources
    proper   - first names, surnames and place names
    rare     - attested, but too weakly to trust as a game word (typos, one-off forms)
"""
import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

import pandas as pd

# 33 letters of the modern Mkhedruli alphabet (U+10D0..U+10F0)
ALPHABET = "".join(chr(c) for c in range(0x10D0, 0x10F1))
LETTERS = set(ALPHABET)
VOWELS = set("აეიოუ")
MTAVRULI_SHIFT = 0x1C90 - 0x10D0  # Mtavruli capitals map 1:1 onto Mkhedruli

# GeoWordsDatabase source ids
GW_NAME_SOURCES = {36, 37}  # 2012 voter list: first names, surnames
GW_DICT_SUBCATEGORY = 28    # "ლექსიკონები" (dictionaries)
GW_EXTRA_DICT_SOURCES = {43}  # journalist's orthographic dictionary (filed under journalism)

# Wiktionary sense tags that keep a word out of generated puzzles
SENSITIVE_TAGS = {"vulgar", "offensive", "derogatory", "slur", "ethnic"}

# Common nouns that Wiktionary files only under "proper noun": the Sun, the Earth, months.
COMMON_NAMES = {"მზე", "დედამიწა", "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
                "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"}

# Case endings and postpositions that attach to the full (unsyncopated) noun stem but
# (almost) never to verb forms. Verb forms like გაშლი/გაშლის/გაშლით share -ი/-ის/-ით with
# nouns, and -ის/-ები/-იდან see syncope (წყალი -> წყლის), so those are not used.
NOUN_ENDINGS = ("ს", "მა", "ში", "ზე", "თან")
VOWEL_STEM_ENDINGS = ("ს", "მ", "ში", "ზე", "თან", "დან", "სთვის")


def normalise(token):
    """Lowercase Mtavruli, strip, and return the word if it is pure modern Georgian."""
    token = token.strip()
    token = "".join(
        chr(ord(ch) - MTAVRULI_SHIFT) if 0x1C90 <= ord(ch) <= 0x1CBA else ch for ch in token
    )
    if len(token) >= 2 and all(ch in LETTERS for ch in token):
        return token
    return None


def sql_tuples(path, table, pattern):
    regex = re.compile(pattern)
    prefix = f"INSERT INTO `{table}` VALUES "
    with open(path, encoding="utf8") as fh:
        for line in fh:
            if line.startswith(prefix):
                yield from regex.findall(line)


def load_geowords(raw):
    sql = raw / "GeoWordsDatabase" / "geowords_310000.sql"
    sub_of = {int(i): int(sub) for i, _, sub in sql_tuples(sql, "sources", r"\((\d+),'((?:[^'\\]|\\.)*)',(\d+)\)")}
    dict_sources = {s for s, sub in sub_of.items() if sub == GW_DICT_SUBCATEGORY} | GW_EXTRA_DICT_SOURCES

    id_to_word = {}
    for wid, geo, _ in sql_tuples(sql, "words", r"\((\d+),'((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\)"):
        id_to_word[int(wid)] = geo

    corpus, dictionary, names = defaultdict(int), set(), set()
    for _, wid, sid, qty in sql_tuples(sql, "words_history", r"\((\d+),(\d+),(\d+),(\d+)\)"):
        word = normalise(id_to_word.get(int(wid), ""))
        if not word:
            continue
        sid = int(sid)
        if sid in GW_NAME_SOURCES:
            names.add(word)
        elif sid in dict_sources:
            dictionary.add(word)
        else:
            corpus[word] += int(qty)
    return corpus, dictionary, names


def load_counts(path, sep=None):
    counts = defaultdict(int)
    with open(path, encoding="utf8", errors="replace") as fh:
        for line in fh:
            parts = line.split(sep)
            if len(parts) < 2:
                continue
            word = normalise(parts[0])
            if word:
                try:
                    counts[word] += int(parts[1])
                except ValueError:
                    pass
    return counts


def load_hunspell(path):
    words = set()
    with open(path, encoding="utf8") as fh:
        next(fh)  # entry count
        for line in fh:
            if line.lstrip().startswith("#"):
                continue
            word = normalise(line.split("/")[0])
            if word:
                words.add(word)
    return words


def load_wiktionary(path):
    """Return ({lemma: (pos, gloss)}, {inflected form: "lemma (tags)"}, proper names, vulgar words).

    Alternative spellings (alt-of, e.g. სხალი for მსხალი) count as lemmas; inflected
    forms (form-of entries and declension-table cells) map back to their lemma.
    """
    lemmas, form_of, names, sensitive = {}, {}, set(), set()
    skip_pos = {"character", "symbol", "suffix", "prefix", "circumfix", "interfix", "preverb"}
    with open(path, encoding="utf8") as fh:
        for line in fh:
            entry = json.loads(line)
            pos = entry.get("pos")
            word = normalise(entry.get("word", ""))
            if not word or pos in skip_pos:
                continue
            senses = entry.get("senses", [])
            if pos == "name":
                if word not in COMMON_NAMES:
                    names.add(word)
                    continue
                pos = "noun"
            if senses and all("form-of" in s.get("tags", []) for s in senses):
                base = (senses[0].get("form_of") or [{}])[0].get("word", "")
                form_of.setdefault(word, base)
                continue
            gloss = next((g for s in senses for g in s.get("glosses", [])), "")
            if word not in lemmas or not lemmas[word][1]:
                lemmas[word] = (pos, gloss[:120])
            if senses and SENSITIVE_TAGS & set(senses[0].get("tags", [])):  # main sense only: ძაღლი stays
                sensitive.add(word)
            for f in entry.get("forms", []):
                fw = normalise(f.get("form", ""))
                tags = [t for t in f.get("tags", []) if t not in ("table-tags", "inflection-template")]
                if fw and fw != word and "romanization" not in tags:
                    form_of.setdefault(fw, f"{word} ({' '.join(tags)})" if tags else word)
    return lemmas, form_of, names, sensitive


def is_nominative_lemma(w, attested):
    """Heuristic: w is the dictionary (nominative) form of a declinable word.

    Consonant stems: ვაშლ-ი has ვაშლ-ს, ვაშლ-მა, ვაშლ-ში, ...
    Vowel stems:     დედა has დედა-ს, დედა-მ, დედა-ში, ...
    At least two noun-only endings must be attested (one is not enough: verb forms such as
    გაიტანე have გაიტანეს), and plural / extended case forms (ვაშლები, ვაშლისა) are rejected.
    """
    if len(w) < 3 or w[-1] not in VOWELS or w.endswith(("ები", "იი")):
        return False  # plurals; სტუდიი is სტუდია's genitive stem, not a word
    if w[-1] == "ა" and w[-2] in "სთდ" and w[:-1] in attested:
        return False  # emphatic extension of a case form: ვაშლისა, ვაშლითა
    if w[-1] == "ი" and w[-2] not in VOWELS:
        stem = w[:-1]
        hits = sum(stem + e in attested for e in NOUN_ENDINGS)
    else:  # vowel stem; also catches fake nominatives such as ღელეი built on ღელე
        hits = sum(w + e in attested for e in VOWEL_STEM_ENDINGS)
    return hits >= 2


REPEATED_LETTER = re.compile(r"(.)\1\1")


def looks_like_word(w):
    """Reject abbreviations (კმ, მლნ: no vowel) and drawn-out interjections (ეეე, აჰჰჰ)."""
    return any(ch in VOWELS for ch in w) and not REPEATED_LETTER.search(w) and not (len(w) == 2 and w[0] == w[1])


def assign_tier(row):
    if not looks_like_word(row.word):
        return "rare"
    if row.wikt_lemma:
        return "headword"
    if row.proper:
        return "proper"
    if row.paradigm and row.n_sources >= 3 and row.freq >= 10:
        return "headword"
    # Short forms outside Wiktionary are mostly clipped stems and abbreviations (სხვ, ოქტ, ხელ).
    if row.n_sources >= 3 and (row.length >= 4 or "wikt" in row.sources):
        return "form"
    return "rare"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", type=Path, default=Path(__file__).resolve().parent.parent / "data" / "raw")
    ap.add_argument("--out", type=Path, default=Path(__file__).resolve().parent.parent / "data")
    args = ap.parse_args()
    raw = args.raw

    print("loading GeoWordsDatabase ...")
    gw_corpus, gw_dict, gw_names = load_geowords(raw)
    print("loading web scrape ...")
    web = load_counts(raw / "scraped" / "allwords-unique-sorted.txt", sep="\t")
    print("loading crubadan, geo-words, hunspell, wiktionary ...")
    crub = load_counts(raw / "GeoWordsDatabase" / "DifferentDatasets" / "crubadan" / "ka-words.txt")
    nplg = load_counts(raw / "geo-words" / "dictionary" / "txt" / "ka_GE.txt")
    hun = load_hunspell(raw / "hun_index.dic")
    wikt, wikt_form_of, wikt_names, wikt_sensitive = load_wiktionary(raw / "kaikki_ka.jsonl")

    # A web-scrape hit only counts as evidence if the form recurs (single hits are mostly typos).
    # "dict" is every word printed in a GeoWords dictionary text (headwords AND definitions),
    # so it is evidence of existence, not of being a headword.
    families = {
        "dict": gw_dict,
        "wikt": set(wikt) | set(wikt_form_of),
        "gw": set(gw_corpus),
        "hun": hun,
        "nplg": set(nplg),
        "crub": set(crub),
        "web": {w for w, c in web.items() if c >= 3},
    }
    vocab = set().union(*families.values())
    print(f"vocabulary (any source): {len(vocab):,}")

    n_sources = {w: sum(w in s for s in families.values()) for w in vocab}
    attested = {w for w, n in n_sources.items() if n >= 2}
    proper = (gw_names | wikt_names) - set(wikt)

    rows = []
    for w in vocab:
        srcs = [name for name, s in families.items() if w in s]
        pos, gloss = wikt.get(w, ("", ""))
        rows.append(
            (w, len(w), web.get(w, 0) + crub.get(w, 0) + gw_corpus.get(w, 0), len(srcs), ",".join(srcs),
             w in wikt, is_nominative_lemma(w, attested), w in proper, pos, gloss, wikt_form_of.get(w, ""),
             w in wikt_sensitive)
        )
    df = pd.DataFrame(rows, columns=["word", "length", "freq", "n_sources", "sources", "wikt_lemma",
                                     "paradigm", "proper", "pos", "gloss", "form_of", "sensitive"])
    df["tier"] = df.apply(assign_tier, axis=1)
    df = df.sort_values(["freq", "word"], ascending=[False, True]).reset_index(drop=True)

    args.out.mkdir(parents=True, exist_ok=True)
    df.to_csv(args.out / "words_all.tsv.gz", sep="\t", index=False, compression="gzip")
    print(df.tier.value_counts())
    print(df.groupby("tier").length.describe())


if __name__ == "__main__":
    main()
