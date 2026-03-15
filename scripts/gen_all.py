#!/usr/bin/env python3
"""
Self-contained cruise content generator for cruisecompare.online
Reads Qwen credentials from OpenClaw auth profiles.
Writes JSON to src/data/generated/{type}/{slug}.json
Run: python3 scripts/gen_all.py
"""
import json
import os
import time
import logging
import concurrent.futures
import urllib.request
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler(f'logs/gen_all_{int(time.time())}.log'),
        logging.StreamHandler()
    ]
)
log = logging.getLogger(__name__)

# ── CREDENTIALS ─────────────────────────────────────────────────────────────
def get_qwen_creds():
    path = Path.home() / '.openclaw/agents/main/agent/auth-profiles.json'
    data = json.load(open(path))
    profiles = data.get('profiles', {})
    
    # Find alibaba-coding profile
    for key, p in profiles.items():
        if 'alibaba' in key.lower() or 'coding' in key.lower():
            base_url = p.get('base_url', 'https://coding-intl.dashscope.aliyuncs.com/v1').rstrip('/')
            api_key = p.get('api_key') or p.get('token')
            model = p.get('model', 'qwen-plus')
            if api_key:
                return base_url, api_key, model
    
    raise ValueError("No Alibaba/Qwen profile found")

BASE_URL, API_KEY, MODEL = get_qwen_creds()
log.info(f"Using model: {MODEL}")

# ── API CALL ─────────────────────────────────────────────────────────────────
def call_qwen(system: str, user: str, max_tokens=3000, temp=0.7) -> dict:
    """Call Qwen API, return parsed JSON dict. Retries 3x."""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }
    payload = {
        "model": MODEL,
        "temperature": temp,
        "max_tokens": max_tokens,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
    }
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                f"{BASE_URL}/chat/completions",
                data=json.dumps(payload).encode(),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=90) as r:
                data = json.loads(r.read().decode())
                text = data['choices'][0]['message']['content']
                # Clean markdown
                text = text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
                return json.loads(text)
        except json.JSONDecodeError as e:
            log.warning(f"JSON parse failed attempt {attempt+1}: {e}")
        except Exception as e:
            log.warning(f"API error attempt {attempt+1}: {e}")
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
    raise RuntimeError("All 3 attempts failed")

# ── HELPERS ──────────────────────────────────────────────────────────────────
SYSTEM = "You are a cruise industry expert. Write accurate, specific content. All prices EUR. Output ONLY valid JSON. No preamble. No markdown."

def out_path(type_dir: str, slug: str) -> Path:
    p = Path(f'src/data/generated/{type_dir}/{slug}.json')
    p.parent.mkdir(parents=True, exist_ok=True)
    return p

def needs_gen(type_dir: str, slug: str) -> bool:
    p = out_path(type_dir, slug)
    if not p.exists():
        return True
    try:
        d = json.load(open(p))
        return len(d.get('faqs', [])) < 6
    except:
        return True

def save(type_dir: str, slug: str, data: dict):
    p = out_path(type_dir, slug)
    json.dump(data, open(p, 'w'), indent=2, ensure_ascii=False)

# ── GENERATORS ───────────────────────────────────────────────────────────────
def gen_cruise_dest(line: dict, dest: dict):
    slug = f"{line['slug']}-{dest['slug']}"
    if not needs_gen('cruises', slug):
        return f"SKIP {slug}"
    
    prompt = f"""Generate cruise page JSON for {line['name']} cruises to {dest['name']}.
Return this exact JSON structure:
{{
  "title": "{line['name']} {dest['name']} Cruises 2026",
  "intro": "150 words specific to this line+destination",
  "quick_facts": {{"price_from_eur": 699, "duration_range": "7-14 nights", "best_months": ["Dec","Jan","Feb"], "ships_on_route": ["Wonder","Oasis"], "departure_ports": ["Miami","Barcelona"]}},
  "price_by_season": [{{"season": "Peak", "inside_eur": 899, "balcony_eur": 1299, "suite_eur": 1999}}],
  "sample_itineraries": [{{"name": "7-night {dest['name']}", "duration_nights": 7, "ports": ["Port1","Port2"], "price_from_eur": 699, "highlight": "Great itinerary"}}],
  "ships_detail": [{{"name": "Wonder of the Seas", "capacity": 5700, "year": 2022, "best_for": "Families", "price_from_eur": 799}}],
  "whats_included": ["Meals","Entertainment"],
  "whats_extra": ["Drinks","Excursions"],
  "booking_strategy": "Book 6-12 months ahead",
  "top_ports": [{{"port": "Nassau", "time_in_port": "8am-5pm", "top_activity": "Atlantis ($189)", "tip": "Book early"}}],
  "faqs": [
    {{"question": "How much does a {line['name']} {dest['name']} cruise cost?", "answer": "60+ words with price ranges"}},
    {{"question": "Which {line['name']} ships sail to {dest['name']}?", "answer": "60+ words naming ships"}},
    {{"question": "When is best time to cruise {dest['name']}?", "answer": "60+ words with months"}},
    {{"question": "What is included?", "answer": "60+ words"}},
    {{"question": "Which ports?", "answer": "60+ words"}},
    {{"question": "How far ahead to book?", "answer": "60+ words"}},
    {{"question": "Good for families?", "answer": "60+ words"}},
    {{"question": "Cancellation policy?", "answer": "60+ words"}}
  ]
}}"""
    try:
        data = call_qwen(SYSTEM, prompt, max_tokens=3500)
        faqs = data.get('faqs', [])
        if len(faqs) >= 6 and all(len(f.get('answer', '').split()) >= 30 for f in faqs):
            save('cruises', slug, data)
            return f"OK {slug}"
        return f"FAIL {slug}: FAQ quality check failed"
    except Exception as e:
        return f"FAIL {slug}: {e}"

