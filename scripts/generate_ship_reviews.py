#!/usr/bin/env python3
"""
Generate ship review pSEO content for cruisecompare.online using MiniMax M2.7.
Reads from src/data/taxonomy/ships.json and generates detailed ship review JSON.
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
OUTPUT_DIR = WORKSPACE / "src/data/generated/ships"
SHIPS_JSON = WORKSPACE / "src/data/taxonomy/ships.json"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def generate_ship_review(ship: dict) -> dict | None:
    """Generate a comprehensive ship review JSON."""

    prompt = f"""Generate a detailed ship review JSON for the {ship['name']} by {ship['cruise_line']}.

Output ONLY valid JSON with this exact structure:
{{
  "slug": "{ship['slug']}",
  "name": "{ship['name']}",
  "cruiseLine": "{ship['cruise_line']}",
  "cruiseLineSlug": "{ship['cruise_line'].lower().replace(' ', '-').replace('&', '')}",
  "metaTitle": "{ship['name']} Review 2026 — Cabins, Dining, Entertainment",
  "metaDescription": "Full review of {ship['cruise_line']}'s {ship['name']}. Cabins, dining, entertainment, pools, and what makes this ship special.",
  "heroSubtitle": "{ship['name']} — {ship['cruise_line']} {ship.get('class', 'Cruise Ship')}",
  "overview": "2-3 paragraph overview of {ship['name']}. What type of cruiser is it for? What's its personality? What makes it stand out from other ships?",
  "quickFacts": {{
    "yearBuilt": {ship.get('year_built', 'N/A')},
    "tonnage": "{ship.get('gross_tonnage', 'N/A')} GRT",
    "passengers": {ship.get('passenger_capacity', 'N/A')},
    "crew": {ship.get('crew_size', 'N/A')},
    "decks": {ship.get('decks', 'N/A')},
    "length": "{ship.get('length_metres', 'N/A')}m",
    "cabins": {ship.get('cabin_count', 'N/A')}
  }},
  "cabinTypes": [
    {{
      "type": "Interior",
      "priceFrom": {ship.get('avg_inside_price_7night', 599)},
      "sqft": "150-180",
      "description": "Interior cabin description — typical size, what you get, who it's best for"
    }},
    {{
      "type": "Balcony",
      "priceFrom": {ship.get('avg_balcony_price_7night', 999)},
      "sqft": "220-280",
      "description": "Balcony cabin description — the benefit of the outdoor space, who loves these"
    }},
    {{
      "type": "Suite",
      "priceFrom": 1500,
      "sqft": "450-700",
      "description": "Suite description — what extras included, who should upgrade"
    }}
  ],
  "dining": [
    {{
      "name": "Main Dining Room",
      "type": "included",
      "description": "Description of the main restaurant experience"
    }},
    {{
      "name": "Specialty Restaurant Example",
      "type": "surcharge",
      "price": "€30-50 per person",
      "description": "Description of a signature dining option"
    }}
  ],
  "entertainment": [
    "Show 1 — description of a signature show or activity",
    "Show 2 — another major entertainment option",
    "Show 3 — what guests talk about most"
  ],
  "pools": [
    "Pool 1 — main pool area description",
    "Pool 2 — adults-only or family pool"
  ],
  "kidsClubs": [
    "Kids club description — ages served, what kids do there"
  ],
  "bestFor": [{', '.join(f'"{b}"' for b in ship.get('best_for', ['All cruisers']))}],
  "notIdealFor": [{', '.join(f'"{b}"' for b in ship.get('not_ideal_for', ['Luxury seekers']))}],
  "prosAndCons": {{
    "pros": [
      "Strength 1 — what passengers love most about {ship['name']}",
      "Strength 2 — another standout positive",
      "Strength 3 — something unique to this ship"
    ],
    "cons": [
      "Weakness 1 — most common passenger complaint",
      "Weakness 2 — area where the ship falls short",
      "Weakness 3 — who might be disappointed"
    ]
  }},
  "verdict": "1-2 paragraph final assessment. Would you recommend this ship? To whom? What kind of cruise holiday does it deliver best?",
  "rating": {ship.get('passenger_review_score', 4.0)},
  "itineraries": [
    {{
      "name": "7-Night Example Itinerary",
      "ports": ["Port 1", "Port 2", "Port 3", "Port 4"],
      "from": "{ship.get('home_ports', ['Various'])[0] if ship.get('home_ports') else 'Various'}"
    }}
  ]
}}

IMPORTANT:
- All prices in EUR per person for 7 nights
- Be SPECIFIC to {ship['name']} — include real ship details, real venues mentioned in the seed data
- The verdict should be honest and useful — not just marketing language
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
            data['slug'] = ship['slug']
            return data
        except json.JSONDecodeError as e:
            print(f"  JSON parse error for {ship['name']}: {e}")
            return None
    return None


def main():
    parser = argparse.ArgumentParser(description="Generate ship review content")
    parser.add_argument("--ship", help="Generate single ship by slug")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be generated")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of ships")
    args = parser.parse_args()

    ships = json.loads(SHIPS_JSON.read_text())
    print(f"Loaded {len(ships)} ships from taxonomy")

    if args.ship:
        ships = [s for s in ships if s['slug'] == args.ship]
        print(f"Filtered to single ship: {args.ship}")

    if args.dry_run:
        existing = list(OUTPUT_DIR.glob("*.json"))
        print(f"Would generate {len(ships)} ship reviews")
        print(f"Already exist: {len(existing)}")
        for s in ships[:5]:
            print(f"  - {s['slug']}")
        return

    generated = skipped = failed = 0

    for i, ship in enumerate(ships):
        out_file = OUTPUT_DIR / f"{ship['slug']}.json"

        if out_file.exists():
            print(f"  [{i+1}/{len(ships)}] SKIP {ship['name']} (exists)")
            skipped += 1
            continue

        print(f"  [{i+1}/{len(ships)}] Generate {ship['name']}...", end=" ", flush=True)
        data = generate_ship_review(ship)

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
