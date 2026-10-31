"""ML Quiz Battle: a tiny Kahoot-style quiz server for the classroom.

    python quiz_server.py                 # port 8000, prints the join link and the admin link
    python quiz_server.py --port 8080 --key mysecret --public-url https://xyz.trycloudflare.com

Only the Python standard library is used. Students open the join link (or scan the QR on
the projector screen) on the same Wi-Fi. For other networks run a Cloudflare tunnel:
    cloudflared tunnel --url http://localhost:8000
and paste the https://….trycloudflare.com address into the admin panel's "Join link".
"""
import argparse
import csv
import re
import shutil
import subprocess
import json
import os
import random
import socket
import string
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(HERE, "static")
QFILE = os.path.join(HERE, "questions.json")
RESULTS = os.path.join(HERE, "results")

LOCK = threading.RLock()
STATE = {
    "questions": [],      # the bank (editable in the admin panel)
    "order": [],          # indices of the questions in this game
    "players": {},        # pid -> {nick, joined, answers: {qid: {choice, ms, correct, points}}}
    "phase": "lobby",     # lobby | question | reveal | leaderboard | final
    "pos": 0,             # position in order
    "started": 0.0,       # time the current question opened
    "version": 0,
    "join_url": "",
    "game_id": "",
}
KEY = ""


def now():
    return time.time()


def bump():
    STATE["version"] += 1


def load_questions():
    try:
        with open(QFILE, encoding="utf-8") as f:
            qs = json.load(f)
    except (OSError, ValueError):
        qs = []
    clean = []
    for i, q in enumerate(qs):
        opts = [str(o) for o in q.get("options", [])][:4]
        if not q.get("text") or len(opts) < 2:
            continue
        clean.append({
            "id": str(q.get("id") or f"q{i + 1:02d}"),
            "text": str(q["text"]),
            "options": opts,
            "correct": max(0, min(len(opts) - 1, int(q.get("correct", 0)))),
            "topic": str(q.get("topic", "General")),
            "difficulty": q.get("difficulty", "medium") if q.get("difficulty") in ("easy", "medium", "hard") else "medium",
            "time": max(5, min(120, int(q.get("time", 20)))),
            "explain": str(q.get("explain", "")),
        })
    return clean


def save_questions():
    with open(QFILE, "w", encoding="utf-8") as f:
        json.dump(STATE["questions"], f, ensure_ascii=False, indent=1)


def new_game(keep_players=True):
    STATE["phase"] = "lobby"
    STATE["pos"] = 0
    STATE["started"] = 0.0
    STATE["game_id"] = "".join(random.choice(string.ascii_lowercase) for _ in range(6))
    if not STATE["order"] or any(i >= len(STATE["questions"]) for i in STATE["order"]):
        STATE["order"] = list(range(len(STATE["questions"])))
    if keep_players:
        for p in STATE["players"].values():
            p["answers"] = {}
    else:
        STATE["players"] = {}
    bump()


def current_q():
    if STATE["phase"] in ("question", "reveal", "leaderboard") and STATE["pos"] < len(STATE["order"]):
        return STATE["questions"][STATE["order"][STATE["pos"]]]
    return None


def points(q, ms):
    limit = q["time"] * 1000
    return int(round(1000 - 500 * min(ms, limit) / limit))


def tick():
    """Close the question when its time is up or everyone has answered."""
    q = current_q()
    if STATE["phase"] != "question" or not q:
        return
    elapsed = now() - STATE["started"]
    answered = sum(1 for p in STATE["players"].values() if q["id"] in p["answers"])
    if elapsed >= q["time"] + 0.5 or (STATE["players"] and answered >= len(STATE["players"])):
        STATE["phase"] = "reveal"
        bump()


def score(p):
    return sum(a["points"] for a in p["answers"].values())


def ranking():
    rows = [{"pid": pid, "nick": p["nick"], "score": score(p),
             "right": sum(1 for a in p["answers"].values() if a["correct"]),
             "answered": len(p["answers"])} for pid, p in STATE["players"].items()]
    rows.sort(key=lambda r: (-r["score"], r["nick"].lower()))
    for i, r in enumerate(rows):
        r["rank"] = i + 1
    return rows


def distribution(q):
    d = [0] * len(q["options"])
    for p in STATE["players"].values():
        a = p["answers"].get(q["id"])
        if a and 0 <= a["choice"] < len(d):
            d[a["choice"]] += 1
    return d


