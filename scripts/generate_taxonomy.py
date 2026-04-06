#!/usr/bin/env python3
"""
Generate taxonomy data for cruisecompare.online using MiniMax M2.5
"""

import json
import os
import sys
import time
from pathlib import Path

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

def call_minimax(prompt, temperature=0.3, max_tokens=4000):
    """Call MiniMax M2.5 API"""
    import urllib.request
    
    headers = {
        "Authorization": f"Bearer {MINIMAX_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "MiniMax-M2.5",
        "messages": [
            {"role": "system", "content": "You are a cruise industry expert. Generate accurate, factual data. Output ONLY valid JSON. No preamble."},
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

def generate_cruise_lines():
    """Generate cruise-lines.json"""
    prompt = """Generate a JSON array of 15 major cruise lines with complete details for each.

Required fields for each line:
- slug: URL-friendly lowercase with hyphens
- name: Full official name
- parent_company: Parent corporation
- founded: Year founded (integer)
- headquarters: City, State/Country
- fleet_size: Number of ships (integer)
- ship_count: Same as fleet_size
- known_for: Brief description
- price_tier: One of: budget, mid-range, premium, luxury
- best_for: Array of 3-4 traveler types
- worst_for: Array of 2-3 traveler types
- avg_price_7night_inside: Average price in EUR (integer)
- avg_price_7night_balcony: Average price in EUR (integer)
- loyalty_program: Name of loyalty program
- key_ships: Array of 3 flagship ship names
- top_destinations: Array of 3-4 destinations
- departure_ports: Array of 4-5 major ports
- strengths: Array of 4 detailed strengths
- weaknesses: Array of 3-4 detailed weaknesses
- website: Full URL
- booking_tip: One insider tip

Include these lines: Royal Caribbean, Carnival, Norwegian, MSC, Celebrity, Princess, Holland America, Cunard, P&O, Costa, Disney, Virgin Voyages, Viking, Oceania, Regent Seven Seas

Output ONLY valid JSON array. No markdown, no explanation."""

    print("Generating cruise-lines.json...")
    content = call_minimax(prompt, temperature=0.3)
    if content:
        try:
            # Clean up potential markdown
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            data = json.loads(content)
            output_file = DATA_DIR / "cruise-lines.json"
            output_file.write_text(json.dumps(data, indent=2))
            print(f"✓ Generated {output_file} with {len(data)} cruise lines")
            return True
        except Exception as e:
            print(f"Error parsing cruise lines: {e}", file=sys.stderr)
            print(f"Content: {content[:500]}", file=sys.stderr)
    return False

def generate_destinations():
    """Generate destinations.json"""
    prompt = """Generate a JSON array of 20 cruise destinations with complete details.

Required fields for each destination:
- slug: URL-friendly lowercase with hyphens
- name: Destination name
- region: Geographic region (Europe, Americas, Asia, etc.)
- best_months: Array of 4-5 best months
- avoid_months: Array of 2-3 months to avoid
- avoid_reason: Why to avoid those months
- avg_duration_nights: Typical cruise length (integer)
- typical_ports: Array of 5 port objects with "port" and "highlight" fields
- climate: Brief climate description
- currency_tip: Money advice
- visa_note: Visa requirements
- excursion_budget_pp: Price range in EUR
- best_cruise_lines: Array of 4 cruise line names
- embarkation_ports: Array of 4-5 ports
- sub_regions: Array of 2-3 sub-regions

Include: Caribbean, Mediterranean, Norwegian Fjords, Alaska, Baltic, Canary Islands, Greek Isles, Adriatic, Transatlantic, British Isles, Northern Europe, Arabian Gulf, Indian Ocean, South America, Antarctica, Australia Pacific, Hawaii, Japan Asia, Africa, Black Sea

Output ONLY valid JSON array."""

    print("Generating destinations.json...")
    content = call_minimax(prompt, temperature=0.3)
    if content:
        try:
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            data = json.loads(content)
            output_file = DATA_DIR / "destinations.json"
            output_file.write_text(json.dumps(data, indent=2))
            print(f"✓ Generated {output_file} with {len(data)} destinations")
            return True
        except Exception as e:
            print(f"Error parsing destinations: {e}", file=sys.stderr)
    return False

def generate_ports():
    """Generate ports.json"""
    prompt = """Generate a JSON array of 25 cruise departure ports with complete details.

Required fields for each port:
- slug: URL-friendly lowercase with hyphens
- name: Port city name
- country: Country name
- iata_nearby: Nearest airport IATA code
- terminal_count: Number of cruise terminals (integer)
- terminals: Array of terminal names
- cruise_lines_operating: Array of 8-10 cruise lines
- train_from_city: Travel time and cost from nearest major city
- parking_cost_per_day: Price in local currency
- nearest_airport: Airport name and travel time
- hotel_tip: Hotel recommendation with price
- embarkation_tip: Boarding advice
- destinations_served: Array of 5-7 destinations
- busiest_months: Array of 3 months
- quietest_months: Array of 3 months

Include: Southampton, Barcelona, Miami, Fort Lauderdale, Rome, Venice, Athens, Lisbon, Hamburg, Copenhagen, Amsterdam, Genoa, Marseille, Malaga, Palma, New York, Seattle, Vancouver, Sydney, Dubai, Singapore, San Juan, Galveston, Tampa, New Orleans

Output ONLY valid JSON array."""

    print("Generating ports.json...")
    content = call_minimax(prompt, temperature=0.3)
    if content:
        try:
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            data = json.loads(content)
            output_file = DATA_DIR / "ports.json"
            output_file.write_text(json.dumps(data, indent=2))
            print(f"✓ Generated {output_file} with {len(data)} ports")
            return True
        except Exception as e:
            print(f"Error parsing ports: {e}", file=sys.stderr)
    return False

def generate_ships():
    """Generate ships.json"""
    prompt = """Generate a JSON array of 40 major cruise ships with complete details.

Required fields for each ship:
- slug: URL-friendly lowercase with hyphens
- name: Ship name
- cruise_line: Parent cruise line
- year_built: Launch year (integer)
- last_refurb: Refurbishment year or null
- gross_tonnage: Tonnage (integer)
- passenger_capacity: Max passengers (integer)
- crew_size: Crew count (integer)
- length_metres: Ship length (integer)
- decks: Number of decks (integer)
- cabin_count: Total cabins (integer)
- cabin_types: Array of cabin categories
- neighborhoods: Array of themed areas
- dining_venues: Count of restaurants (integer)
- specialty_restaurants: Array of premium dining names
- entertainment: Array of key features
- pools: Number of pools (integer)
- water_slides: Count of slides (integer)
- casino: Boolean
- spa: Boolean
- kids_club: Kids program name or null
- home_ports: Array of 2-3 embarkation ports
- typical_itineraries: Array of 3 route names
- avg_inside_price_7night: Price in EUR (integer)
- avg_balcony_price_7night: Price in EUR (integer)
- passenger_review_score: Rating 1-5 (float)
- best_for: Array of 3 traveler types
- not_ideal_for: Array of 2 traveler types
- sister_ships: Array of sister ship names
- notable_feature: Key highlight

Include ships from: Royal Caribbean (Oasis, Wonder, Icon, Symphony), MSC (World Europa, Seashore, Bellissima), Carnival (Celebration, Jubilee, Vista), Norwegian (Prima, Encore, Epic), Celebrity (Beyond, Edge, Apex), Princess (Discovery, Enchanted), Cunard (Queen Mary 2, Queen Anne), Disney (Wish), Virgin (Scarlet Lady)

Output ONLY valid JSON array."""

    print("Generating ships.json...")
    content = call_minimax(prompt, temperature=0.3)
    if content:
        try:
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            data = json.loads(content)
            output_file = DATA_DIR / "ships.json"
            output_file.write_text(json.dumps(data, indent=2))
            print(f"✓ Generated {output_file} with {len(data)} ships")
            return True
        except Exception as e:
            print(f"Error parsing ships: {e}", file=sys.stderr)
    return False

def generate_trip_types():
    """Generate trip-types.json"""
    prompt = """Generate a JSON array of 10 cruise trip types with complete details.

Required fields for each:
- slug: URL-friendly lowercase
- name: Trip type name
- description: Detailed description
- best_lines: Array of 3-4 cruise lines
- key_features: Array of 4 key features

Include: Family, Adults-Only, Luxury, River, Expedition, Solo, First-Time, Honeymoon, Senior, Budget

Output ONLY valid JSON array."""

    print("Generating trip-types.json...")
    content = call_minimax(prompt, temperature=0.3)
    if content:
        try:
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            data = json.loads(content)
            output_file = DATA_DIR / "trip-types.json"
            output_file.write_text(json.dumps(data, indent=2))
            print(f"✓ Generated {output_file} with {len(data)} trip types")
            return True
        except Exception as e:
            print(f"Error parsing trip types: {e}", file=sys.stderr)
    return False

def main():
    """Main entry point"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print("CruiseCompare Taxonomy Generator")
    print("Using MiniMax M2.5")
    print("=" * 60)
    print()
    
    results = []
    
    # Generate each taxonomy file
    results.append(("cruise-lines", generate_cruise_lines()))
    time.sleep(2)  # Rate limiting
    
    results.append(("destinations", generate_destinations()))
    time.sleep(2)
    
    results.append(("ports", generate_ports()))
    time.sleep(2)
    
    results.append(("ships", generate_ships()))
    time.sleep(2)
    
    results.append(("trip-types", generate_trip_types()))
    
    # Summary
    print()
    print("=" * 60)
    print("Generation Summary")
    print("=" * 60)
    for name, success in results:
        status = "✓" if success else "✗"
        print(f"{status} {name}")
    
    success_count = sum(1 for _, s in results if s)
    print(f"\nTotal: {success_count}/{len(results)} files generated")
    
    return 0 if success_count == len(results) else 1

if __name__ == "__main__":
    sys.exit(main())
