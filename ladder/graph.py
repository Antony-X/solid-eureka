"""Word-ladder graph: words are nodes, an edge joins two words at Levenshtein distance 1
(substitute, insert or delete exactly one letter)."""
import gzip
from collections import defaultdict, deque
from pathlib import Path

import pandas as pd

DATA = Path(__file__).resolve().parent.parent / "data"


def edit_edges(words):
    """Yield (u, v, op) for every pair of words at Levenshtein distance 1.

    Substitutions: words sharing a wildcard pattern such as "ვა*ლი".
    Insertions/deletions: deleting one letter of a word gives another word.
    Runs in O(total letters) instead of O(n^2) pair comparisons.
    """
    words = set(words)
    buckets = defaultdict(list)
    for w in words:
        for i in range(len(w)):
            buckets[w[:i] + "*" + w[i + 1:]].append(w)
    for group in buckets.values():
        for a in range(len(group)):
            for b in range(a + 1, len(group)):
                yield group[a], group[b], "sub"
    for w in words:
        seen = set()
        for i in range(len(w)):
            d = w[:i] + w[i + 1:]
            if d in words and d not in seen:
                seen.add(d)
                yield d, w, "ins"


class WordGraph:
    def __init__(self, words, edges=None):
        self.words = set(words)
        self.adj = {w: [] for w in self.words}
        self.ops = {}
        for u, v, op in edges if edges is not None else edit_edges(self.words):
            self.adj[u].append(v)
            self.adj[v].append(u)
            self.ops[(u, v)] = self.ops[(v, u)] = op

    @classmethod
    def from_tier(cls, tiers=("lemma",), min_len=2, max_len=99):
        df = load_words()
        df = df[df.tier.isin(tiers) & df.length.between(min_len, max_len)]
        return cls(df.word)

    def __len__(self):
        return len(self.words)

    def n_edges(self):
        return sum(len(n) for n in self.adj.values()) // 2

    def bfs(self, source):
        """Distances and parent lists (for enumerating all shortest paths) from source."""
        dist, parents = {source: 0}, {source: []}
        queue = deque([source])
        while queue:
            u = queue.popleft()
            for v in self.adj[u]:
                if v not in dist:
                    dist[v] = dist[u] + 1
                    parents[v] = [u]
                    queue.append(v)
                elif dist[v] == dist[u] + 1:
                    parents[v].append(u)
        return dist, parents

    def shortest_path(self, a, b):
        """One shortest ladder from a to b via bidirectional BFS, or None if unreachable."""
        if a not in self.words or b not in self.words:
            raise KeyError(f"not in dictionary: {[w for w in (a, b) if w not in self.words]}")
        if a == b:
            return [a]
        start = a
        prev, nxt = {a: None}, {b: None}
        front_a, front_b = [a], [b]
        while front_a and front_b:
            if len(front_a) > len(front_b):  # always expand the smaller frontier
                front_a, front_b, prev, nxt = front_b, front_a, nxt, prev
            new_front = []
            for u in front_a:
                for v in self.adj[u]:
                    if v in prev:
                        continue
                    prev[v] = u
                    if v in nxt:
                        path = self._join(v, prev, nxt)
                        return path if path[0] == start else path[::-1]
                    new_front.append(v)
            front_a = new_front
        return None

    @staticmethod
    def _join(meet, prev, nxt):
        left, x = [], meet
        while x is not None:
            left.append(x)
            x = prev[x]
        right, x = [], nxt[meet]
        while x is not None:
            right.append(x)
            x = nxt[x]
        return left[::-1] + right

    def all_shortest_paths(self, a, b, limit=1000):
        dist, parents = self.bfs(a)
        if b not in dist:
            return []
        paths, stack = [], [(b, [b])]
        while stack and len(paths) < limit:
            node, path = stack.pop()
            if node == a:
                paths.append(path[::-1])
                continue
            for p in parents[node]:
                stack.append((p, path + [p]))
        return paths

    def count_shortest_paths(self, a, b):
        dist, parents = self.bfs(a)
        if b not in dist:
            return 0
        order = sorted(dist, key=dist.get)
        count = {a: 1}
        for v in order[1:]:
            count[v] = sum(count[p] for p in parents[v])
        return count[b]

    def components(self):
        seen, comps = set(), []
        for w in self.words:
            if w in seen:
                continue
            comp, queue = [], deque([w])
            seen.add(w)
            while queue:
                u = queue.popleft()
                comp.append(u)
                for v in self.adj[u]:
                    if v not in seen:
                        seen.add(v)
                        queue.append(v)
            comps.append(comp)
        return sorted(comps, key=len, reverse=True)

    def save_edges(self, path):
        with gzip.open(path, "wt", encoding="utf8") as fh:
            fh.write("source\ttarget\top\n")
            for u, nbrs in self.adj.items():
                for v in nbrs:
                    if u < v:
                        fh.write(f"{u}\t{v}\t{self.ops[(u, v)]}\n")


def load_words():
    return pd.read_csv(DATA / "words_all.tsv.gz", sep="\t", keep_default_na=False)


def describe_step(a, b):
    """Human-readable description of the single edit turning a into b."""
    if len(a) == len(b):
        i = next(i for i in range(len(a)) if a[i] != b[i])
        return f"{a[i]}→{b[i]} (position {i + 1})"
    if len(b) > len(a):
        i = next((i for i in range(len(a)) if a[i] != b[i]), len(a))
        return f"+{b[i]} (insert at {i + 1})"
    i = next((i for i in range(len(b)) if a[i] != b[i]), len(b))
    return f"-{a[i]} (delete at {i + 1})"
