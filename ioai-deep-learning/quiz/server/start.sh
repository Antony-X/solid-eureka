#!/bin/sh
# ML Quiz Battle: starts the server and a public Cloudflare link (needs Python 3 and cloudflared)
cd "$(dirname "$0")"
python3 quiz_server.py --tunnel
