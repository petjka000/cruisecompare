# CruiseCompare Autoposter — Phase 1: Core Deal Pipeline
# ========================================================
# Load with: /read /home/padmin/scripts/cruise-autoposter-phase1.md
# Then: "Execute everything in this file. Ultrathink."
#
# PHASES OVERVIEW:
# Phase 1 (this file): Scrape deals → JSON → git push → live on site
# Phase 2 (later): Port guides pSEO (like airport guides for aifly)
# Phase 3 (later): Ship reviews, destination guides, internal linking


You are building a cruise deal autoposter for cruisecompare.online. This follows the same pattern as the aifly.one autoposter but adapted for a Next.js static site deployed to Cloudflare Pages via GitHub.

## CONFIRMED ARCHITECTURE

**Site stack:**
- Next.js 16 with static export (output: `out/` directory)
- Tailwind CSS 4
- Deployed to Cloudflare Pages via Wrangler
- GitHub repo: petjka000/cruisecompare
- Auto-deploy: push to main → GitHub Actions → `wrangler deploy`

**Publishing flow (NOT like aifly):**
```
Scrape deals → Generate JSON data file → Place in src/data/generated/deals/
→ next build (generates static HTML into out/)
→ git add + commit + push to main
→ GitHub Actions deploys to Cloudflare
```

**Content generation:** MiniMax M2.5 API already configured in `scripts/generate_content.py`

**Existing site structure:**
```
src/app/
├── cruises/[line]/[destination]/page.tsx   ← only page.tsx that exists
├── ships/[ship]/                           ← route exists, no page.tsx
├── destinations/[destination]/             ← route exists, no page.tsx
├── guides/[type]-[destination]/            ← route exists, no page.tsx
├── compare/[lineA]-vs-[lineB]/            ← route exists, no page.tsx
├── from/[port]/                            ← route exists, no page.tsx
├── page.tsx                                ← homepage
└── layout.tsx                              ← root layout
```

**Existing data:** Only `src/data/generated/comparisons/*.json` (~20 files)

**Working directory:** `/home/padmin/workspace/cruisecompare`

---

## STEP 1: UNDERSTAND THE EXISTING CODEBASE

Read these files first — understand before building:

```bash
cd /home/padmin/workspace/cruisecompare

# 1. How the site renders content
cat src/app/cruises/[line]/[destination]/page.tsx
cat src/app/page.tsx
cat src/app/layout.tsx

# 2. How existing data is structured
cat src/data/generated/comparisons/royal-caribbean-vs-carnival.json | python3 -m json.tool | head -40

# 3. How content generation works
cat scripts/generate_content.py
cat scripts/gen_all.py

# 4. Check if there's a taxonomy/seed data
find src/data/ -name "*.json" -not -path "*/generated/*" | head -10
ls src/data/

# 5. What dynamic routes expect
find src/app/ -name "page.tsx" -o -name "page.ts"

# 6. Build config
cat next.config.ts
cat wrangler.toml

# 7. How GitHub Actions deploys
cat .github/workflows/deploy.yml
```

**Report what you find** about:
- How does `[line]/[destination]/page.tsx` read JSON data?
- What data shape does it expect?
- Are there `generateStaticParams()` functions for SSG?
- What's the build + export process?

---

## STEP 2: IDENTIFY CRUISE DEAL SOURCES

Research and identify 3-5 scrapeable cruise deal sources. Test each with curl:

```bash
# Test these sources — check if accessible, what format they return
curl -sI --max-time 10 "https://www.cruisesheet.com" | head -3
curl -sI --max-time 10 "https://www.vacationstogo.com/cruise-deals.cfm" | head -3
curl -sI --max-time 10 "https://www.cruisecritic.com/deals/" | head -3
curl -sI --max-time 10 "https://www.cruise.com/deals/" | head -3
curl -sI --max-time 10 "https://www.dreamlines.com/cruise-deals" | head -3

# Also check RSS feeds
curl -s "https://www.cruisecritic.com/rss/deals/" | head -20 2>/dev/null
```

For any source behind Cloudflare, test with jina.ai bypass (same as aifly):
```bash
curl -sI --max-time 15 "https://r.jina.ai/https://www.cruisesheet.com" | head -3
```

