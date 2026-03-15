# cruisecompare.online — pSEO 2.0 Implementation
# Bobi Agent Prompt — Cloudflare Pages / GitHub Static Site

---

## AUDIT FINDINGS

### Architecture (differs critically from aifly.one)
- **Host**: Cloudflare Pages (not VPS)
- **Deploy**: GitHub repo → Cloudflare Pages build pipeline
- **No WordPress, no WP-CLI, no MySQL**
- **Operated by Bobi** — all generation runs via OpenClaw on the VPS
- **Framework assumption**: Next.js or Astro (confirm by reading repo)

### Market Opportunity (cruise niche vs flight deals)
The cruise SEO space is dominated by large OTAs (Cruise.com, CruiseCritic, Carnival/RCI
direct) but they almost entirely ignore **long-tail programmatic pages**. Gaps confirmed:

| Page Type | Example Query | Monthly Volume | Competition |
|-----------|--------------|----------------|-------------|
| Line vs Line | "Royal Caribbean vs MSC which is better" | 8,100 | Low |
| Ship guides | "Oasis of the Seas review 2026" | 6,600 | Medium |
| Port departure | "Cruises from Southampton 7 nights 2026" | 4,400 | Low |
| Destination+Line | "MSC Mediterranean cruises 2026" | 3,600 | Medium |
| Duration+Dest | "7 night Caribbean cruise deals 2026" | 2,900 | Low |
| Ship comparison | "Symphony vs Wonder of the Seas" | 1,900 | Very Low |
| Packing/tips | "what to pack for Caribbean cruise 2026" | 1,600 | Very Low |
| Port guides | "Barcelona cruise port guide 2026" | 1,200 | Very Low |

None of these are being captured at scale by any single site. Total addressable
keyword universe: ~15,000–20,000 pages across 7 page types.

### Taxonomy (the data foundation everything is built from)

```
CRUISE LINES (15):
Royal Caribbean, Carnival, Norwegian (NCL), MSC, Celebrity, Princess,
Holland America, Cunard, P&O, Costa, AIDA, TUI Cruises, Marella,
Fred Olsen, Virgin Voyages

DESTINATIONS (20):
Caribbean, Mediterranean, Norwegian Fjords, Baltic & Scandinavia,
Alaska, Canary Islands, Transatlantic, British Isles, Northern Europe,
Arabian Gulf, Indian Ocean, South America, Antarctica, Australia & Pacific,
Hawaii, Japan & Asia, Africa & Canaries, Greek Isles, Adriatic,
Black Sea

DEPARTURE PORTS (25):
Southampton, Barcelona, Miami, Fort Lauderdale, Rome (Civitavecchia),
Venice/Trieste, Piraeus (Athens), Lisbon, Hamburg, Copenhagen,
Amsterdam, Genoa, Marseille, Malaga, Palma de Mallorca,
New York, Seattle, Vancouver, Sydney, Dubai, Singapore,
San Juan (Puerto Rico), Galveston, Tampa, New Orleans

DURATIONS:
3-4 night, 7 night, 10-14 night, 15-21 night, World Cruise

TRIP TYPES (10):
Family, Adults-Only, Luxury, River Cruise, Expedition/Polar,
Solo Traveller, First-Time Cruiser, Honeymoon, Senior, Budget

SHIPS (top 40 by search volume):
Oasis of the Seas, Wonder of the Seas, Symphony of the Seas,
Icon of the Seas, Allure of the Seas, Harmony of the Seas,
MSC Seashore, MSC Bellissima, MSC Grandiosa, MSC World Europa,
Carnival Celebration, Carnival Vista, Carnival Jubilee,
Norwegian Encore, Norwegian Prima, Norwegian Epic,
Celebrity Edge, Celebrity Apex, Celebrity Beyond,
Cunard Queen Mary 2, Queen Anne,
P&O Iona, P&O Arvia,
... (full list in taxonomy/ships.json)
```

---

## PAGE TYPE TAXONOMY — 7 Page Types, ~8,000+ Pages

