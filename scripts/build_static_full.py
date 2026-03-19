#!/usr/bin/env python3
"""
Generate static HTML files from JSON data with FULL content rendering
"""
import json
import glob
from pathlib import Path
import os

WORKSPACE = Path("/home/padmin/workspace/cruisecompare")
GEN_DIR = WORKSPACE / "src/data/generated"
OUT_DIR = WORKSPACE / "out"

def ensure_dir(path):
    path.mkdir(parents=True, exist_ok=True)
    return path

def render_base(title, content):
    """Base HTML template"""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="Compare cruise lines, ships, and deals for 2026">
    <style>
        body {{ font-family: system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; line-height: 1.6; }}
        header {{ border-bottom: 1px solid #ddd; padding-bottom: 20px; margin-bottom: 30px; }}
        h1 {{ color: #1a73e8; }}
        h2 {{ color: #333; margin-top: 40px; border-bottom: 2px solid #1a73e8; padding-bottom: 10px; }}
        h3 {{ color: #1a73e8; margin-top: 30px; }}
        .facts {{ background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .faq {{ margin: 20px 0; padding: 15px; border-left: 3px solid #1a73e8; background: #f8f9fa; }}
        .faq h3 {{ margin-top: 0; color: #1a73e8; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
        th {{ background: #1a73e8; color: white; }}
        tr:nth-child(even) {{ background: #f8f9fa; }}
        .price {{ color: #1a73e8; font-weight: bold; }}
        .ship-card {{ border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 8px; }}
        .port-item {{ margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }}
        footer {{ margin-top: 60px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }}
        nav a {{ margin-right: 20px; color: #1a73e8; text-decoration: none; }}
        nav a:hover {{ text-decoration: underline; }}
        .included {{ color: green; }}
        .extra {{ color: orange; }}
    </style>
</head>
<body>
    <header>
        <nav>
            <a href="/">CruiseCompare</a>
            <a href="/cruises/">Cruises</a>
            <a href="/compare/">Compare</a>
            <a href="/ships/">Ships</a>
            <a href="/destinations/">Destinations</a>
        </nav>
    </header>
    <main>
{content}
    </main>
    <footer>
        <p>&copy; 2026 CruiseCompare. All rights reserved.</p>
    </footer>
</body>
</html>"""

def render_cruise_page(data):
    """Render cruise page with FULL content"""
    title = data.get('title', 'Cruise Page')
    line = data.get('cruise_line', {})
    dest = data.get('destination', {})
    
    content = f"""
        <h1>{title}</h1>
        <p class="intro">{data.get('intro', '')}</p>
        
        <div class="facts">
            <h2>Quick Facts</h2>
            <p><strong>Price from:</strong> <span class="price">€{data.get('quick_facts', {}).get('price_from_eur', 'N/A')}</span></p>
            <p><strong>Duration:</strong> {data.get('quick_facts', {}).get('duration_range', 'N/A')}</p>
            <p><strong>Best months:</strong> {', '.join(data.get('quick_facts', {}).get('best_months', []))}</p>
            <p><strong>Ships:</strong> {', '.join(data.get('quick_facts', {}).get('ships_on_route', [])[:3])}</p>
            <p><strong>Departure ports:</strong> {', '.join(data.get('quick_facts', {}).get('departure_ports', [])[:3])}</p>
        </div>
        
        <h2>Prices by Season</h2>
        <table>
            <tr><th>Season</th><th>Inside Cabin</th><th>Balcony</th><th>Suite</th></tr>
"""
    
    for price in data.get('price_by_season', []):
        content += f"""
            <tr>
                <td>{price.get('season', '')}</td>
                <td class="price">€{price.get('inside_eur', 'N/A')}</td>
                <td class="price">€{price.get('balcony_eur', 'N/A')}</td>
                <td class="price">€{price.get('suite_eur', 'N/A')}</td>
            </tr>
"""
    
    content += "</table>"
    
    # Sample itineraries
    content += "<h2>Sample Itineraries</h2>"
    for itin in data.get('sample_itineraries', []):
        content += f"""
        <div class="ship-card">
            <h3>{itin.get('name', '')}</h3>
            <p><strong>Duration:</strong> {itin.get('duration_nights', '')} nights</p>
            <p><strong>Ports:</strong> {', '.join(itin.get('ports', []))}</p>
            <p><strong>Price from:</strong> <span class="price">€{itin.get('price_from_eur', '')}</span></p>
            <p><em>{itin.get('highlight', '')}</em></p>
        </div>
"""
    
    # Ships detail
    content += "<h2>Ships on This Route</h2>"
    for ship in data.get('ships_detail', []):
        content += f"""
        <div class="ship-card">
            <h3>{ship.get('name', '')}</h3>
            <p><strong>Capacity:</strong> {ship.get('capacity', '')} passengers</p>
            <p><strong>Year built:</strong> {ship.get('year_built', '')}</p>
            <p><strong>Best for:</strong> {ship.get('best_for', '')}</p>
            <p><strong>Price from:</strong> <span class="price">€{ship.get('price_from_eur', '')}</span></p>
        </div>
"""
    
    # What's included/extra
    content += "<h2>What's Included</h2><ul>"
    for item in data.get('whats_included', []):
        content += f"<li class='included'>{item}</li>"
    content += "</ul>"
    
    content += "<h2>What's Extra</h2><ul>"
    for item in data.get('whats_extra', []):
        content += f"<li class='extra'>{item}</li>"
    content += "</ul>"
    
    # Booking strategy
    content += f"""
        <h2>Booking Strategy</h2>
        <p>{data.get('booking_strategy', '')}</p>
"""
    
    # Top ports
    content += "<h2>Top Ports</h2>"
    for port in data.get('top_ports', []):
        content += f"""
        <div class="port-item">
            <h3>{port.get('port', '')}</h3>
            <p><strong>Time in port:</strong> {port.get('time_in_port', '')}</p>
            <p><strong>Top activity:</strong> {port.get('top_activity', '')}</p>
            <p><strong>Tip:</strong> {port.get('tip', '')}</p>
        </div>
"""
    
    # FAQs
    content += "<h2>Frequently Asked Questions</h2>"
    for faq in data.get('faqs', []):
        content += f"""
        <div class="faq">
            <h3>{faq.get('question', '')}</h3>
            <p>{faq.get('answer', '')}</p>
        </div>
"""
    
    return render_base(title, content)

def main():
    """Generate all static HTML files"""
    print("Building static HTML files with FULL content...")
    
    # Clear and create output directory
    if OUT_DIR.exists():
        import shutil
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True)
    
    # Generate index page
    index_html = render_base("CruiseCompare — Compare Cruise Lines, Ships & Deals 2026", """
        <h1>Find Your Perfect Cruise</h1>
        <p>Compare cruise lines, ships, and destinations for 2026</p>
        <p><a href="/cruises/">Browse Cruises</a> | <a href="/compare/">Compare Lines</a></p>
    """)
    (OUT_DIR / "index.html").write_text(index_html)
    print("✓ Generated: index.html")
    
    # Generate cruise pages
    count = 0
    for json_file in glob.glob(str(GEN_DIR / "cruises" / "*.json")):
        try:
            data = json.load(open(json_file))
            html = render_cruise_page(data)
            
            # Create directory structure
            parts = Path(json_file).stem.split('-')