Report which sources are accessible and what data they provide. If a source has an RSS feed, prefer that — it's more reliable than HTML scraping.

---

## STEP 3: CREATE THE DEAL DATA STRUCTURE

Based on what you learned from Step 1 about how the site reads data, create the deal JSON schema.

A cruise deal should contain at minimum:

```json
{
  "slug": "royal-caribbean-mediterranean-7-night-from-599",
  "title": "Royal Caribbean Mediterranean 7-Night from €599",
  "cruise_line": "Royal Caribbean",
  "ship": "Wonder of the Seas",
  "destination": "Mediterranean",
  "departure_port": "Barcelona",
  "duration_nights": 7,
  "price_eur": 599,
  "price_per_night": 85,
  "original_price_eur": 899,
  "discount_pct": 33,
  "departure_dates": ["2026-06-15", "2026-07-20", "2026-08-10"],
  "ports_of_call": ["Marseille", "Genoa", "Naples", "Mallorca"],
  "includes": ["meals", "entertainment", "pool"],
  "excludes": ["drinks", "excursions", "gratuities"],
  "booking_url": "https://...",
  "source": "cruisesheet.com",
  "scraped_at": "2026-03-19T12:00:00Z",
  "published_at": "2026-03-19T12:05:00Z",
  "meta_description": "Book Royal Caribbean Mediterranean cruise...",
  "excerpt": "7-night Mediterranean cruise from Barcelona..."
}
```

Save to: `src/data/generated/deals/{slug}.json`

---

## STEP 4: CREATE THE DEAL PAGE ROUTE

The deals need a page to render on. Create (or verify exists) the dynamic route:

**If `src/app/deals/[deal]/page.tsx` doesn't exist, create it.**

The page should:
1. Import the deal JSON from `src/data/generated/deals/`
2. Render a deal page similar to aifly.one's deal posts (see screenshot context)
3. Include: hero section with destination image, price badge, route info table, booking CTA button, departure dates, what's included/excluded
4. Have `generateStaticParams()` that reads all JSON files in the deals directory
5. Have `generateMetadata()` for SEO (title, description, OG tags)
6. Match the existing site design (check layout.tsx and globals.css for styles)
7. Link to relevant port guides and ship reviews when they exist (future Phase 2)

**Also create or update `src/app/deals/page.tsx`** — the deals index page that lists all deals, sorted by newest first.

**Update the homepage `src/app/page.tsx`** to show the latest 6-10 deals.

---

## STEP 5: CREATE THE SCRAPER

Create `/home/padmin/workspace/cruisecompare/scripts/cruise_scraper.py`:

The scraper should:
1. Scrape deals from the sources identified in Step 2
2. Parse each deal into the JSON structure from Step 3
3. Use jina.ai bypass for Cloudflare-protected sources (same pattern as aifly)
4. Deduplicate against existing deals in `src/data/generated/deals/`
5. Validate required fields (cruise_line, destination, price, departure_port)
6. Return a list of new deal objects

**Follow the aifly pattern:**
- Use the same Cloudflare bypass technique (jina.ai prefix)
- Similar error handling and logging
- Skip deals that are already posted (check by slug or title hash)
- Log skipped deals to `logs/skipped_deals.log`

---

## STEP 6: CREATE THE PUBLISHER

Create `/home/padmin/workspace/cruisecompare/scripts/cruise_publisher.py`:

The publisher is different from aifly — instead of POSTing to WordPress, it:
1. Takes a list of new deals from the scraper
2. Writes each as a JSON file to `src/data/generated/deals/{slug}.json`
3. Runs `next build` to regenerate static HTML (this is the expensive step)
4. Commits and pushes to GitHub:
```python
import subprocess

def publish_deals(deals: list) -> bool:
    """Write deal JSONs, build, and deploy via git push."""
    
    # 1. Write JSON files
    for deal in deals:
        path = f"src/data/generated/deals/{deal['slug']}.json"
        with open(path, 'w') as f:
            json.dump(deal, f, indent=2)
    
    # 2. Build static site
    result = subprocess.run(['npm', 'run', 'build'], capture_output=True, timeout=300)
    if result.returncode != 0:
        log_error(f"Build failed: {result.stderr}")
        return False
    
    # 3. Git push (triggers Cloudflare deploy)
    subprocess.run(['git', 'add', '-A'])
    subprocess.run(['git', 'commit', '-m', f'deals: {len(deals)} new cruise deals'])
    subprocess.run(['git', 'push', 'origin', 'main'])
    
    return True
```

