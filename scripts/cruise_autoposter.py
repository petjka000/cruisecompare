#!/usr/bin/env python3
"""CruiseCompare Autoposter — scrape, build, deploy cruise deals."""

import sys
import os
import json
import logging
import urllib.request
from pathlib import Path
from datetime import datetime, timezone

# Ensure scripts/ is on path
sys.path.insert(0, str(Path(__file__).parent))

LOG_FILE = Path.home() / 'cruise_autoposter.log'
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(str(LOG_FILE), encoding='utf-8'),
    ],
)
log = logging.getLogger('cruise_autoposter')


def _load_telegram_creds():
    """Load Telegram credentials from aifly autoposter .env."""
    token, chat_id = '', ''
    env_path = Path.home() / '.openclaw' / 'workspace' / 'aifly-autoposter' / '.env'
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith('TELEGRAM_BOT_TOKEN='):
                token = line.split('=', 1)[1].strip().strip('"').strip("'")
            elif line.startswith('TELEGRAM_CHAT_ID='):
                chat_id = line.split('=', 1)[1].strip().strip('"').strip("'")
    return token, chat_id


def _notify_telegram(msg: str):
    """Send a Telegram notification (non-blocking, silent on failure)."""
    token, chat_id = _load_telegram_creds()
    if not token or not chat_id:
        return
    try:
        data = json.dumps({'chat_id': chat_id, 'text': msg, 'parse_mode': 'HTML'}).encode()
        req = urllib.request.Request(
            f'https://api.telegram.org/bot{token}/sendMessage',
            data=data,
            headers={'Content-Type': 'application/json'},
        )
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass


def main():
    import argparse
    parser = argparse.ArgumentParser(description='CruiseCompare Autoposter')
    parser.add_argument('--dry-run', action='store_true', help='Scrape and extract but do not build/push')
    parser.add_argument('--limit', type=int, default=0, help='Max deals to publish per run (0=unlimited)')
    args = parser.parse_args()

    log.info('=== CruiseCompare Autoposter started ===')
    start_time = datetime.now(timezone.utc)

    # 1. Scrape
    try:
        from cruise_scraper import scrape_all_sources
        new_deals = scrape_all_sources()
    except Exception as e:
        log.error(f'Scraper failed: {e}')
        _notify_telegram(f'❌ <b>Cruise autoposter FAILED</b>\nScraper error: {str(e)[:200]}')
        sys.exit(1)

    if not new_deals:
        log.info('No new deals found — nothing to publish')
        elapsed = (datetime.now(timezone.utc) - start_time).seconds
        log.info(f'=== Done in {elapsed}s ===')
        sys.exit(0)

    # 2. Apply limit
    if args.limit and len(new_deals) > args.limit:
        log.info(f'Limiting to {args.limit} deals (found {len(new_deals)})')
        new_deals = new_deals[:args.limit]

    # 3. Publish (write JSONs + build + git push)
    try:
        from cruise_publisher import publish_deals
        success = publish_deals(new_deals, dry_run=args.dry_run)
    except Exception as e:
        log.error(f'Publisher failed: {e}')
        _notify_telegram(f'❌ <b>Cruise autoposter FAILED</b>\nPublisher error: {str(e)[:200]}')
        sys.exit(1)

    # 4. Notify
    elapsed = (datetime.now(timezone.utc) - start_time).seconds
    if success:
        deal_lines = '\n'.join(
            f'• {d.get("cruise_line", "?")} {d.get("destination", "?")} €{d.get("price_eur", "?")}'
            for d in new_deals[:5]
        )
        suffix = f'\n+ {len(new_deals) - 5} more' if len(new_deals) > 5 else ''
        mode = ' [DRY RUN]' if args.dry_run else ''
        _notify_telegram(
            f'🚢 <b>Cruise autoposter OK{mode}</b>\n'
            f'{len(new_deals)} new deals in {elapsed}s\n'
            f'{deal_lines}{suffix}'
        )
        log.info(f'=== Done: {len(new_deals)} deals published in {elapsed}s ===')
    else:
        _notify_telegram(f'❌ <b>Cruise autoposter FAILED</b>\nPublish step failed after {elapsed}s')
        log.error('=== Autoposter failed ===')
        sys.exit(1)


if __name__ == '__main__':
    main()