| # | Page Type | URL Pattern | Target Count | Priority |
|---|-----------|-------------|-------------|----------|
| 1 | Cruise Line + Destination | /cruises/{line}/{destination}/ | 300 | Highest |
| 2 | Cruise Line Comparison | /compare/{line-a}-vs-{line-b}/ | 105 | Highest |
| 3 | Departure Port Pages | /from/{port}/ | 25 | High |
| 4 | Ship Reviews | /ships/{ship-slug}/ | 40 | High |
| 5 | Ship Comparisons | /compare/ships/{ship-a}-vs-{ship-b}/ | 200 | Medium |
| 6 | Destination Guides | /destinations/{destination}/ | 20 | High |
| 7 | Resource Pages | /guides/{type}-{destination}/ | 200+ | Medium |

**Total first phase: ~890 pages**

---

## BOBI PROMPT — Full Implementation

```
You are Bobi, operating on the aifly.one VPS. Your task is to implement 
pSEO 2.0 for cruisecompare.online — a cruise comparison static site 
hosted on Cloudflare Pages via GitHub.

STEP 1 — Read the repository structure
Clone or pull the cruisecompare.online GitHub repo to:
  ~/workspace/cruisecompare/

Read the repo structure:
  find ~/workspace/cruisecompare -maxdepth 3 -not -path '*/node_modules/*' \
    -not -path '*/.git/*' | head -60

Identify:
- Framework: Next.js (pages/ or app/ dir) vs Astro (.astro files) vs other
- How existing pages are built (static JSON data files? MDX? API routes?)
- Current page count: find pages/ or src/pages/ or content/ and count
- Build command and output directory (check package.json or astro.config.*)
- GitHub Actions workflow file location (.github/workflows/)
- Cloudflare Pages config (wrangler.toml or Cloudflare dashboard settings)

Report what you find before proceeding.

STEP 2 — Set up taxonomy data

Create the data foundation at ~/workspace/cruisecompare/src/data/taxonomy/:

taxonomy/cruise-lines.json
taxonomy/destinations.json  
taxonomy/ports.json
taxonomy/ships.json
taxonomy/trip-types.json

cruise-lines.json format:
[
  {
    "slug": "royal-caribbean",
    "name": "Royal Caribbean",
    "parent_company": "Royal Caribbean Group",
    "founded": 1969,
    "headquarters": "Miami, Florida",
    "fleet_size": 26,
    "ship_count": 26,
    "known_for": "Mega-ships, innovative onboard features, family-friendly",
    "price_tier": "mid-range",
    "best_for": ["families", "first-time-cruisers", "adventure-seekers"],
    "worst_for": ["luxury seekers", "quiet escape"],
    "avg_price_7night_inside": 699,
    "avg_price_7night_balcony": 1099,
    "loyalty_program": "Crown & Anchor Society",
    "key_ships": ["Icon of the Seas", "Wonder of the Seas", "Oasis of the Seas"],
    "top_destinations": ["Caribbean", "Mediterranean", "Alaska"],
    "departure_ports": ["Miami", "Fort Lauderdale", "Barcelona", "Southampton"],
    "strengths": [
      "Largest ships in the world with unmatched amenities",
      "Strongest entertainment offering including ice shows and Broadway",
      "FlowRider surf simulators, rock climbing walls, zip lines",
      "Strong kids clubs (Adventure Ocean) for all ages"
    ],
    "weaknesses": [
      "Ships can feel crowded with 5,000+ passengers",
      "Upcharge restaurants add significantly to base cost",
      "Less authentic port experiences due to crowd size"
    ],
    "website": "https://www.royalcaribbean.com",
    "booking_tip": "Book the NextCruise program onboard for best pricing on future sailings"
  }
  // ... 14 more cruise lines
]

destinations.json format:
[
  {
    "slug": "caribbean",
    "name": "Caribbean",
    "region": "Americas",
    "best_months": ["December", "January", "February", "March", "April"],
    "avoid_months": ["August", "September"],
    "avoid_reason": "Peak hurricane season",
    "avg_duration_nights": 7,
    "typical_ports": [
      {"port": "Cozumel, Mexico", "highlight": "Snorkelling, Mayan ruins at Tulum"},
      {"port": "Nassau, Bahamas", "highlight": "Cable Beach, Atlantis resort day pass"},
      {"port": "St. Maarten", "highlight": "Shopping, dual Dutch/French culture"},
      {"port": "Labadee, Haiti", "highlight": "Royal Caribbean's private beach resort"},
      {"port": "Grand Cayman", "highlight": "Stingray City, Seven Mile Beach"}
    ],
    "climate": "Tropical, hot and humid year-round, 25-32°C",
    "currency_tip": "USD widely accepted at ports. Carry small bills for local vendors.",
    "visa_note": "Most islands are visa-free for EU/US passport holders",
    "excursion_budget_pp": "€40-150 per port",
    "best_cruise_lines": ["Royal Caribbean", "Carnival", "Norwegian", "MSC"],
    "embarkation_ports": ["Miami", "Fort Lauderdale", "San Juan", "Galveston"],
    "sub_regions": ["Eastern Caribbean", "Western Caribbean", "Southern Caribbean"]
  }
  // ... 19 more destinations
]

ports.json format:
[
  {
    "slug": "southampton",
    "name": "Southampton",
    "country": "United Kingdom",
    "iata_nearby": "LHR",
    "terminal_count": 4,
    "terminals": ["Queen Elizabeth II Terminal", "City Cruise Terminal", "Mayflower Terminal", "Ocean Terminal"],
    "cruise_lines_operating": ["P&O", "Cunard", "Royal Caribbean", "MSC", "Norwegian", "Celebrity", "Fred Olsen", "Marella", "Virgin Voyages"],
    "train_from_london_victoria": "1h 20m, from £15",
    "train_from_london_waterloo": "1h 15m, from £12",
    "parking_cost_per_day": "£20-30",
    "nearest_airport": "Southampton Airport (10 min) or Heathrow (1h 30min)",
    "hotel_tip": "Premier Inn Southampton West Quay for port proximity, from £70/night",
    "embarkation_tip": "Arrive 30-60 min before your allocated boarding time. Most lines use timed boarding now.",
    "destinations_served": ["Caribbean", "Canary Islands", "Mediterranean", "Norwegian Fjords", "Baltic", "Transatlantic", "British Isles"],
    "busiest_months": ["July", "August", "September"],
    "quietest_months": ["January", "February", "November"]
  }
  // ... 24 more ports
]

ships.json format:
[
  {
    "slug": "oasis-of-the-seas",
    "name": "Oasis of the Seas",
    "cruise_line": "Royal Caribbean",
    "year_built": 2009,
    "last_refurb": 2019,
    "gross_tonnage": 226963,
    "passenger_capacity": 5400,
    "crew_size": 2165,
    "length_metres": 361,
    "decks": 18,
    "cabin_count": 2704,
    "cabin_types": ["Interior", "Ocean View", "Balcony", "Junior Suite", "Grand Suite", "Owner's Suite"],
    "neighborhoods": ["Central Park", "Boardwalk", "Royal Promenade", "Pool and Sports Zone", "Vitality Spa and Fitness", "Entertainment Place", "Youth Zone"],
    "dining_venues": 20,
    "specialty_restaurants": ["Chops Grille", "Giovanni's Italian Kitchen", "Hooked Seafood"],
    "entertainment": ["AquaTheatre", "Studio B ice skating", "Zip line", "FlowRider surfing", "Rock climbing wall"],
    "pools": 4,
    "water_slides": 4,
    "casino": true,
    "spa": true,
    "kids_club": "Adventure Ocean (ages 3-17)",
    "home_ports": ["Miami", "Barcelona"],
    "typical_itineraries": ["7-night Eastern Caribbean", "7-night Western Caribbean", "Mediterranean"],
    "avg_inside_price_7night": 749,
    "avg_balcony_price_7night": 1149,
    "passenger_review_score": 4.3,
    "best_for": ["Families", "First-timers", "People who want resort-style ship"],
    "not_ideal_for": ["Those wanting quiet, small-ship feel", "Budget solo travellers"],
    "sister_ships": ["Allure of the Seas", "Harmony of the Seas", "Symphony of the Seas", "Wonder of the Seas"],
    "notable_feature": "One of the original mega-ships — AquaTheatre water shows are unmissable"
  }
  // ... 39 more ships
]

STEP 3 — Generate taxonomy data via MiniMax M2.5

Use the existing minimax_client.py pattern. Create:
  ~/workspace/cruisecompare/scripts/generate_taxonomy.py

For each taxonomy file, generate the full data using MiniMax M2.5.
The models know cruise industry facts accurately — use temperature 0.3 for
factual taxonomy data (lower temperature = more accurate facts).

System prompt for taxonomy generation:
"You are a cruise industry expert. Generate accurate, factual data about
cruise lines, ships, destinations, and ports. All prices in EUR/GBP as
appropriate. All facts must be accurate for 2025-2026.
Output ONLY valid JSON. No preamble."

Validate each taxonomy file:
- cruise-lines.json: 15 entries, each has all required fields
- destinations.json: 20 entries, each has ports array with highlights
- ports.json: 25 entries, each has transport options with real prices
- ships.json: 40 entries, each has accurate passenger capacity

STEP 4 — Build page generators (one per page type)

4A. Cruise Line + Destination Pages (300 pages)
    URL: /cruises/{line}/{destination}/
    Example: /cruises/royal-caribbean/caribbean/
    Title: "Royal Caribbean Caribbean Cruises 2026 — Itineraries, Prices & Ships"

    Required content (all VISIBLE, no accordions):
    - Quick facts box: price from, duration range, ships on route, best months
    - Available itineraries: list of actual itineraries with port stops and durations
    - Ships on this route: cards showing ship name, capacity, key features
    - Price breakdown: inside/balcony/suite by season (table)
    - What's included vs not included: specific to this cruise line
    - Best time to book: specific advice for this line+destination combo
    - Top ports on this route: 3-5 ports with what to do there
    - 8 FAQs with full answers (60-100 words each)

4B. Cruise Line Comparison Pages (105 pages)
    URL: /compare/{line-a}-vs-{line-b}/
    Example: /compare/royal-caribbean-vs-msc/
    Title: "Royal Caribbean vs MSC Cruises 2026 — Which Is Better?"

    Required content:
    - Side-by-side comparison table (at a glance)
    - Price comparison: inside/balcony/suite for equivalent routes
    - Ship size & style comparison
    - Entertainment comparison
    - Dining comparison (included vs specialty)
    - Family-friendliness score and explanation
    - Loyalty program comparison
    - Who should choose Line A (specific persona)
    - Who should choose Line B (specific persona)
    - Verdict for 5 traveller types: families, solo, luxury, budget, first-time
    - 6 FAQs with full answers

4C. Departure Port Pages (25 pages)
    URL: /from/{port}/
    Example: /from/southampton/
    Title: "Cruises from Southampton 2026 — All Lines, Dates & Itineraries"

    Required content:
    - Port overview: terminals, facilities, parking
    - How to get there: trains, airport transfers, with prices and times
    - Cruise lines departing from here
    - Destinations reachable from this port (with typical durations)
    - Seasonal calendar: which lines operate when
    - Hotel recommendations near port
    - Embarkation tips: parking, drop-off, luggage
    - 6 FAQs with full answers

4D. Ship Review Pages (40 pages)
    URL: /ships/{ship-slug}/
    Example: /ships/oasis-of-the-seas/
    Title: "Oasis of the Seas Review 2026 — Cabins, Dining, Entertainment & Tips"

    Required content:
    - Ship at a glance: stats table (tonnage, capacity, decks, year built)
    - Cabin guide: types, sizes, what to book, what to avoid
    - Dining: all included restaurants listed, specialty restaurants with prices
    - Entertainment: specific shows, activities, highlights
    - Pools & deck: layout, best spots, how crowded
    - Best for / Not ideal for
    - Comparison to sister ships
    - Booking tips: best cabins, best decks, what to pre-book
    - 8 FAQs with full answers

4E. Ship Comparison Pages (200 pages)
    URL: /compare/ships/{ship-a}-vs-{ship-b}/
    Example: /compare/ships/oasis-of-the-seas-vs-msc-seashore/
    Title: "Oasis of the Seas vs MSC Seashore — Which Ship Is Better in 2026?"

    Cross all ships within similar size/price tier.
    Content: side-by-side stats, dining, entertainment, cabin sizes, price difference.

4F. Destination Guides (20 pages)
    URL: /destinations/{destination}/
    Example: /destinations/mediterranean/
    Title: "Mediterranean Cruises 2026 — Complete Guide to Ships, Ports & Prices"

    Required content:
    - Destination overview: geography, climate, best ports
    - Which cruise lines sail here
    - Best time to cruise here (month by month)
    - Top ports: 6-8 ports with what to do, how long you get there
    - Which itinerary is right for you (Eastern vs Western Mediterranean etc)
    - Price guide: budget to luxury range
    - Packing tips specific to this destination
    - 8 FAQs with full answers

4G. Resource/Guide Pages (200 pages)
    URL: /guides/{type}-{destination}/
    Examples:
      /guides/packing-list-caribbean-cruise/
      /guides/first-time-cruise-tips/
      /guides/cruise-excursions-mediterranean/
      /guides/sea-sickness-prevention-cruise/
      /guides/cruise-dress-code-guide/

    Generate 10 guide types × 20 destinations = 200 pages.

STEP 5 — Static site generation approach

Since this is a Cloudflare Pages site (NOT WordPress), generation works differently:

If Next.js (app router):
  - Create src/app/cruises/[line]/[destination]/page.tsx
  - Use generateStaticParams() to enumerate all 300 line+destination combos
  - Data loaded from src/data/generated/{type}/{slug}.json at build time
  - No runtime API calls — all static HTML

If Next.js (pages router):
  - Create pages/cruises/[line]/[destination].tsx
  - Use getStaticPaths() + getStaticProps()
  - Same data loading pattern

If Astro:
  - Create src/pages/cruises/[line]/[destination].astro
  - Use getStaticPaths() with all combinations
  - Same data pattern

CREATE data files at: src/data/generated/{type}/{slug}.json
BUILD pages using: static generation from those JSON files
DEPLOY via: git push → GitHub Actions → Cloudflare Pages build

Cloudflare Pages build limits:
- Free tier: 500 builds/month, unlimited bandwidth
- Build timeout: 20 minutes — keep total page count under 2,000 for first deploy
- Static HTML: 25,000 files max on free tier

STEP 6 — Schema markup (critical for rich results)

Each page type needs specific schema:

Cruise Line + Destination pages → TouristDestination + FAQPage
Comparison pages → FAQPage + Article (with comparison datePublished)
Ship Review pages → Product + Review + FAQPage
Port pages → TouristAttraction + FAQPage
Resource pages → HowTo (for packing lists/checklists) or FAQPage

Add to layout component (runs on every page):
  <script type="application/ld+json">
    {JSON.stringify(pageSchema)}
  </script>

STEP 7 — Internal linking structure

This is the "mesh" that turns isolated pages into topical authority:

Cruise Line + Destination page links to:
  → The Cruise Line's comparison pages (e.g. "Compare RCI vs MSC")
  → Ships on that route (ship review pages)
  → The destination guide
  → Port pages for departure ports that serve this route

Ship Review page links to:
  → The cruise line's destination pages
  → Ship comparison pages (vs sister ships, vs competitors)

Port page links to:
  → All cruise line + destination pages departing from that port
  → Destination guides

Destination Guide links to:
  → All cruise line + destination pages for that destination
  → Port pages that serve this destination
  → Resource/guide pages for this destination

STEP 8 — Sitemap generation

Generate sitemaps and submit to GSC:
  /sitemap-cruises.xml      (cruise line + destination pages)
  /sitemap-comparisons.xml  (line comparisons + ship comparisons)
  /sitemap-ships.xml        (ship reviews)
  /sitemap-ports.xml        (port pages)
  /sitemap-destinations.xml (destination guides)
  /sitemap-guides.xml       (resource pages)
  /sitemap-index.xml        (references all above)

For Next.js: use next-sitemap or generate in scripts/generate-sitemaps.js
For Astro: use @astrojs/sitemap or custom script

STEP 9 — Execution order

Run all generation scripts on the VPS, then commit to GitHub:

  cd ~/workspace/cruisecompare

  # 1. Generate taxonomy (run once, fast)
  python3 scripts/generate_taxonomy.py

  # 2. Generate cruise line + destination pages (300 — highest priority)
  python3 scripts/generate_line_destination.py --workers 6

  # 3. Generate comparison pages (105 line comparisons)
  python3 scripts/generate_comparisons.py --workers 6

  # 4. Generate ship reviews (40)
  python3 scripts/generate_ships.py --workers 4

  # 5. Generate port pages (25)
  python3 scripts/generate_ports.py --workers 4

  # 6. Generate destination guides (20)
  python3 scripts/generate_destinations.py --workers 4

  # 7. Generate resource pages (200)
  python3 scripts/generate_resources.py --workers 6

  # 8. Build sitemaps
  node scripts/generate-sitemaps.js

  # 9. Commit and push (triggers Cloudflare Pages build)
  git add -A
  git commit -m "feat: pSEO 2.0 — 890 programmatic cruise pages"
  git push origin main

STEP 10 — Post-deploy validation

After Cloudflare Pages build completes:

  # Check a sample of live pages exist
  curl -s -o /dev/null -w "%{http_code}" https://cruisecompare.online/cruises/royal-caribbean/caribbean/
  curl -s -o /dev/null -w "%{http_code}" https://cruisecompare.online/compare/royal-caribbean-vs-msc/
  curl -s -o /dev/null -w "%{http_code}" https://cruisecompare.online/from/southampton/

  # Check sitemap is accessible
  curl -s https://cruisecompare.online/sitemap-index.xml | head -20

  # Verify schema on a live page
  # Paste URL into: https://search.google.com/test/rich-results

Then submit sitemap-index.xml to Google Search Console.

CONSTRAINTS:
- Use MiniMax M2.5 via OpenClaw OAuth (same client as aifly autoposter)
  Auth: ~/.openclaw/agents/main/agent/auth-profiles.json
- Temperature 0.3 for taxonomy/factual data, 0.7 for descriptive content
- Do NOT modify the aifly.one autoposter pipeline at all
- Commit to cruisecompare GitHub repo only — separate from aifly workspace
- If Cloudflare Pages build fails, check: file count limit, build timeout,
  missing environment variables
- Quality gate: all FAQs 40+ words, all comparison tables complete,
  no placeholder text like "TBD" or "coming soon"
```

