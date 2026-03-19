#!/usr/bin/env python3
"""
Generate destination guide pSEO content for cruisecompare.online using MiniMax M2.7.
Reads from src/data/taxonomy/destinations.json and generates detailed destination guide JSON.
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
OUTPUT_DIR = WORKSPACE / "src/data/generated/destinations"
DESTINATIONS_JSON = WORKSPACE / "src/data/taxonomy/destinations.json"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def generate_destination_guide(dest: dict) -> dict | None:
    """Generate a comprehensive destination guide JSON."""

    top_ports = dest.get('typical_ports', [])[:4]
    ports_str = ', '.join([f"{p.get('port','Unknown')}" for p in top_ports])

    prompt = f"""Generate a detailed cruise destination guide JSON for {dest['name']}.

Output ONLY valid JSON with this exact structure:
{{
  "slug": "{dest['slug']}",
  "name": "{dest['name']}",
  "region": "{dest.get('region', 'Unknown')}",
  "metaTitle": "{dest['name']} Cruises Guide 2026 — Best Routes, Ports & Tips",
  "metaDescription": "Complete guide to cruising the {dest['name']}. Best time to visit, top ports, what to expect, and how to plan your {dest['name']} cruise.",
  "heroSubtitle": "Your complete {dest['name']} cruise planning guide",
  "overview": "2-3 paragraph overview of cruising in {dest['name']}. What makes this destination special? What can cruisers expect? Include geography, culture highlights, and what kind of holiday this delivers.",
  "subRegions": [{', '.join(f'"{s}"' for s in dest.get('sub_regions', []))}],
  "bestTimeToVisit": {{
    "peak": "{dest.get('best_months', ['Unknown'])[0] if dest.get('best_months') else 'Year-round'}",
    "shoulder": "{', '.join(dest.get('best_months', ['Unknown'])[1:3]) if dest.get('best_months') else 'Spring/Fall'}",
    "avoid": "{dest.get('avoid_months', ['Unknown'])[0] if dest.get('avoid_months') else 'N/A'}",
    "tip": "Why this timing matters for {dest['name']} cruising"
  }},
  "topPorts": [
    {{
      "name": "{top_ports[0].get('port', dest['name']) if top_ports else dest['name']}",
      "highlight": "{top_ports[0].get('highlight', 'Beautiful port city') if top_ports else 'Main cruise hub'}",
      "description": "Why this port is a highlight of a {dest['name']} cruise"
    }},
    {{
      "name": "{top_ports[1].get('port', 'Port City 2') if len(top_ports) > 1 else 'Other Port'}",
      "highlight": "{top_ports[1].get('highlight', 'Cultural highlight') if len(top_ports) > 1 else 'Cultural attractions'}",
      "description": "What makes this port worth visiting"
    }}
  ],
  "popularItineraries": [
    {{
      "name": "7-Night {dest['name']}",
      "from": "{dest.get('embarkation_ports', ['Various'])[0] if dest.get('embarkation_ports') else 'Various'}",
      "ports": ["Port 1", "Port 2", "Port 3"],
      "priceFrom": 699
    }}
  ],
  "cruiseLinesOperating": [{', '.join(f'"{cl}"' for cl in dest.get('best_cruise_lines', []))}],
  "whatToExpect": {{
    "weather": "Typical weather in {dest['name']} cruise season — temperature range, what to pack",
    "food": "Local cuisine highlights — what food is the region known for? Typical dish cruisers should try ashore",
    "culture": "Cultural notes — local customs, dress codes for excursions, language tips",
    "currency": "What currency is used? Are euros/dollars widely accepted?",
    "language": "Local language(s) — will English suffice for tourists?"
  }},
  "insiderTips": [
    "Real insider tip — something a repeat cruiser would know about {dest['name']}",
    "Money-saving tip specific to this destination",
    "Best excursion value or free activity in the region"
  ],
  "packingList": [
    "Essential packing item 1 specific to {dest['name']}",
    "Essential packing item 2",
    "What to wear ashore — dress code tips",
    "Must-bring item 4"
  ],
  "faq": [
    {{
      "question": "What is the best time of year to cruise {dest['name']}?",
      "answer": "Specific answer based on the weather and seasonal information"
    }},
    {{
      "question": "Do I need a visa for {dest['name']} cruises?",
      "answer": "Visa requirements for the region — be specific about the countries visited"
    }},
    {{
      "question": "How many days do I need in {dest['name']}?",
      "answer": "Typical cruise duration and whether to add land days"
    }},
    {{
      "question": "What should I budget for excursions in {dest['name']}?",
      "answer": "Excursion cost guide — budget vs premium options"
    }}
  ]
}}

IMPORTANT:
- All prices in EUR
- Be SPECIFIC to {dest['name']} — not generic cruise advice
- Include real port names, real attractions from the seed data
- FAQ answers should be genuinely useful, not vague
- Output ONLY the JSON object, no markdown fences"""

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
            data['slug'] = dest['slug']
            return data
        except json.JSONDecodeError as e:
            print(f"  JSON parse error for {dest['name']}: {e}")
            return None
    return None


def main():
    parser = argparse.ArgumentParser(description="Generate destination guide content")
    parser.add_argument("--destination", help="Generate single destination by slug")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be generated")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of destinations")
    args = parser.parse_args()

    destinations = json.loads(DESTINATIONS_JSON.read_text())
    print(f"Loaded {len(destinations)} destinations from taxonomy")

    if args.destination:
        destinations = [d for d in destinations if d['slug'] == args.destination]
        print(f"Filtered to: {args.destination}")

    if args.dry_run:
        existing = list(OUTPUT_DIR.glob("*.json"))
        print(f"Would generate {len(destinations)} destination guides")
        print(f"Already exist: {len(existing)}")
        for d in destinations[:5]:
            print(f"  - {d['slug']}")
        return

    generated = skipped = failed = 0

    for i, dest in enumerate(destinations):
        out_file = OUTPUT_DIR / f"{dest['slug']}.json"

        if out_file.exists():
            print(f"  [{i+1}/{len(destinations)}] SKIP {dest['name']} (exists)")
            skipped += 1
            continue

        print(f"  [{i+1}/{len(destinations)}] Generate {dest['name']}...", end=" ", flush=True)
        data = generate_destination_guide(dest)

        if data:
            out_file.write_text(json.dumps(data, indent=2, ensure_ascii=False))
            print(f"OK ({len(json.dumps(data))} bytes)")
            generated += 1
        else:
            print("FAILED")
            failed += 1

        time.sleep(2)

        if args.limit and generated >= args.limit:
            print(f"Limit reached ({args.limit}), stopping")
            break

    print(f"\nDone: {generated} generated, {skipped} skipped, {failed} failed")


if __name__ == "__main__":
    main()
