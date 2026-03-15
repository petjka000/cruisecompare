#!/usr/bin/env python3
"""
Simple Qwen generator — inline everything, no imports
"""
import json
import urllib.request
import time
from pathlib import Path

API_KEY = "sk-sp-e5fa29431ea24e54aeb5a3b13f5f2444"
BASE_URL = "https://coding-intl.dashscope.aliyuncs.com/v1"

def qwen_generate(system, prompt, retries=3):
    """Call Qwen API"""
    payload = {
        "model": "qwen-plus",
        "max_tokens": 4000,
        "temperature": 0.7,
        "messages": [
            {"role": "system", "content": system + " Output ONLY JSON."},
            {"role": "user", "content": prompt}
        ],
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }
    
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                f"{BASE_URL}/chat/completions",
                data=json.dumps(payload).encode(),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=60) as r:
                data = json.loads(r.read().decode())
                text = data["choices"][0]["message"]["content"].strip()
                if text.startswith("```"):
                    text = text.split("\n", 1)[1].rsplit("\n", 1)[0]
                json.loads(text)  # Validate
                return text
        except Exception as e:
            print(f"Attempt {attempt+1} failed: {e}")
            if attempt == retries - 1:
                raise
            time.sleep(2)
    return None

# Load taxonomy
DATA_DIR = Path("/home/padmin/workspace/cruisecompare/src/data/taxonomy")
GEN_DIR = Path("/home/padmin/workspace/cruisecompare/src/data/generated/cruises")

lines = json.load(open(DATA_DIR / "cruise-lines.json"))
dests = json.load(open(DATA_DIR / "destinations.json"))

print(f"Loaded {len(lines)} lines, {len(dests)} destinations")

# Generate missing pages
done = 0
for line in lines:
    for dest in dests:
        fpath = GEN_DIR / f"{line['slug']}-{dest['slug']}.json"
        if fpath.exists():
            continue
        
        print(f"Generating: {line['name']} + {dest['name']}")
        
        prompt = f'''Generate JSON for {line["name"]} {dest["name"]} cruise page with title, intro, quick_facts, price_by_season, sample_itineraries, ships_detail, whats_included, whats_extra, booking_strategy, top_ports, and 8 FAQs with 60+ word answers each.'''
        
        try:
            content = qwen_generate("You are a cruise expert.", prompt)
            if content:
                data = json.loads(content)
                data["cruise_line"] = line
                data["destination"] = dest
                data["generated"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
                with open(fpath, 'w') as f:
                    json.dump(data, f, indent=2)
                done += 1
                print(f"  ✓ Done ({done})")
        except Exception as e:
            print(f"  ✗ Failed: {e}")
        
        time.sleep(0.5)

print(f"\nTotal generated: {done}")