---

## KEY DIFFERENCES VS AIFLY.ONE

| Factor | aifly.one | cruisecompare.online |
|--------|-----------|---------------------|
| CMS | WordPress (WP-CLI) | Static site (Cloudflare Pages) |
| Deploy | Direct VPS file write | git push → build pipeline |
| Data format | WordPress posts | JSON files read at build time |
| Update speed | Instant (WP-CLI) | ~2 min build time per deploy |
| Scale limit | DB/PHP limit | 25,000 files (free tier) |
| Schema injection | PHP (aifly-custom plugin) | JSX/Astro component |
| Internal links | PHP mu-plugin | Static template links |
| Accordion risk | High (old theme) | Low (build from scratch) |

## COMPETITIVE ADVANTAGE CRUISECOMPARE.ONLINE CAN OWN

1. **Cruise line comparison pages** — almost no one does these programmatically.
   "Royal Caribbean vs MSC" gets 8,100 searches/month. There are 105 possible
   line-vs-line combos. Total: ~850,000 monthly search impressions available.

2. **Ship comparison pages** — "Oasis vs Wonder of the Seas" type queries are
   completely underserved. Cruise Critic has reviews but no structured comparisons.
   200 ship comparison pages could own this niche entirely.

3. **Port departure pages** — "Cruises from Southampton 2026" is searched 4,400x/month.
   Each port page becomes the hub for every cruise line operating from there.

4. **Freshness signal** — adding "(2026)" to all titles immediately competes with
   older content from major sites that update slowly. Same tactic that worked on aifly.
```
