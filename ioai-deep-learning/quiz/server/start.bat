@echo off
REM ML Quiz Battle: starts the server and a public Cloudflare link (needs Python and cloudflared)
cd /d "%~dp0"
python quiz_server.py --tunnel
pause
