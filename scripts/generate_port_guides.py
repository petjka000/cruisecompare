#!/usr/bin/env python3
"""
Generate port guide pSEO content for cruisecompare.online using MiniMax M2.7.
Reads from src/data/taxonomy/ports.json and generates detailed port guide JSON.
"""

import json
import os
import sys
import time
import argparse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from generate_content import call_minimax

WORKSPACE = Path("/home/padmin/workspace/cruisecompare")
OUTPUT_DIR = WORKSPACE / "src/data/generated/ports"
PORTS_JSON = WORKSPACE / "src/data/taxonomy/ports.json"
LOG_FILE = WORKSPACE / "logs/port_guides.log"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
Path(LOG_FILE).parent.mkdir(parents=True, exist_ok=True)


def generate_port_guide(port: dict) -> dict | None:
    """Generate a comprehensive port guide for one cruise port."""

    prompt = f"""Generate a comprehensive cruise port guide JSON for {port['name']} in {port['country']}.

Output ONLY valid JSON with this exact structure:
{{
  "slug": "{port['slug']}",
  "name": "{port['name']}",
  "city": "{port['country']}",
  "country": "{port['country']}",
  "iata": "{port.get('iata_nearby', '')}",
  "region": "{port.get('destinations_served', ['Unknown'])[0] if port.get('destinations_served') else 'Unknown'}",
  "metaTitle": "{port['name']} Cruise Port Guide 2026 — Terminals, Transport & Tips",
  "metaDescription": "Complete guide to {port['name']} cruise port. Terminals, getting there, local transport, what to see, embarkation tips, and nearby attractions.",
  "heroSubtitle": "Everything you need to know before your cruise from {port['name']}",
  "overview": "2-3 paragraph overview of {port['name']} as a cruise port. Include: significance, annual passenger volume, what makes it special for cruise passengers.",
  "terminals": [
    {{
      "name": "Main Cruise Terminal",
      "description": "Description of the primary terminal facility and which cruise lines use it",
      "cruiseLines": [{', '.join(f'"{cl}"' for cl in port.get('cruise_lines_operating', [])[:5])}],
      "facilities": ["information desk", "toilets", "coffee shop"]
    }}
  ],
  "gettingThere": {{
    "fromAirport": "How to get from the nearest airport to the cruise port. Include taxi cost estimate, public transport options, time estimates.",
    "fromCityCenter": "How to get from city center. Walk time if close, taxi options, metro/bus if available.",
    "parking": "Long-term parking options at the port for drive-on passengers. Cost per day if known.",
    "shuttles": "Are there cruise line shuttles or port shuttles to hotels/airport?"
  }},
  "embarkationTips": [
    "Specific local tip 1 — NOT generic cruise advice",
    "Specific local tip 2 — things only locals know",
    "Specific tip 3 about this specific port",
    "Specific tip 4 about check-in or security",
    "Specific tip 5 about timing or traffic"
  ],
  "nearbyAttractions": [
    {{
      "name": "Attraction name",
      "description": "Brief description — what it is and why cruise passengers should visit",
      "walkingTime": "walking time from port",
      "cost": "Estimated cost"
    }}
  ],
  "localTransport": {{
    "metro": "Metro/subway availability and closest station to the port",
    "bus": "Bus routes serving the port area",
    "taxi": "Taxi availability and typical costs from port",
    "walkability": "Can you walk to city center from the port? What's the distance?"
  }},
  "weather": {{
    "bestMonths": "Best months for cruising from this port",
    "peakSeason": "Peak cruise season dates and why it's busy",
    "climate": "Brief climate summary — what to pack for a cruise from here"
  }},
  "cruiseLinesFromHere": [{', '.join(f'"{cl}"' for cl in port.get('cruise_lines_operating', []))}],
  "isDeparture": true,
  "isCallPort": true,
  "insiderTips": [
    "Real insider tip only experienced cruisers know about {port['name']}",
    "Money-saving tip specific to this port",
    "Local food or restaurant recommendation near the port"
  ],
  "faq": [
    {{
      "question": "Common question about cruising from {port['name']}",
      "answer": "Helpful, specific answer"
    }},
    {{
      "question": "Another common question",
      "answer": "Specific answer"
    }},
    {{
      "question": "Question about parking or transport",
      "answer": "Answer"
    }},
    {{
      "question": "Question about terminals or check-in",
      "answer": "Answer"
    }}
  ]
}}

IMPORTANT:
- All prices in EUR (or local currency with EUR equivalent)
- Be SPECIFIC to {port['name']} — no generic cruise advice
- Include real terminal names, real transport options, real attractions
- Embarkation tips should be things you'd only know if you've been there
- 5 embarkation tips, 3 insider tips, 4 FAQ items minimum
- Output ONLY the JSON object, no markdown fences, no explanation"""

    result = call_minimax(prompt, temperature=0.3, max_tokens=8000)

    if result:
        try:
            import re
            # Try to extract JSON by finding first { and last }
            json_start = result.find('{')
            json_end = result.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                clean = result[json_start:json_end]
            else:
                clean = result.strip()
                if clean.startswith("```"):
                    clean = clean.split("\n", 1)[1]
                if clean.endswith("```"):
                    clean = clean.rsplit("```", 1)[0]
            data = json.loads(clean)
            data['slug'] = port['slug']
            return data
        except json.JSONDecodeError as e:
            print(f"  JSON parse error for {port['name']}: {e}")
            return None
    return None


def main():
    parser = argparse.ArgumentParser(description="Generate port guide content")
    parser.add_argument("--port", help="Generate single port by slug")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be generated")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of ports")
    args = parser.parse_args()

    ports = json.loads(PORTS_JSON.read_text())
    print(f"Loaded {len(ports)} ports from taxonomy")

    if args.port:
        ports = [p for p in ports if p['slug'] == args.port]
        print(f"Filtered to single port: {args.port}")

    if args.dry_run:
        existing = list(OUTPUT_DIR.glob("*.json"))
        print(f"Would generate {len(ports)} port guides")
        print(f"Already exist: {len(existing)}")
        for p in ports[:5]:
            print(f"  - {p['slug']}")
        return

    generated = skipped = failed = 0

    for i, port in enumerate(ports):
        out_file = OUTPUT_DIR / f"{port['slug']}.json"

        if out_file.exists():
            print(f"  [{i+1}/{len(ports)}] SKIP {port['name']} (exists)")
            skipped += 1
            continue

        print(f"  [{i+1}/{len(ports)}] Generate {port['name']}...", end=" ", flush=True)
        data = generate_port_guide(port)

        if data:
            out_file.write_text(json.dumps(data, indent=2, ensure_ascii=False))
            print(f"OK ({len(json.dumps(data))} bytes)")
            generated += 1
        else:
            print("FAILED")
            failed += 1

        time.sleep(2)  # Rate limit

        if args.limit and generated >= args.limit:
            print(f"Limit reached ({args.limit}), stopping")
            break

    print(f"\nDone: {generated} generated, {skipped} skipped, {failed} failed")


if __name__ == "__main__":
    main()
