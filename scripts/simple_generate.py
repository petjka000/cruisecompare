#!/usr/bin/env python3
"""
Simple sequential content generator — reliable, no deadlocks
"""
import json
import time
import urllib.request
from pathlib import Path

import os as _os
from pathlib import Path as _Path

def _load_minimax_token() -> str:
    auth_path = _Path.home() / '.openclaw/agents/main/agent/auth-profiles.json'
    try:
        profiles = json.loads(auth_path.read_text())
        token = profiles.get('profiles', {}).get('minimax-portal:default', {}).get('access', '')
        if token:
            return token
    except Exception:
        pass
    key = _os.environ.get('MINIMAX_API_KEY', '')
    if not key:
        raise SystemExit('MINIMAX_API_KEY not set and auth-profiles.json missing')
    return key

MINIMAX_TOKEN = _load_minimax_token()
WORKSPACE = Path("/home/padmin/workspace/cruisecompare")
DATA_DIR = WORKSPACE / "src/data/taxonomy"
GEN_DIR = WORKSPACE / "src/data/generated"

def call_minimax(prompt):
    """Call MiniMax API"""
    data = {
        "model": "MiniMax-M2.5",
        "messages": [
            {"role": "system", "content": "You are a cruise expert. Output ONLY valid JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 4000
    }
    req = urllib.request.Request(
        "https://api.minimaxi.chat/v1/chat/completions",
        data=json.dumps(data).encode(),
        headers={"Authorization": f"Bearer {MINIMAX_TOKEN}", "Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode())["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"API error: {e}")
        return None

def clean_json(content):
    content = content.strip()
    if content.startswith("```json"): content = content[7:]
    if content.startswith("```"): content = content[3:]
    if content.endswith("```"): content = content[:-3]
    return content.strip()

def needs_gen(filepath):
    if not Path(filepath).exists(): return True
    try:
        with open(filepath) as f: d = json.load(f)
        return len(d.get('faqs', [])) < 6
    except: return True

def generate_one(line, dest):
    """Generate a single cruise+destination page"""
    prompt = f'''Generate JSON for {line["name"]} {dest["name"]} cruise page with these exact fields:
{{"title": "{line["name"]} {dest["name"]} Cruises 2026", "intro": "150 words", "quick_facts": {{"price_from_eur": 699}}, "faqs": [{{"question": "Q1?", "answer": "60+ words"}}, {{"question": "Q2?", "answer": "60+ words"}}]}}
Output ONLY JSON, no markdown.'''
    
    content = call_minimax(prompt)
    if not content: return None
    try:
        data = json.loads(clean_json(content))
        data["cruise_line"] = line
        data["destination"] = dest
        data["generated"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        return data
    except Exception as e:
        print(f"Parse error: {e}")
        return None

def main():
    lines = json.load(open(DATA_DIR / "cruise-lines.json"))
    dests = json.load(open(DATA_DIR / "destinations.json"))
    
    todo = []
    for line in lines:
        for dest in dests:
            fpath = GEN_DIR / "cruises" / f"{line['slug']}-{dest['slug']}.json"
            if needs_gen(fpath):
                todo.append((line, dest, fpath))
    
    print(f"Tasks: {len(todo)}")
    done = 0
    
    for line, dest, fpath in todo:
        result = generate_one(line, dest)
        if result:
            with open(fpath, 'w') as f: json.dump(result, f, indent=2)
            done += 1
            print(f"✓ {line['name']} + {dest['name']} ({done}/{len(todo)})")
        else:
            print(f"✗ {line['name']} + {dest['name']} — FAILED")
        time.sleep(0.5)  # Rate limit
    
    print(f"\nDone: {done}/{len(todo)}")

if __name__ == "__main__":
    main()
