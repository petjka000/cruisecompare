#!/bin/bash
cd /home/padmin/workspace/cruisecompare
echo "=== Cruise autoposter run: $(date) ===" >> /home/padmin/cruise_autoposter.log
python3 scripts/cruise_autoposter.py >> /home/padmin/cruise_autoposter.log 2>&1
EXIT_CODE=$?
echo "=== Done (exit: $EXIT_CODE): $(date) ===" >> /home/padmin/cruise_autoposter.log

# Telegram notification
if [ $EXIT_CODE -eq 0 ]; then
    DEALS=$(find src/data/generated/deals/ -name "*.json" -mmin -180 2>/dev/null | wc -l)
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
