#!/usr/bin/env python3
"""
CruiseCompare deal scraper.

Sources:
  1. Google News RSS — cruise deal/sale articles (URL-resolved before jina fetch)

For each article, fetch via jina.ai and use Qwen 3.5 plus to extract structured deal data.
"""

import os
import re
import json
import time
import hashlib
import logging
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

SCRIPT_DIR = Path(__file__).parent
REPO_DIR = SCRIPT_DIR.parent
DEALS_DIR = REPO_DIR / 'src' / 'data' / 'generated' / 'deals'
LOGS_DIR = REPO_DIR / 'logs'
LOG_FILE = Path.home() / 'cruise_autoposter.log'
SKIPPED_LOG = LOGS_DIR / 'skipped_deals.log'

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(str(LOG_FILE), encoding='utf-8'),
    ],
)
log = logging.getLogger('cruise_scraper')

DEALS_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)


# ── MiniMax credentials (replaces DashScope/Qwen) ────────────────────────────

def _load_minimax_key() -> str:
    """Load MiniMax API key from auth-profiles.json or env var."""
    auth_path = Path.home() / '.openclaw/agents/main/agent/auth-profiles.json'
    try:
        profiles = json.loads(auth_path.read_text())
        token = profiles.get('profiles', {}).get('minimax-portal:default', {}).get('access', '')
        if token:
            return token
    except Exception as e:
        log.warning(f'Could not load MiniMax key from auth-profiles: {e}')
    return os.environ.get('MINIMAX_API_KEY', '')

QWEN_API_KEY = _load_minimax_key()
QWEN_BASE_URL = 'https://api.minimaxi.chat/v1'
QWEN_MODEL = 'MiniMax-M2.7'


# ── RSS Sources ──────────────────────────────────────────────────────────────

RSS_SOURCES = [
    # Direct feeds — give real article URLs that jina.ai can fetch
    {
        'name': 'cruise_hive',
        'url': 'https://www.cruisehive.com/feed',
        'type': 'direct',
    },
    {
        'name': 'cruise_industry_news',
        'url': 'https://cruiseindustrynews.com/feed/',
        'type': 'direct',
    },
    {
        'name': 'seatrade_cruise',
        'url': 'https://www.seatrade-cruise.com/rss.xml',
        'type': 'direct',
    },
    # pr_newswire_travel removed 2026-03-20: generic press release feed (baby products,
    # crypto, real estate) — zero cruise deals, zero prices, zero booking URLs in 20-item audit.
]

# Keywords that indicate an actual deal article (not just "cruise tips")
DEAL_KEYWORDS = [
    'deal', 'sale', 'discount', 'offer', 'save', 'promotion', 'flash sale',
    'reduced', 'price drop', 'limited time', 'wave season', 'black friday',
    'cyber monday', 'from €', 'from £', 'from $', 'per person',
]


# ── Helpers ──────────────────────────────────────────────────────────────────

_BROWSER_UA = (
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
    'AppleWebKit/537.36 (KHTML, like Gecko) '
    'Chrome/122.0.0.0 Safari/537.36'
)