def gen_comparison(line_a: dict, line_b: dict):
    slug = f"{line_a['slug']}-vs-{line_b['slug']}"
    if not needs_gen('comparisons', slug):
        return f"SKIP {slug}"
    
    prompt = f"""Generate comparison JSON for {line_a['name']} vs {line_b['name']}.
Return this exact JSON structure:
{{
  "title": "{line_a['name']} vs {line_b['name']} 2026",
  "intro": "100 words",
  "at_a_glance": {{"{line_a['slug']}": {{"price_tier": "mid", "avg_7night_inside_eur": 799}}, "{line_b['slug']}": {{"price_tier": "mid", "avg_7night_inside_eur": 699}}}},
  "comparison_table": [{{"category": "Price", "{line_a['slug']}": "€799", "{line_b['slug']}": "€699"}}],
  "choose_a_if": ["Reason 1", "Reason 2"],
  "choose_b_if": ["Reason 1", "Reason 2"],
  "verdict_by_traveller": [{{"type": "Families", "winner": "{line_a['name']}", "reason": "30 words"}}],
  "faqs": [
    {{"question": "Which is better value?", "answer": "60+ words"}},
    {{"question": "Which for families?", "answer": "60+ words"}},
    {{"question": "How do prices compare?", "answer": "60+ words"}},
    {{"question": "Which has better food?", "answer": "60+ words"}},
    {{"question": "Which for first-timers?", "answer": "60+ words"}},
    {{"question": "Main differences?", "answer": "60+ words"}}
  ]
}}"""
    try:
        data = call_qwen(SYSTEM, prompt, max_tokens=3000)
        if len(data.get('faqs', [])) >= 5:
            save('comparisons', slug, data)
            return f"OK {slug}"
        return f"FAIL {slug}: FAQ count"
    except Exception as e:
        return f"FAIL {slug}: {e}"

# ── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--workers', type=int, default=8)
    parser.add_argument('--type', default='all', choices=['all', 'cruises', 'comparisons'])
    args = parser.parse_args()

    # Load taxonomy
    tx = Path('src/data/taxonomy')
    lines = json.load(open(tx / 'cruise-lines.json'))
    dests = json.load(open(tx / 'destinations.json'))

    tasks = []
    if args.type in ('all', 'cruises'):
        for l in lines:
            for d in dests:
                tasks.append((gen_cruise_dest, l, d))
    if args.type in ('all', 'comparisons'):
        for i, la in enumerate(lines):
            for lb in lines[i + 1:]:
                tasks.append((gen_comparison, la, lb))

    log.info(f"Tasks: {len(tasks)} | Workers: {args.workers}")

    ok = fail = skip = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
        futures = {ex.submit(fn, *a): (fn.__name__, a) for fn, *a in tasks}
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            if result.startswith('OK'):
                ok += 1
            elif result.startswith('SKIP'):
                skip += 1
            else:
                fail += 1
            total = ok + fail + skip
            if total % 10 == 0:
                log.info(f"Progress: {total}/{len(tasks)} | OK:{ok} SKIP:{skip} FAIL:{fail}")

    log.info(f"DONE — OK:{ok} SKIP:{skip} FAIL:{fail}")
