#!/usr/bin/env python3
"""
CruiseCompare publisher — write deal JSONs, build static site, git push.

Publishing flow:
  1. Write deal JSONs to src/data/generated/deals/
  2. npm run build (generates static HTML in out/)
  3. git add + commit + push → GitHub Actions → Cloudflare
"""

import json
import logging
import subprocess
import os
from pathlib import Path
from datetime import datetime, timezone

SCRIPT_DIR = Path(__file__).parent
REPO_DIR = SCRIPT_DIR.parent
DEALS_DIR = REPO_DIR / 'src' / 'data' / 'generated' / 'deals'
LOG_FILE = Path.home() / 'cruise_autoposter.log'

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(str(LOG_FILE), encoding='utf-8'),
    ],
)
log = logging.getLogger('cruise_publisher')


def _write_deal_json(deal: dict) -> Path:
    """Write a single deal to JSON file. Returns the path."""
    slug = deal['slug']
    path = DEALS_DIR / f'{slug}.json'
    DEALS_DIR.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(deal, indent=2, ensure_ascii=False), encoding='utf-8')
    log.info(f'Written: {path.name}')
    return path


def _npm_build() -> bool:
    """Run npm run build and return True on success."""
    log.info('Running npm run build...')
    result = subprocess.run(
        ['npm', 'run', 'build'],
        cwd=str(REPO_DIR),
        capture_output=True,
        text=True,
        timeout=300,
    )
    if result.returncode == 0:
        log.info('Build succeeded')
        return True
    log.error(f'Build FAILED (exit {result.returncode})')
    log.error(result.stderr[-2000:] if result.stderr else '(no stderr)')
    return False


def _git_push(deals: list[dict], dry_run: bool = False) -> bool:
    """Stage, commit, and push to main."""
    try:
        # Stage deal JSONs and out/ directory
        subprocess.run(
            ['git', 'add', 'src/data/generated/deals/', 'out/'],
            cwd=str(REPO_DIR),
            check=True,
        )

        # Check if there's anything to commit
        status = subprocess.run(
            ['git', 'diff', '--cached', '--quiet'],
            cwd=str(REPO_DIR),
        )
        if status.returncode == 0:
            log.info('Nothing to commit — all deals already in git')
            return True

        # Build commit message
        if len(deals) == 1:
            msg = f'deals: {deals[0].get("title", "new cruise deal")}'
        else:
            lines = [d.get("cruise_line", "?") + " " + d.get("destination", "?") for d in deals[:3]]
            suffix = f' (+{len(deals) - 3} more)' if len(deals) > 3 else ''
            msg = f'deals: {len(deals)} new cruise deals — {", ".join(lines)}{suffix}'

        if dry_run:
            log.info(f'[DRY RUN] Would commit: {msg}')
            return True

        subprocess.run(
            ['git', 'commit', '-m', msg],
            cwd=str(REPO_DIR),
            check=True,
        )
        log.info(f'Committed: {msg}')

        subprocess.run(
            ['git', 'push', 'origin', 'main'],
            cwd=str(REPO_DIR),
            check=True,
        )
        log.info('Pushed to origin/main — GitHub Actions will deploy to Cloudflare')
        return True

    except subprocess.CalledProcessError as e:
        log.error(f'Git operation failed: {e}')
        return False


def publish_deals(deals: list[dict], dry_run: bool = False) -> bool:
    """
    Write all deal JSONs, build once, push once.

    Args:
        deals: List of new deal dicts from the scraper.
        dry_run: If True, write JSONs but skip build and git push.

    Returns:
        True on success, False on build/push failure.
    """
    if not deals:
        log.info('publish_deals: no deals to publish')
        return True

    log.info(f'Publishing {len(deals)} deals (dry_run={dry_run})')

    # 1. Write all deal JSONs first (batch — build happens once after all are written)
    written_paths = []
    for deal in deals:
        try:
            p = _write_deal_json(deal)
            written_paths.append(p)
        except Exception as e:
            log.error(f'Failed to write deal {deal.get("slug", "?")}: {e}')

    if not written_paths:
        log.error('No deal JSONs were written — aborting')
        return False

    log.info(f'Wrote {len(written_paths)} JSON files')

    if dry_run:
        log.info('[DRY RUN] Skipping build and git push')
        return True

    # 2. Build static site ONCE (expensive step — ~1-3 minutes)
    if not _npm_build():
        log.error('Build failed — deals written to JSON but not deployed')
        return False

    # 3. Git push (triggers GitHub Actions → Cloudflare deploy)
    if not _git_push(deals):
        log.error('Git push failed — deals built but not deployed')
        return False

    log.info(f'Published {len(written_paths)} deals successfully')
    return True


if __name__ == '__main__':
    import sys
    # Quick test: write a single test deal
    test_deal = {
        'slug': 'test-deal-msc-mediterranean-7-night',
        'title': 'MSC Mediterranean 7-Night from €499',
        'cruise_line': 'MSC Cruises',
        'destination': 'Mediterranean',
        'departure_port': 'Genoa',
        'duration_nights': 7,
        'price_eur': 499,
        'price_per_night': 71,
        'excerpt': 'MSC Cruises offers 7-night Mediterranean itinerary from Genoa.',
        'meta_description': 'MSC Mediterranean cruise 7 nights from €499. Departs Genoa.',
        'source': 'test',
        'scraped_at': datetime.now(timezone.utc).isoformat(),
        'published_at': datetime.now(timezone.utc).isoformat(),
    }
    dry = '--dry-run' in sys.argv
    result = publish_deals([test_deal], dry_run=dry)
    print(f'Result: {"success" if result else "failed"}')