def _http_get(url: str, timeout: int = 20, follow_redirects: bool = True) -> Optional[str]:
    """Simple HTTP GET with browser UA."""
    try:
        req = urllib.request.Request(
            url,
            headers={
                'User-Agent': _BROWSER_UA,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
        )
        r = urllib.request.urlopen(req, timeout=timeout)
        return r.read().decode('utf-8', errors='replace')
    except Exception as e:
        log.warning(f'HTTP GET failed {url[:60]}: {e}')
        return None



def _jina_fetch(url: str, timeout: int = 25) -> Optional[str]:
    """Fetch URL content via jina.ai Cloudflare bypass."""
    jina_url = f'https://r.jina.ai/{url}'
    return _http_get(jina_url, timeout=timeout)


def _minimax_extract(article_text: str, article_url: str, article_title: str) -> Optional[dict]:
    """Use Qwen 3.5-plus (via DashScope) to extract structured cruise deal data."""
    if not QWEN_API_KEY:
        log.warning('No MiniMax API key — cannot extract structured deal data')
        return None

    prompt = f"""Extract cruise deal information from the following article.

Article title: {article_title}
Article URL: {article_url}
Article text (first 3000 chars):
{article_text[:3000]}

Return a JSON object with these fields (use null if not found):
{{
  "title": "Deal title (e.g. 'Royal Caribbean Mediterranean 7-Night from \u20ac599')",
  "cruise_line": "Cruise line name",
  "ship": "Ship name or null",
  "destination": "Destination region (e.g. Mediterranean, Caribbean, Alaska)",
  "departure_port": "Main departure port city",
  "duration_nights": 7,
  "price_eur": 599,
  "original_price_eur": null,
  "discount_pct": null,
  "departure_dates": ["2026-06-15"],
  "ports_of_call": ["Port1", "Port2"],
  "includes": ["meals", "entertainment"],
  "excludes": ["drinks", "excursions"],
  "booking_url": "https://...",
  "excerpt": "One sentence summary of this deal"
}}

Rules:
- If price is in USD, convert to EUR (multiply by 0.92)
- If price is in GBP, convert to EUR (multiply by 1.17)
- departure_dates must be ISO format YYYY-MM-DD
- If this is NOT a specific cruise deal with a named cruise line and a price, return null
- Output ONLY the JSON object, no other text"""

    try:
        payload = json.dumps({
            'model': QWEN_MODEL,
            'max_tokens': 800,
            'messages': [{'role': 'user', 'content': prompt}],
        }).encode('utf-8')

        req = urllib.request.Request(
            f'{QWEN_BASE_URL}/chat/completions',
            data=payload,
            headers={
                'Authorization': f'Bearer {QWEN_API_KEY}',
                'Content-Type': 'application/json',
            },
        )
        r = urllib.request.urlopen(req, timeout=30)
        response = json.loads(r.read().decode('utf-8'))
        content = response['choices'][0]['message']['content'].strip()

        # Strip markdown fences if present
        content = re.sub(r'^```(?:json)?\s*', '', content, flags=re.MULTILINE)
        content = re.sub(r'\s*```$', '', content, flags=re.MULTILINE)
        content = content.strip()

        if content.lower() in ('null', 'none', ''):
            return None

        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if not json_match:
            return None
        data = json.loads(json_match.group(0))
        return data if data else None

    except Exception as e:
        log.warning(f'Qwen extraction failed: {e}')
        return None


def _make_slug(title: str, cruise_line: str, destination: str) -> str:
    """Generate a URL slug from deal properties."""
    base = f'{cruise_line} {destination} {title}'
    base = re.sub(r'[^a-z0-9\s-]', '', base.lower())
    base = re.sub(r'\s+', '-', base.strip())
    base = re.sub(r'-+', '-', base)[:80]
    h = hashlib.md5(title.encode()).hexdigest()[:6]
    return f'{base}-{h}'.strip('-')


def _is_deal_article(title: str, description: str) -> bool:
    """Check if a news article is likely about a specific cruise deal."""
    text = (title + ' ' + description).lower()
    return any(kw in text for kw in DEAL_KEYWORDS)


def _load_existing_slugs() -> set:
    """Return set of already-posted deal slugs."""
    slugs = set()
    if DEALS_DIR.exists():
        for f in DEALS_DIR.glob('*.json'):
            slugs.add(f.stem)
    return slugs


def _log_skipped(reason: str, title: str):
    """Log skipped deal to file."""
    ts = datetime.now(timezone.utc).isoformat()
    line = f'{ts} | {reason} | {title[:100]}\n'
    try:
        with open(SKIPPED_LOG, 'a', encoding='utf-8') as f:
            f.write(line)
    except Exception:
        pass


# ── RSS Fetching ─────────────────────────────────────────────────────────────

def _parse_google_news_rss(url: str) -> list[dict]:
    """Fetch and parse a Google News RSS feed."""
    content = _http_get(url)
    if not content:
        return []

    try:
        root = ET.fromstring(content.encode('utf-8'))
    except ET.ParseError as e:
        log.warning(f'RSS parse error: {e}')
        return []

    items = []
    for item in root.findall('.//item'):
        title = item.findtext('title', '')
        link = item.findtext('link', '')
        description = item.findtext('description', '')
        pub_date = item.findtext('pubDate', '')
        items.append({
            'title': title,
            'link': link,
            'description': description,
            'pub_date': pub_date,
        })

    log.info(f'RSS {url[:60]}: {len(items)} items')
    return items


# ── Main Scraper ─────────────────────────────────────────────────────────────

def scrape_all_sources() -> list[dict]:
    """
    Scrape all configured sources and return new deal dicts.
    Deduplicates against existing deals in src/data/generated/deals/.
    """
    existing_slugs = _load_existing_slugs()
    log.info(f'Existing deals: {len(existing_slugs)}')

    all_articles = []

    for source in RSS_SOURCES:
        articles = _parse_google_news_rss(source['url'])
        for a in articles:
            a['source_name'] = source['name']
        all_articles.extend(articles)

    # Deduplicate articles by title
    seen_titles: set = set()
    unique_articles = []
    for a in all_articles:
        key = a['title'].lower()[:60]
        if key not in seen_titles:
            seen_titles.add(key)
            unique_articles.append(a)

    log.info(f'Unique articles to check: {len(unique_articles)}')

    deal_articles = [a for a in unique_articles if _is_deal_article(a['title'], a['description'])]
    log.info(f'Deal articles: {len(deal_articles)} / {len(unique_articles)}')

    new_deals = []
    jina_count = 0
    MAX_JINA = 20

    for article in deal_articles:
        if jina_count >= MAX_JINA:
            log.info(f'jina.ai rate limit ({MAX_JINA}) reached — stopping')
            break

        title = article['title']
        link = article['link']

        log.info(f'Fetching: {title[:70]}')
        article_text = _jina_fetch(link)
        real_url = link
        jina_count += 1

        if not article_text or len(article_text) < 200:
            _log_skipped('article_too_short', title)
            time.sleep(1)
            continue

        # Extract deal data with Qwen 3.5-plus (DashScope)
        deal_data = _minimax_extract(article_text, real_url, title)

        if not deal_data:
            _log_skipped('no_deal_data_extracted', title)
            time.sleep(1.5)
            continue

        # Validate required fields
        required = ['cruise_line', 'destination', 'departure_port', 'price_eur', 'duration_nights']
        missing = [f for f in required if not deal_data.get(f)]
        if missing:
            _log_skipped(f'missing_fields:{",".join(missing)}', title)
            time.sleep(1.5)
            continue

        # Ensure numeric types
        try:
            deal_data['price_eur'] = int(deal_data['price_eur'])
            deal_data['duration_nights'] = int(deal_data['duration_nights'])
        except (TypeError, ValueError):
            _log_skipped('invalid_numeric_fields', title)
            time.sleep(1.5)
            continue

        # Generate slug
        slug = _make_slug(
            deal_data.get('title', title),
            deal_data.get('cruise_line', ''),
            deal_data.get('destination', ''),
        )

        if slug in existing_slugs:
            _log_skipped('duplicate_slug', title)
            time.sleep(1)
            continue

        # Fill derived fields
        deal_data['slug'] = slug
        deal_data['price_per_night'] = round(
            deal_data['price_eur'] / max(deal_data['duration_nights'], 1)
        )
        if not deal_data.get('title'):
            deal_data['title'] = title
        if not deal_data.get('meta_description'):
            deal_data['meta_description'] = (
                f"{deal_data['cruise_line']} {deal_data['destination']} cruise — "
                f"{deal_data['duration_nights']} nights from €{deal_data['price_eur']}. "
                f"Departing from {deal_data['departure_port']}."
            )

        now = datetime.now(timezone.utc).isoformat()
        deal_data['source'] = article.get('source_name', 'google_news')
        deal_data['source_url'] = real_url
        deal_data['scraped_at'] = now
        deal_data['published_at'] = now

        log.info(f'New deal: {deal_data["title"][:80]} — €{deal_data["price_eur"]}')
        new_deals.append(deal_data)
        existing_slugs.add(slug)

        time.sleep(1.5)

    log.info(f'Scraper done: {len(new_deals)} new deals')
    return new_deals


if __name__ == '__main__':
    deals = scrape_all_sources()
    print(f'\n{len(deals)} new deals found')
    for d in deals:
        print(f"  - {d.get('title', '?')} — €{d.get('price_eur', '?')}")
