"""
Fast concurrent content generator using Qwen (Alibaba Coding Plan)
"""
import json
import glob
import time
import logging
import concurrent.futures
from pathlib import Path

# Import Qwen client — inline to avoid path issues
exec(open(str(Path(__file__).parent / 'qwen_client.py')).read())
generate = generate  # Use the generate function from qwen_client

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger(__name__)

WORKSPACE = Path("/home/padmin/workspace/cruisecompare")
DATA_DIR = WORKSPACE / "src/data/taxonomy"
GEN_DIR = WORKSPACE / "src/data/generated"

def needs_gen(filepath):
    """Check if file needs generation"""
    try:
        if not Path(filepath).exists():
            return True
        with open(filepath) as f:
            d = json.load(f)
        return len(d.get('faqs', [])) < 6
    except:
        return True

def generate_cruise_destination(line, dest):
    """Generate cruise+destination page using Qwen"""
    line_name = line["name"]
    dest_name = dest["name"]
    
    system = "You are a cruise industry expert writing for cruisecompare.online. Write specific, accurate content. Output ONLY valid JSON."
    
    prompt = f'''Generate complete JSON for {line_name} {dest_name} cruise page:
{{
"title": "{line_name} {dest_name} Cruises 2026 — Itineraries, Prices & Ships",
"intro": "150 words specific to {line_name} sailing to {dest_name}. Mention ship amenities, dining, and why this combo works.",
"quick_facts": {{
"price_from_eur": 699,
"duration_range": "7-14 nights",
"best_months": ["December","January","February","March"],
"ships_on_route": ["Wonder of the Seas","Oasis of the Seas","Icon of the Seas"],
"departure_ports": ["Miami","Fort Lauderdale"]
}},
"price_by_season": [
{{"season": "Peak (Jul-Aug)", "inside_eur": 899, "balcony_eur": 1299, "suite_eur": 1999}},
{{"season": "Shoulder (May-Jun,Sep-Oct)", "inside_eur": 749, "balcony_eur": 1099, "suite_eur": 1699}},
{{"season": "Off-peak (Nov-Apr)", "inside_eur": 599, "balcony_eur": 899, "suite_eur": 1399}}
],
"sample_itineraries": [
{{"name": "7-night Eastern Caribbean", "duration_nights": 7, "ports": ["Miami","Nassau","CocoCay","St.Thomas","Miami"], "price_from_eur": 699, "highlight": "Perfect mix of private island and popular ports"}},
{{"name": "7-night Western Caribbean", "duration_nights": 7, "ports": ["Miami","Cozumel","Roatan","Costa Maya","Miami"], "price_from_eur": 749, "highlight": "Mayan ruins and snorkeling adventures"}}
],
"ships_detail": [
{{"name": "Wonder of the Seas", "capacity": 5700, "year_built": 2022, "best_for": "Families wanting newest mega-ship", "price_from_eur": 799}},
{{"name": "Oasis of the Seas", "capacity": 5400, "year_built": 2009, "best_for": "Families wanting classic mega-ship", "price_from_eur": 699}}
],
"whats_included": ["All meals in main dining","Entertainment shows","Kids clubs","Pools and fitness","Room service (delivery fee)"],
"whats_extra": ["Specialty dining ($35-60)","Drinks packages ($65-85/day)","Shore excursions ($50-200)","Spa treatments","WiFi ($15-25/day)"],
"booking_strategy": "Book 6-12 months in advance for best cabin selection. Last-minute deals within 60 days offer savings but limited choice. Peak season (Dec-Mar) books early. Consider NextCruise program onboard for future sailing discounts. Balcony cabins on Deck 8-10 offer best value.",
"top_ports": [
{{"port": "Nassau, Bahamas", "time_in_port": "8am-5pm", "top_activity": "Atlantis Resort day pass ($189)", "tip": "Walk to Junkanoo Beach for free local experience"}},
{{"port": "Cozumel, Mexico", "time_in_port": "8am-6pm", "top_activity": "Snorkeling at Palancar Reef ($65)", "tip": "Book independent excursions for half the ship price"}}
],
"faqs": [
{{"question": "How much does a {line_name} {dest_name} cruise cost?", "answer": "{line_name} {dest_name} cruises start from €599 for an inside cabin in off-peak season. Peak season (July-August) prices range €899-€1299 for inside/balcony cabins. Suite accommodations start at €1399. Prices include meals, entertainment, and kids clubs. Specialty dining and drinks cost extra."}},
{{"question": "Which {line_name} ships sail the {dest_name}?", "answer": "{line_name} deploys its newest mega-ships to {dest_name}, including Wonder of the Seas (2022), Icon of the Seas (2024), and Oasis of the Seas. These ships feature neighborhoods like Central Park and Boardwalk, Adventure Ocean kids clubs, FlowRider surf simulators, and Broadway entertainment."}},
{{"question": "When is the best time to cruise the {dest_name} with {line_name}?", "answer": "Best time is December through April when weather is dry and temperatures comfortable 25-30°C. Avoid August-October due to hurricane risk. Peak season pricing applies during school holidays. Shoulder months (May, June, September, October) offer good weather with lower prices and fewer crowds."}},
{{"question": "What is included in a {line_name} {dest_name} cruise?", "answer": "Your fare includes all meals in main dining room and Windjammer buffet, entertainment including Broadway shows and ice skating, pools and fitness center, and Adventure Ocean kids clubs for ages 3-17. Not included are specialty restaurants, alcoholic beverages, shore excursions, spa treatments, and WiFi. Gratuities are added automatically."}},
{{"question": "Which ports do {line_name} {dest_name} cruises visit?", "answer": "{line_name} {dest_name} cruises visit Nassau and CocoCay in Bahamas, Cozumel and Costa Maya in Mexico, and St. Thomas or St. Maarten in Caribbean. Western Caribbean itineraries include Roatan Honduras and Belize. Each port offers beaches, shopping, and excursions."}},
{{"question": "How far in advance should I book a {line_name} {dest_name} cruise?", "answer": "Book 6-12 months in advance for best cabin selection and pricing. Last-minute deals within 60 days can offer savings but cabin choice is limited. For peak season sailings December through March, book as early as possible as they sell out months in advance."}},
{{"question": "Is {line_name} good for families in the {dest_name}?", "answer": "{line_name} is excellent for families with dedicated Adventure Ocean kids clubs for ages 3-17, family cabins connecting multiple rooms, pools with water slides on newer ships, and entertainment for all ages. Kids sail free promotions are often available."}},
{{"question": "What is {line_name}'s cancellation policy?", "answer": "{line_name} allows cancellations with refund percentages decreasing closer to sailing date. Full refund typically available 90 days or more before departure. Travel insurance is recommended for cancellation coverage. Check specific fare terms as policies vary by booking type and promotion."}}
]
}}
Output ONLY valid JSON, no markdown.'''
    
    try:
        content = qwen_generate(system, prompt)
        if not content:
            return None
        data = json.loads(content)
        data["cruise_line"] = line
        data["destination"] = dest
        data["generated"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        return data
    except Exception as e:
        log.error(f"Failed {line_name}+{dest_name}: {e}")
        return None

def safe_generate(args):
    """Wrapper for concurrent execution"""
    line, dest = args
    fpath = GEN_DIR / 'cruises' / f"{line['slug']}-{dest['slug']}.json"
    
    if not needs_gen(fpath):
        return None, "skipped"
    
    result = generate_cruise_destination(line, dest)
    if result:
        with open(fpath, 'w') as f:
            json.dump(result, f, indent=2)
        return f"{line['name']}+{dest['name']}", "generated"
    return None,