**Important optimization:** Don't rebuild for every single deal. Batch all new deals from one scrape cycle, write all JSONs, then build ONCE and push ONCE.

---

## STEP 7: CREATE THE AUTOPOSTER ENTRY POINT

Create `/home/padmin/workspace/cruisecompare/scripts/cruise_autoposter.py`:

This is the main script that cron runs. It orchestrates:
1. Load existing deals (for dedup)
2. Run scraper
3. Filter new deals
4. Write JSON files
5. Build static site
6. Git commit + push
7. Send Telegram notification
8. Clean up temp files

```python
#!/usr/bin/env python3
"""CruiseCompare Autoposter — scrape, build, deploy cruise deals."""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from cruise_scraper import scrape_all_sources
from cruise_publisher import publish_deals

def main():
    # 1. Scrape
    new_deals = scrape_all_sources()
    
    if not new_deals:
        print("No new deals found")
        return
    
    # 2. Publish (write JSON + build + git push)
    success = publish_deals(new_deals)
    
    # 3. Notify
    if success:
        notify_telegram(f"🚢 {len(new_deals)} new cruise deals published to cruisecompare.online")
    else:
        notify_telegram(f"❌ Cruise autoposter failed during publish")

if __name__ == "__main__":
    main()
```

---

## STEP 8: CREATE THE CRON WRAPPER

Create `/home/padmin/workspace/cruisecompare/scripts/run_cruise_autoposter.sh`:

```bash
#!/bin/bash
cd /home/padmin/workspace/cruisecompare
echo "=== Cruise autoposter run: $(date) ===" >> /home/padmin/cruise_autoposter.log
python3 scripts/cruise_autoposter.py >> /home/padmin/cruise_autoposter.log 2>&1
EXIT_CODE=$?
echo "=== Done (exit: $EXIT_CODE): $(date) ===" >> /home/padmin/cruise_autoposter.log

# Telegram notification
if [ $EXIT_CODE -eq 0 ]; then
    DEALS=$(find src/data/generated/deals/ -name "*.json" -mmin -180 | wc -l)
    /home/padmin/.claude/hooks/telegram-send.sh "🚢 <b>Cruise autoposter OK</b>
New deals: ${DEALS}
Time: $(date '+%H:%M')"
else
    /home/padmin/.claude/hooks/telegram-send.sh "❌ <b>Cruise autoposter FAILED</b>
Exit: ${EXIT_CODE}
Time: $(date '+%H:%M')"
fi

# Post-publish cleanup (temp files only — keep the deal JSONs!)
find /tmp -name "cruise_scrape_*" -mmin +60 -delete 2>/dev/null
```

Make it executable: `chmod +x /home/padmin/workspace/cruisecompare/scripts/run_cruise_autoposter.sh`

**DO NOT add to crontab yet.** We test manually first. Cron comes after Peter confirms it works.

---

## STEP 9: ADD CRUISECOMPARE CLAUDE CODE SKILL

Create `/home/padmin/.claude/skills/cruisecompare/SKILL.md`:

```markdown
---
name: cruisecompare
description: CruiseCompare.online development — cruise deals, scraping, static site publishing, Cloudflare deployment
---

## Site: cruisecompare.online
Next.js 16 static export → Cloudflare Pages via GitHub Actions

## Working directory
/home/padmin/workspace/cruisecompare

## Publish flow (different from aifly!)
1. Write JSON to src/data/generated/deals/
2. npm run build (generates out/ with static HTML)
3. git add + commit + push main
4. GitHub Actions deploys to Cloudflare automatically

## Key directories
- src/data/generated/deals/ — cruise deal data (JSON)
- src/data/generated/comparisons/ — cruise line comparisons (pSEO)
- scripts/ — scraper, publisher, content generation
- out/ — static build output (committed to git for deployment)

## Content generation
- MiniMax M2.5 API (credentials in scripts/generate_content.py)
- Templates follow JSON structure imported by Next.js pages

## Commands
npm run dev — local dev server
npm run build — static export to out/
python3 scripts/cruise_autoposter.py — run full scrape+publish cycle

## Rules
- ALWAYS batch deals: write all JSONs first, then ONE build, ONE push
- Build takes ~1-3 minutes — don't trigger unnecessary builds
- The out/ directory is committed to git (Cloudflare serves it directly)
- .gitignore should exclude node_modules, .next, logs/
- Test with npm run dev before pushing to main
```

