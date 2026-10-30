"""Make a contact sheet from slide screenshots.

    python tools/sheet.py OUT.png shot1.png shot2.png ... [--cols 2] [--width 960]
"""
import sys
from PIL import Image, ImageDraw

args = sys.argv[1:]
cols = 2
width = 960
if "--cols" in args:
    i = args.index("--cols"); cols = int(args[i + 1]); del args[i:i + 2]
if "--width" in args:
    i = args.index("--width"); width = int(args[i + 1]); del args[i:i + 2]
out, files = args[0], args[1:]
ims = [Image.open(f).convert("RGB") for f in files]
h = int(width * 9 / 16)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * width + (cols - 1) * 8, rows * h + (rows - 1) * 8), (120, 120, 120))
d = ImageDraw.Draw(sheet)
for k, (im, f) in enumerate(zip(ims, files)):
    im = im.resize((width, h), Image.LANCZOS)
    x, y = (k % cols) * (width + 8), (k // cols) * (h + 8)
    sheet.paste(im, (x, y))
    d.rectangle([x, y, x + 150, y + 22], fill=(0, 0, 0))
    d.text((x + 4, y + 4), f.split("/")[-1], fill=(255, 255, 0))
sheet.save(out)
print(out, sheet.size)
