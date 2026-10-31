"""Assemble the slide deck into one self-contained HTML file.

    python tools/build.py            # the main (lean) deck: lecture.html, following src/LEAN.json
    python tools/build.py --full     # every slide: lecture-full.html

lecture.html is a complete document that works offline (fonts are embedded).
build/lecture.artifact.html is the same page without <!doctype>/<html>/<head>/<body>,
which is the form the claude.ai Artifact host expects.
"""
import base64
import pathlib
import re
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
FONT_DIR = ROOT / "tools" / "fonts"
TITLE = "Neural Networks, Hands-On"

# (css family, google query, weight/style descriptors we want)
FONTS = [
    ("Archivo", "Archivo:wdth,wght@62..125,400..900"),
    ("Atkinson Hyperlegible Next", "Atkinson+Hyperlegible+Next:ital,wght@0,400;0,700;1,400"),
    ("JetBrains Mono", "JetBrains+Mono:wght@400;600"),
    ("STIX Two Text", "STIX+Two+Text:ital,wght@0,400;1,400"),
]
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def font_css():
    """Return @font-face rules with the latin woff2 files inlined as data URIs."""
    FONT_DIR.mkdir(parents=True, exist_ok=True)
    rules = []
    for family, query in FONTS:
        cache = FONT_DIR / (family.replace(" ", "_") + ".css")
        if not cache.exists():
            css = fetch(f"https://fonts.googleapis.com/css2?family={query}&display=swap").decode()
            cache.write_text(css)
        css = cache.read_text()
        # keep only the latin subset; variable fonts serve several weights from one
        # file, so merge blocks that share a file into one rule with a weight range
        merged = {}
        for block in re.findall(r"/\* latin \*/\s*(@font-face\s*{[^}]*})", css):
            url = re.search(r"url\((https://[^)]+\.woff2)\)", block).group(1)
            weights = [int(w) for w in re.search(r"font-weight:\s*([\d ]+);", block).group(1).split()]
            if url in merged:
                merged[url][1].extend(weights)
            else:
                merged[url] = [block, weights]
        for url, (block, weights) in merged.items():
            fname = FONT_DIR / (family.replace(" ", "_") + "-" + url.rsplit("/", 1)[-1])
            if not fname.exists():
                fname.write_bytes(fetch(url))
            data = base64.b64encode(fname.read_bytes()).decode()
            block = re.sub(r"font-weight:\s*[\d ]+;", f"font-weight: {min(weights)} {max(weights)};", block)
            rules.append(block.replace(url, "data:font/woff2;base64," + data))
    return "\n".join(rules)


def read(p):
    return pathlib.Path(p).read_text(encoding="utf-8")


def main():
    # --only a.js,b.js   build just these section files (for testing one section)
    # --out path.html    write the full document there instead of lecture.html
    argv = sys.argv[1:]
    only = argv[argv.index("--only") + 1].split(",") if "--only" in argv else None
    out = pathlib.Path(argv[argv.index("--out") + 1]) if "--out" in argv else None
    css = font_css() + "\n" + read(SRC / "engine.css")
    libs = [SRC / "lib" / n for n in ("nn.js", "plot.js", "ui.js", "code.js", "widgets.js") if (SRC / "lib" / n).exists()]
    libs += sorted((SRC / "data").glob("*.js"))
    sections = sorted((SRC / "sections").glob("*.js"))
    if only:
        sections = [p for p in sections if p.name in only]
    scripts = [read(p) for p in libs] + [read(SRC / "engine.js")]
    # the main deck follows src/LEAN.json (a shorter selection); --full keeps every slide
    full_deck = "--full" in argv or only is not None
    if not full_deck and (SRC / "LEAN.json").exists():
        scripts.append("Deck.plan = " + read(SRC / "LEAN.json") + ";")
    scripts += [f"/* ===== {p.name} ===== */\ntry {{\n{read(p)}\n}} catch (e) {{ console.error('section {p.name} failed', e); }}" for p in sections]
    scripts.append("Deck.start();")
    js = "\n\n".join(scripts).replace("</script", "<\\/script")

    head = (
        f"<title>{TITLE}</title>\n"
        '<meta name="claude:viewport-fit-sides" content="cover">\n'
        '<meta name="description" content="A 3-hour visual lecture on neural networks for olympiad training">\n'
        f"<style>\n{css}\n</style>\n"
    )
    defs = ('<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'
            '<marker id="ah-ink" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="5" markerHeight="5" markerUnits="strokeWidth" orient="auto-start-reverse">'
            '<path d="M0,0 L12,6 L0,12 z" style="fill:var(--ink)"/></marker>'
            '<marker id="ah-grad" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="5" markerHeight="5" markerUnits="strokeWidth" orient="auto-start-reverse">'
            '<path d="M1,1 L11,6 L1,11" style="fill:none;stroke:var(--grad);stroke-width:2.2;stroke-linejoin:round"/></marker>'
            '</defs></svg>\n')
    body = defs + f'<div id="deck" role="application" aria-label="Slides"></div>\n<script>\n{js}\n</script>\n'

    full = (
        "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        + head + "</head>\n<body>\n" + body + "</body>\n</html>\n"
    )
    if out:
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(full, encoding="utf-8")
        print(f"{out}: {len(full.encode()) / 1024:.0f} KB, {len(sections)} section files")
        return
    name = "lecture-full" if full_deck else "lecture"
    (ROOT / f"{name}.html").write_text(full, encoding="utf-8")
    (ROOT / "build").mkdir(exist_ok=True)
    (ROOT / "build" / f"{name}.artifact.html").write_text(head + body, encoding="utf-8")
    kb = len(full.encode()) / 1024
    print(f"{name}.html: {kb:.0f} KB, {len(sections)} section files")


if __name__ == "__main__":
    sys.exit(main())