def topic_report():
    played = [STATE["questions"][i] for i in STATE["order"][:STATE["pos"] + 1]] if STATE["phase"] != "lobby" else []
    topics = {}
    for q in played:
        t = topics.setdefault(q["topic"], {"right": 0, "total": 0})
        for p in STATE["players"].values():
            a = p["answers"].get(q["id"])
            if a is not None:
                t["total"] += 1
                t["right"] += 1 if a["correct"] else 0
    right = sum(t["right"] for t in topics.values())
    total = sum(t["total"] for t in topics.values())
    overall = right / total if total else None
    weak = sorted([k for k, t in topics.items() if t["total"] and t["right"] / t["total"] < 0.6],
                  key=lambda k: topics[k]["right"] / topics[k]["total"])
    if overall is None:
        verdict = {"level": "none", "head": "No answers yet", "body": ""}
    elif overall >= 0.7:
        verdict = {"level": "go", "head": "Ready for neural networks",
                   "body": ("Quick reminder first: " + ", ".join(weak) + ".") if weak else "Classical ML looks solid."}
    elif overall >= 0.45:
        verdict = {"level": "mix", "head": "Short recap, then neural networks",
                   "body": "Spend 10–15 minutes on: " + (", ".join(weak) or "the weakest topics") + "."}
    else:
        verdict = {"level": "stay", "head": "Stay with classical ML today",
                   "body": "Review: " + (", ".join(weak) or "the basics") + "."}
    return {"topics": topics, "overall": overall, "verdict": verdict}


