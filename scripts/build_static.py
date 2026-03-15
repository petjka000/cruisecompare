#!/usr/bin/env python3
"""
Generate static HTML files from JSON data for Cloudflare deployment
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
        h2 {{ color: #333; margin-top: 40px; }}
        .facts {{ background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .faq {{ margin: 20px 0; padding: 15px; border-left: 3px solid #1a73e8; background: #f8f9fa; }}
        .faq h3 {{ margin-top: 0; color: #1a73e8; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
        th {{ background: #f8f9fa; }}
        footer {{ margin-top: 60px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }}
        nav a {{ margin-right: 20px; color: #1a73e8; text-decoration: none; }}
        nav a:hover {{ text-decoration: underline; }}
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
    """Render cruise line + destination page"""
    line = data.get('cruise_line', {})
    dest = data.get('destination', {})
    title = data.get('title', f"{line.get('name', '')} {dest.get('name', '')} Cruises")
    
    content = f"""
        <h1>{title}</h1>
        <p>{data.get('intro', '')}</p>
        
        <div class="facts">
            <h2>Quick Facts</h2>
            <p><strong>Price from:</strong> €{data.get('quick_facts', {}).get('price_from_eur', 'N/A')}</p>
            <p><strong>Duration:</strong> {data.get('quick_facts', {}).get('duration_range', 'N/A')}</p>
            <p><strong>Best months:</strong> {', '.join(data.get('quick_facts', {}).get('best_months', []))}</p>
        </div>
        
        <h2>Frequently Asked Questions</h2>
"""
    
    for faq in data.get('faqs', []):
        content += f"""
        <div class="faq">
            <h3>{faq.get('question', '')}</h3>
            <p>{faq.get('answer', '')}</p>
        </div>
"""
    
    return render_base(title, content)

def render_comparison_page(data):
    """Render comparison page"""
    title = data.get('title', 'Cruise Line Comparison')
    
    content = f"""
        <h1>{title}</h1>
        <p>{data.get('intro', '')}</p>
        
        <h2>Comparison Table</h2>
        <table>
            <tr><th>Category</th><th>Line A</th><th>Line B</th></tr>
"""
    
    for row in data.get('comparison_table', []):
        content += f"<tr><td>{row.get('category', '')}</td><td>{row.get('line_a', '')}</td><td>{row.get('line_b', '')}</td></tr>"
    
    content += "</table>"
    
    content += "<h2>Frequently Asked Questions</h2>"
    for faq in data.get('faqs', []):
        content += f"""
        <div class="faq">
            <h3>{faq.get('question', '')}</h3>
            <p>{faq.get('answer', '')}</p>
        </div>
"""
    
    return render_base(title, content)

def render_port_page(data):
    """Render port page"""
    port = data.get('port', {})
    title = data.get('title', f"Cruises from {port.get('name', '')}")
    
    content = f"""
        <h1>{title}</h1>
        <p>{data.get('intro', '')}</p>
        
        <h2>Port Information</h2>
        <div class="facts">
            <p><strong>Terminals:</strong> {data.get('port_facts', {}).get('terminals', 'N/A')}</p>
            <p><strong>Cruise lines:</strong> {', '.join(data.get('port_facts', {}).get('cruise_lines', [])[:5])}</p>
        </div>
        
        <h2>Frequently Asked Questions</h2>
"""
    
    for faq in data.get('faqs', []):
        content += f"""
        <div class="faq">
            <h3>{faq.get('question', '')}</h3>
            <p>{faq.get('answer', '')}</p>
        </div>
"""
    
    return render_base(title, content)

def render_ship_page(data):
    """Render ship page"""
    title = data.get('title', 'Ship Review')
    
    content = f"""
        <h1>{title}</h1>
        <p><strong>Cruise Line:</strong> {data.get('cruise_line', 'N/A')}</p>
        
        <h2>Ship Statistics</h2>
        <div class="facts">
            <p><strong>Year Built:</strong> {data.get('ship_stats', {}).get('year_built', 'N/A')}</p>
            <p><strong>Passenger Capacity:</strong> {data.get('ship_stats', {}).get('passenger_capacity', 'N/A')}</p>
        </div>
        
        <h2>Frequently Asked Questions</h2>
