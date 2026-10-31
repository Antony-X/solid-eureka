# ML Quiz Battle

A Kahoot-style quiz that runs on your own computer. Students scan a QR code and answer on their phones.
The projector screen shows the questions and the leaderboard. The admin panel shows everyone's progress
and lets you edit, add, select and shuffle questions (saved to `questions.json`). Results are saved as CSV in `results/`.

## Start (2 minutes)

1. Install **Python 3** (any recent version, nothing else needed) and **cloudflared**
   (Windows: `winget install --id Cloudflare.cloudflared`; Mac: `brew install cloudflared`).
2. Double-click `start.bat` (Windows) or run `./start.sh` (Mac/Linux).
   Without cloudflared: `python quiz_server.py` (then only devices on the same Wi-Fi can join).
3. The window prints the links after ~10 seconds:
   - **Students join:** the QR on the presenter screen points here.
   - **Presenter screen + controls:** `…/screen?key=…` — open it on the laptop that is projected (→ next, R reveal, L scores).
   - **Admin panel:** `…/admin?key=…` — progress grid, game buttons, question editor.
   Links with `?key=` give full control: share them only with your co-host.
4. Keep the window open during the game. A new tunnel link is created each time you start.

## During the game

Admin panel → **Start** → each question closes by itself when time is up or everyone answered →
**Scores** (optional) → **Next →** … → final podium + topic report with a recommendation
(“ready for neural networks” / “short recap first” / “stay with classical ML”).
**New game (keep players)** replays with the same players; **Questions** tab → pick easy / medium / hard or tick questions, shuffle, edit, add.