def save_results():
    os.makedirs(RESULTS, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    qs = [STATE["questions"][i] for i in STATE["order"]]
    with open(os.path.join(RESULTS, f"results-{stamp}.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["rank", "nick", "score", "correct"] + [q["id"] for q in qs])
        for r in ranking():
            p = STATE["players"][r["pid"]]
            cells = []
            for q in qs:
                a = p["answers"].get(q["id"])
                cells.append("" if a is None else ("1" if a["correct"] else "0"))
            w.writerow([r["rank"], r["nick"], r["score"], r["right"]] + cells)


# ---------------------------------------------------------------- views
def public_question(q, reveal):
    d = {"id": q["id"], "text": q["text"], "options": q["options"], "topic": q["topic"],
         "difficulty": q["difficulty"], "time": q["time"]}
    if reveal:
        d["correct"] = q["correct"]
        d["explain"] = q["explain"]
    return d


def common_view():
    tick()
    q = current_q()
    reveal = STATE["phase"] in ("reveal", "leaderboard")
    v = {"phase": STATE["phase"], "version": STATE["version"], "game_id": STATE["game_id"],
         "pos": STATE["pos"], "total": len(STATE["order"]), "players": len(STATE["players"])}
    if q:
        v["q"] = public_question(q, reveal)
        v["left"] = max(0.0, q["time"] - (now() - STATE["started"])) if STATE["phase"] == "question" else 0
        v["answered"] = sum(1 for p in STATE["players"].values() if q["id"] in p["answers"])
        if reveal:
            v["dist"] = distribution(q)
    return v


def player_view(pid):
    v = common_view()
    p = STATE["players"].get(pid)
    v["joined"] = p is not None
    if p:
        v["nick"] = p["nick"]
        v["score"] = score(p)
        q = current_q()
        if q:
            a = p["answers"].get(q["id"])
            v["mine"] = None if a is None else {"choice": a["choice"], "correct": a["correct"] if STATE["phase"] != "question" else None,
                                                  "points": a["points"] if STATE["phase"] != "question" else None}
        if STATE["phase"] in ("reveal", "leaderboard", "final"):
            r = next((x for x in ranking() if x["pid"] == pid), None)
            if r:
                v["rank"], v["right"] = r["rank"], r["right"]
    return v


def screen_view():
    v = common_view()
    v["join_url"] = STATE["join_url"]
    v["nicks"] = [p["nick"] for p in STATE["players"].values()]
    if STATE["phase"] in ("leaderboard", "final", "reveal"):
        v["ranking"] = [{k: r[k] for k in ("nick", "score", "right", "rank")} for r in ranking()[:10]]
    if STATE["phase"] == "final":
        v["report"] = topic_report()
    return v


def admin_view():
    v = screen_view()
    v["questions"] = STATE["questions"]
    v["order"] = STATE["order"]
    v["ranking"] = ranking()
    v["progress"] = {pid: {qid: (1 if a["correct"] else 0) for qid, a in p["answers"].items()} for pid, p in STATE["players"].items()}
    v["report"] = topic_report()
    return v


# ---------------------------------------------------------------- actions
def admin_action(body):
    a = body.get("action")
    if a == "start":
        if not STATE["order"]:
            return {"error": "No questions selected"}
        STATE["pos"] = 0
        open_question()
    elif a == "reveal" and STATE["phase"] == "question":
        STATE["phase"] = "reveal"
    elif a == "leaderboard" and STATE["phase"] in ("reveal", "question"):
        STATE["phase"] = "leaderboard"
    elif a == "next":
        if STATE["phase"] == "question":
            STATE["phase"] = "reveal"
        elif STATE["pos"] + 1 < len(STATE["order"]):
            STATE["pos"] += 1
            open_question()
        else:
            STATE["phase"] = "final"
            save_results()
    elif a == "final":
        STATE["phase"] = "final"
        save_results()
    elif a == "reset":
        new_game(keep_players=True)
    elif a == "clear":
        new_game(keep_players=False)
    elif a == "kick":
        STATE["players"].pop(body.get("pid", ""), None)
    elif a == "order":
        idx = [int(i) for i in body.get("order", []) if 0 <= int(i) < len(STATE["questions"])]
        STATE["order"] = idx
        if STATE["phase"] == "lobby":
            STATE["pos"] = 0
    elif a == "join_url":
        STATE["join_url"] = str(body.get("url", "")).strip()[:300]
    else:
        return {"error": "unknown action"}
    bump()
    return {"ok": True}


def open_question():
    STATE["phase"] = "question"
    STATE["started"] = now()


def set_questions(qs):
    old_ids = [q["id"] for q in STATE["questions"]]
    tmp = QFILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(qs, f)
    os.replace(tmp, QFILE)
    STATE["questions"] = load_questions()
    save_questions()
    # keep the game order meaningful: map old selections by id, add new questions at the end
    sel = {old_ids[i] for i in STATE["order"] if i < len(old_ids)}
    ids = [q["id"] for q in STATE["questions"]]
    STATE["order"] = [i for i, qid in enumerate(ids) if qid in sel or qid not in old_ids]
    bump()


# ---------------------------------------------------------------- http
class Handler(BaseHTTPRequestHandler):
    server_version = "MLQuiz/1.0"

    def log_message(self, *a):
        pass

    def send(self, code, body, ctype="application/json"):
        data = body if isinstance(body, bytes) else json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def file(self, name, ctype):
        try:
            with open(os.path.join(STATIC, name), "rb") as f:
                self.send(200, f.read(), ctype)
        except OSError:
            self.send(404, {"error": "not found"})

    def body(self):
        n = int(self.headers.get("Content-Length") or 0)
        if n > 2_000_000:
            return {}
        try:
            return json.loads(self.rfile.read(n) or b"{}")
        except ValueError:
            return {}

    def is_admin(self, qs):
        return KEY and (qs.get("key", [""])[0] == KEY or self.headers.get("X-Key") == KEY)

    def do_GET(self):
        u = urlparse(self.path)
        qs = parse_qs(u.query)
        path = u.path
        if path in ("/", "/play"):
            return self.file("player.html", "text/html; charset=utf-8")
        if path == "/screen":
            return self.file("screen.html", "text/html; charset=utf-8")
        if path == "/admin":
            if not self.is_admin(qs):
                return self.send(403, b"<h1>Admin key missing or wrong</h1><p>Use the admin link printed in the terminal.</p>", "text/html")
            return self.file("admin.html", "text/html; charset=utf-8")
        if path.startswith("/static/"):
            name = os.path.basename(path)
            ctype = "text/css" if name.endswith(".css") else "application/javascript" if name.endswith(".js") else "application/octet-stream"
            return self.file(name, ctype)
        with LOCK:
            if path == "/api/state":
                return self.send(200, player_view(qs.get("pid", [""])[0]))
            if path == "/api/screen":
                return self.send(200, screen_view())
            if path == "/api/admin":
                if not self.is_admin(qs):
                    return self.send(403, {"error": "forbidden"})
                return self.send(200, admin_view())
        self.send(404, {"error": "not found"})

    def do_POST(self):
        u = urlparse(self.path)
        qs = parse_qs(u.query)
        b = self.body()
        with LOCK:
            if u.path == "/api/join":
                nick = " ".join(str(b.get("nick", "")).split())[:20]
                if not nick:
                    return self.send(400, {"error": "Type a nickname"})
                pid = str(b.get("pid") or "")
                if pid in STATE["players"]:
                    STATE["players"][pid]["nick"] = nick
                else:
                    pid = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(12))
                    STATE["players"][pid] = {"nick": nick, "joined": now(), "answers": {}}
                bump()
                return self.send(200, {"pid": pid})
            if u.path == "/api/answer":
                tick()
                p = STATE["players"].get(str(b.get("pid", "")))
                q = current_q()
                if not p or not q or STATE["phase"] != "question":
                    return self.send(409, {"error": "Too late"})
                if q["id"] in p["answers"] or str(b.get("qid")) != q["id"]:
                    return self.send(409, {"error": "Already answered"})
                choice = int(b.get("choice", -1))
                if not 0 <= choice < len(q["options"]):
                    return self.send(400, {"error": "Bad choice"})
                ms = int((now() - STATE["started"]) * 1000)
                ok = choice == q["correct"]
                p["answers"][q["id"]] = {"choice": choice, "ms": ms, "correct": ok, "points": points(q, ms) if ok else 0}
                bump()
                tick()
                return self.send(200, {"ok": True})
            if not self.is_admin(qs):
                return self.send(403, {"error": "forbidden"})
            if u.path == "/api/admin/action":
                return self.send(200, admin_action(b))
            if u.path == "/api/admin/questions":
                qs_new = b.get("questions")
                if not isinstance(qs_new, list):
                    return self.send(400, {"error": "questions must be a list"})
                set_questions(qs_new)
                return self.send(200, {"ok": True, "count": len(STATE["questions"])})
        self.send(404, {"error": "not found"})


def print_links(port):
    base = STATE["join_url"].rstrip("/")
    print(f"  Students join (QR on the screen): {base}/")
    print(f"  Presenter screen + controls:      {base}/screen?key={KEY}   (arrow key = next, R = reveal, L = scores)")
    print(f"  Admin panel:                      {base}/admin?key={KEY}")
    print(f"  Admin panel on this PC:           http://localhost:{port}/admin?key={KEY}")
    print("  The two links with ?key= give full control: share them only with your co-host.\n")


def start_tunnel(port):
    exe = shutil.which("cloudflared")
    if not exe:
        print("  cloudflared not found. Install it: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/")
        print_links(port)
        return
    proc = subprocess.Popen([exe, "tunnel", "--url", f"http://localhost:{port}"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

    def read():
        found = False
        for line in proc.stdout:
            m = re.search(r"https://[a-z0-9-]+\.trycloudflare\.com", line)
            if m and not found:
                found = True
                with LOCK:
                    STATE["join_url"] = m.group(0) + "/"
                    bump()
                print("  Tunnel is up (wait ~10 s before scanning).")
                print_links(port)
    threading.Thread(target=read, daemon=True).start()
    print("  Starting Cloudflare tunnel…")


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))       # no packet is sent; this just picks the outgoing interface
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


def main():
    global KEY
    ap = argparse.ArgumentParser(description="Classroom quiz server")
    ap.add_argument("--port", type=int, default=8000)
    ap.add_argument("--key", default="", help="admin key (random if empty)")
    ap.add_argument("--public-url", default="", help="join link to show in the QR, e.g. a trycloudflare.com address")
    ap.add_argument("--tunnel", action="store_true", help="start a Cloudflare quick tunnel (needs cloudflared installed) so anyone can join")
    a = ap.parse_args()
    KEY = a.key or "".join(random.choice(string.ascii_lowercase + string.digits) for _ in range(6))
    STATE["questions"] = load_questions()
    ip = lan_ip()
    STATE["join_url"] = a.public_url or f"http://{ip}:{a.port}/"
    new_game(keep_players=False)
    srv = ThreadingHTTPServer(("0.0.0.0", a.port), Handler)
    print(f"\n  {len(STATE['questions'])} questions loaded from {QFILE}")
    if a.tunnel:
        start_tunnel(a.port)
    else:
        print_links(a.port)
        print("  Anyone on other networks (or a friend presenting): restart with --tunnel\n")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