"""
    
    for faq in data.get('faqs', []):
        content += f"""
        <div class="faq">
            <h3>{faq.get('question', '')}</h3>
            <p>{faq.get('answer', '')}</p>
        </div>
"""
    
    return render_base(title, content)

def render_destination_page(data):
    """Render destination page"""
    title = data.get('title', 'Destination Guide')
    
    content = f"""
        <h1>{title}</h1>
        <p>{data.get('intro', '')}</p>
        
        <h2>Quick Reference</h2>
        <div class="facts">
            <p><strong>Best months:</strong> {', '.join(data.get('quick_reference', {}).get('best_cruise_months', []))}</p>
            <p><strong>Price range:</strong> {data.get('quick_reference', {}).get('price_range_eur', 'N/A')}</p>
        </div>
        
        <h2>Frequently Asked Questions</h2>
"""
    
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
    print("Building static HTML files...")
    
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
        data = json.load(open(json_file))
        html = render_cruise_page(data)
        
        # Create directory structure: /cruises/line/destination/index.html
        parts = Path(json_file).stem.split('-')
        if len(parts) >= 2:
            line_slug = parts[0]
            dest_slug = '-'.join(parts[1:])
            page_dir = OUT_DIR / "cruises" / line_slug / dest_slug
            ensure_dir(page_dir)
            (page_dir / "index.html").write_text(html)
            count += 1
    
    print(f"✓ Generated: {count} cruise pages")
    
    # Generate comparison pages
    count = 0
    for json_file in glob.glob(str(GEN_DIR / "comparisons" / "*.json")):
        data = json.load(open(json_file))
        html = render_comparison_page(data)
        
        page_dir = OUT_DIR / "compare" / Path(json_file).stem
        ensure_dir(page_dir)
        (page_dir / "index.html").write_text(html)
        count += 1
    
    print(f"✓ Generated: {count} comparison pages")
    
    # Generate port pages
    count = 0
    for json_file in glob.glob(str(GEN_DIR / "ports" / "*.json")):
        data = json.load(open(json_file))
        html = render_port_page(data)
        
        page_dir = OUT_DIR / "from" / Path(json_file).stem
        ensure_dir(page_dir)
        (page_dir / "index.html").write_text(html)
        count += 1
    
    print(f"✓ Generated: {count} port pages")
    
    # Generate ship pages
    count = 0
    for json_file in glob.glob(str(GEN_DIR / "ships" / "*.json")):
        data = json.load(open(json_file))
        html = render_ship_page(data)
        
        page_dir = OUT_DIR / "ships" / Path(json_file).stem
        ensure_dir(page_dir)
        (page_dir / "index.html").write_text(html)
        count += 1
    
    print(f"✓ Generated: {count} ship pages")
    
    # Generate destination pages
    count = 0
    for json_file in glob.glob(str(GEN_DIR / "destinations" / "*.json")):
        data = json.load(open(json_file))
        html = render_destination_page(data)
        
        page_dir = OUT_DIR / "destinations" / Path(json_file).stem
        ensure_dir(page_dir)
        (page_dir / "index.html").write_text(html)
        count += 1
    
    print(f"✓ Generated: {count} destination pages")
    
    # Generate listing pages
    ensure_dir(OUT_DIR / "cruises")
    (OUT_DIR / "cruises" / "index.html").write_text(render_base("Cruises", "<h1>All Cruises</h1>"))
    
    ensure_dir(OUT_DIR / "compare")
    (OUT_DIR / "compare" / "index.html").write_text(render_base("Compare", "<h1>Compare Cruise Lines</h1>"))
    
    print(f"\n✅ Build complete: {OUT_DIR}")
    
    # Count total files
    total = len(list(OUT_DIR.rglob("*.html")))
    print(f"Total HTML files: {total}")

if __name__ == "__main__":
    main()