---

## STEP 10: UPDATE MONITORING

Update the daily Telegram summary script to include cruise autoposter status:

Read `/home/padmin/scripts/daily-telegram-summary.sh` and add cruise metrics:

```bash
# Cruise autoposter
CRUISE_DEALS=$(find /home/padmin/workspace/cruisecompare/src/data/generated/deals/ -name "*.json" 2>/dev/null | wc -l)
CRUISE_LAST_RUN=$(tail -3 /home/padmin/cruise_autoposter.log 2>/dev/null | grep "Done" | tail -1 | head -c 40 || echo "never")
```

Add to the Telegram message: `🚢 Cruise deals: ${CRUISE_DEALS} total | Last: ${CRUISE_LAST_RUN}`

---

## STEP 11: TEST

1. Run the scraper standalone to see if sources return data:
```bash
cd /home/padmin/workspace/cruisecompare
python3 -c "from scripts.cruise_scraper import scrape_all_sources; deals = scrape_all_sources(); print(f'{len(deals)} deals found')"
```

2. If deals found, write one test deal JSON manually and verify the site builds:
```bash
# Write a test deal
python3 -c "
import json
deal = {
    'slug': 'test-deal-royal-caribbean-med',
    'title': 'Test: Royal Caribbean Mediterranean 7-Night from €599',
    'cruise_line': 'Royal Caribbean',
    'destination': 'Mediterranean',
    'departure_port': 'Barcelona',
    'duration_nights': 7,
    'price_eur': 599,
    'source': 'test',
    'scraped_at': '2026-03-19T12:00:00Z'
}
with open('src/data/generated/deals/test-deal-royal-caribbean-med.json', 'w') as f:
    json.dump(deal, f, indent=2)
print('Test deal written')
"

# Try building
npm run build 2>&1 | tail -10

# If build succeeds, check if the deal page was generated
ls out/deals/ 2>/dev/null

# Clean up test deal
rm src/data/generated/deals/test-deal-royal-caribbean-med.json
```

3. If build works, try the full autoposter (without git push):
```bash
python3 scripts/cruise_autoposter.py --dry-run 2>&1 | tail -20
```

**Report what works and what doesn't. DO NOT push to git until Peter confirms.**

---

## REPORTING FORMAT

```
CRUISE AUTOPOSTER — PHASE 1
==============================

Codebase analysis:
- Next.js page structure: [how deals are rendered]
- Data format: [JSON schema used]
- Build process: [working / issues]

Sources tested:
  cruisesheet.com:    [accessible / blocked / RSS available]
  vacationstogo.com:  [accessible / blocked]
  cruisecritic.com:   [accessible / blocked / RSS available]
  [others]:           [status]

Files created:
- scripts/cruise_scraper.py — [sources implemented]
- scripts/cruise_publisher.py — JSON writer + build + git push
- scripts/cruise_autoposter.py — main entry point
- scripts/run_cruise_autoposter.sh — cron wrapper + Telegram
- src/app/deals/[deal]/page.tsx — deal page template
- src/app/deals/page.tsx — deals index page
- ~/.claude/skills/cruisecompare/SKILL.md — Claude Code skill

Test results:
- Scraper: [N] deals found from [sources]
- Build: [success / fail + error]
- Deal page renders: [yes / no]

NOT yet done (awaiting Peter):
- Cron job not added (test manually first)
- Git push not attempted
- No live data on cruisecompare.online yet

Recommended cron (when ready):
  0 */4 * * * /home/padmin/workspace/cruisecompare/scripts/run_cruise_autoposter.sh

Next phases:
- Phase 2: Port guides pSEO (like airport guides)
- Phase 3: Ship reviews + destination guides + internal linking
```
