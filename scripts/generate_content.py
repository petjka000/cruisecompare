#!/usr/bin/env python3
"""
Generate actual content for cruisecompare.online using MiniMax M2.7
"""

import json
import os
import sys
import time
import concurrent.futures
from pathlib import Path
from typing import Optional, Dict, Any

# MiniMax credentials — loaded from auth-profiles.json or MINIMAX_API_KEY env var
def _load_minimax_token() -> str:
    auth_path = Path.home() / '.openclaw/agents/main/agent/auth-profiles.json'
    try:
        profiles = json.loads(auth_path.read_text())
        token = profiles.get('profiles', {}).get('minimax-portal:default', {}).get('access', '')
        if token:
            return token
    except Exception:
        pass
    key = os.environ.get('MINIMAX_API_KEY', '')
    if not key:
        raise SystemExit('MINIMAX_API_KEY not set and auth-profiles.json missing')
    return key

MINIMAX_ACCESS_TOKEN = _load_minimax_token()
MINIMAX_BASE_URL = "https://api.minimaxi.chat/v1"

WORKSPACE = Path("/home/padmin/workspace/cruisecompare")
DATA_DIR = WORKSPACE / "src/data/taxonomy"
GENERATED_DIR = WORKSPACE / "src/data/generated"

def call_minimax(prompt: str, temperature: float = 0.3, max_tokens: int = 8000) -> Optional[str]:
    """Call MiniMax M2.5 API"""
    import urllib.request
    
    headers = {
        "Authorization": f"Bearer {MINIMAX_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "MiniMax-M2.7",
        "messages": [
            {"role": "system", "content": "You are a cruise industry expert writing for cruisecompare.online. Write specific, accurate, useful content. No generic filler. All prices in EUR. Output ONLY valid JSON. No markdown fences."},
            {"role": "user", "content": prompt}
        ],
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    
    req = urllib.request.Request(
        f"{MINIMAX_BASE_URL}/chat/completions",
        data=json.dumps(data).encode(),
        headers=headers,
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode())
            return result["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error calling MiniMax: {e}", file=sys.stderr)
        return None

def clean_json_response(content: str) -> str:
    """Clean up potential markdown and thinking tags from response"""
    import re
    # Extract JSON by finding first { and last } (handles thinking tags interleaved)
    json_start = content.find('{')
    json_end = content.rfind('}') + 1
    if json_start >= 0 and json_end > json_start:
        content = content[json_start:json_end]
    else:
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
    return content.strip()

def generate_cruise_destination(line: Dict, destination: Dict) -> Optional[Dict]:
    """Generate content for cruise line + destination page"""
    line_name = line["name"]
    dest_name = destination["name"]
    
    prompt = f"""Generate complete page content JSON for: {line_name} cruises to {dest_name}.

{{
 "title": "{line_name} {dest_name} Cruises 2026 — Itineraries, Prices & Ships",
 "intro": "<150 words: specific to this line+destination combo, NOT generic>",
 "quick_facts": {{
 "price_from_eur": <number>,
 "duration_range": "<e.g. 7-14 nights>",
 "best_months": ["<month>", "..."],
 "ships_on_route": ["<real ship names>", "..."],
 "departure_ports": ["<real ports>", "..."]
 }},
 "price_by_season": [
 {{"season": "Peak (Jul-Aug)", "inside_eur": <n>, "balcony_eur": <n>, "suite_eur": <n>}},
 {{"season": "Shoulder (May-Jun, Sep-Oct)", "inside_eur": <n>, "balcony_eur": <n>, "suite_eur": <n>}},
 {{"season": "Off-peak (Nov-Apr)", "inside_eur": <n>, "balcony_eur": <n>, "suite_eur": <n>}}
 ],
 "sample_itineraries": [
 {{
 "name": "<itinerary name>",
 "duration_nights": <n>,
 "ports": ["<port 1>", "<port 2>", "..."],
 "price_from_eur": <n>,
 "highlight": "<what makes this itinerary special>"
 }}
 ],
 "ships_detail": [
 {{
 "name": "<ship name>",
 "capacity": <n>,
 "year_built": <n>,
 "best_for": "<who this ship suits>",
 "price_from_eur": <n>
 }}
 ],
 "whats_included": ["<item>", "..."],
 "whats_extra": ["<item>", "..."],
 "booking_strategy": "<150 word paragraph: when to book, which cabins, specific tips>",
 "top_ports": [
 {{
 "port": "<port name>",
 "time_in_port": "<e.g. 8am-6pm>",
 "top_activity": "<specific activity with cost>",
 "tip": "<insider tip>"
 }}
 ],
 "faqs": [
 {{
 "question": "How much does a {line_name} {dest_name} cruise cost?",
 "answer": "<complete 60-100 word answer with price ranges>"
 }},
 {{
 "question": "Which {line_name} ships sail the {dest_name}?",
 "answer": "<complete answer naming specific ships>"
 }},
 {{
 "question": "When is the best time to cruise the {dest_name} with {line_name}?",
 "answer": "<complete answer: months, prices, weather>"
 }},
 {{
 "question": "What is included in a {line_name} {dest_name} cruise?",
 "answer": "<complete answer: what's included, what costs extra>"
 }},
 {{
 "question": "Which ports do {line_name} {dest_name} cruises visit?",
 "answer": "<complete answer naming real ports>"
 }},
 {{
 "question": "How far in advance should I book a {line_name} {dest_name} cruise?",
 "answer": "<complete answer: early booking, last minute, advice>"
 }},
 {{
 "question": "Is {line_name} good for families in the {dest_name}?",
 "answer": "<complete honest answer: kids clubs, activities, costs>"
 }},
 {{
 "question": "What is {line_name}'s cancellation policy?",
 "answer": "<complete answer: cancellation windows, refunds, insurance>"
 }}
 ]
}}

Output ONLY valid JSON."""
    
    print(f"Generating: {line_name} + {dest_name}")
    content = call_minimax(prompt, temperature=0.7, max_tokens=8000)
    if content:
        try:
            content = clean_json_response(content)
            data = json.loads(content)
            data["cruise_line"] = line
            data["destination"] = destination
            data["generated"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
            return data
        except Exception as e:
            print(f"Error parsing JSON: {e}", file=sys.stderr)
    return None

def generate_comparison(line_a: Dict, line_b: Dict) -> Optional[Dict]:
    """Generate comparison content"""
    line_a_name = line_a["name"]
    line_b_name = line_b["name"]
    line_a_slug = line_a["slug"]
    line_b_slug = line_b["slug"]
    
    prompt = f"""Generate complete comparison page JSON for: {line_a_name} vs {line_b_name}.

{{
 "title": "{line_a_name} vs {line_b_name} 2026 — Which Cruise Line Is Better?",
 "intro": "<100 words: what this comparison covers, who it's for>",
 "at_a_glance": {{
 "{line_a_slug}": {{
 "founded": <year>,
 "fleet_size": <n>,
 "price_tier": "<budget/mid/premium/luxury>",
 "avg_7night_inside_eur": <n>,
 "best_for": "<2-3 traveller types>",
 "flagship_ship": "<ship name>"
 }},
 "{line_b_slug}": {{
 "founded": <year>,
 "fleet_size": <n>,
 "price_tier": "<budget/mid/premium/luxury>",
 "avg_7night_inside_eur": <n>,
 "best_for": "<2-3 traveller types>",
 "flagship_ship": "<ship name>"
 }}
 }},
 "comparison_table": [
 {{"category": "Price (7-night inside cabin)", "{line_a_slug}": "<value>", "{line_b_slug}": "<value>"}},
 {{"category": "Ship size", "{line_a_slug}": "<value>", "{line_b_slug}": "<value>"}},
 {{"category": "Included dining", "{line_a_slug}": "<value>", "{line_b_slug}": "<value>"}},
 {{"category": "Specialty restaurants", "{line_a_slug}": "<value>", "{line_b_slug}": "<value>"}},
 {{"category": "Entertainment", "{line_a_slug}": "<value>", "{line_b_slug}": "<value>"}},
 {{"category": "Kids clubs", "{line_a_slug}": "<value>", "{line_b_slug}": "<value>"}},
 {{"category": "Adults-only areas", "{line_a_slug}": "<value>", "{line_b_slug}": "<value>"}},
 {{"category": "Drinks packages", "{line_a_slug}": "<value>", "{line_b_slug}": "<value>"}},
 {{"category": "Loyalty program", "{line_a_slug}": "<value>", "{line_b_slug}": "<value>"}}
  ],
  "verdict": "<150 word paragraph final recommendation>",
  "who_chooses_what": {{
    "{line_a_slug}": "<who should pick {line_a_name}>",
    "{line_b_slug}": "<who should pick {line_b_name}>"
  }}
}}

Output ONLY valid JSON."""

    print(f"Generating comparison: {line_a_name} vs {line_b_name}")
    content = call_minimax(prompt, temperature=0.7, max_tokens=8000)
    if content:
        try:
            content = clean_json_response(content)
            data = json.loads(content)
            data["line_a"] = line_a
            data["line_b"] = line_b
            data["generated"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
            return data
        except Exception as e:
            print(f"Error parsing JSON: {e}", file=sys.stderr)
    return None