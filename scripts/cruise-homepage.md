# CruiseCompare Homepage Redesign — Production Quality
# =====================================================
# Load with: /read /home/padmin/scripts/cruise-homepage.md
# Then: "Execute everything in this file. Ultrathink."


You are redesigning the cruisecompare.online homepage from a bare placeholder into a production-quality cruise comparison landing page. The current homepage has just a title, one line of text, and two links. It needs to become a real travel site that people trust and use.

## CONFIRMED STACK
- Next.js 16 with static export (App Router)
- Tailwind CSS 4 (already installed)
- React 19
- TypeScript
- Deployed to Cloudflare Pages
- Working directory: `/home/padmin/workspace/cruisecompare`

## EXISTING CONTENT TO PULL FROM
- `src/data/generated/comparisons/*.json` — ~20 cruise line comparison articles
- Route structure ready: `/cruises/[line]/[destination]`, `/ships/[ship]`, `/destinations/[destination]`, `/guides/[type]-[destination]`, `/compare/[lineA]-vs-[lineB]`, `/from/[port]`
- Deal data directory will exist at `src/data/generated/deals/` (Phase 1 autoposter fills this)

## WHAT TO BUILD

### Step 0: Research before designing

Read these files first to understand the existing code and data:
```bash
cd /home/padmin/workspace/cruisecompare
cat src/app/page.tsx
cat src/app/layout.tsx
cat src/app/globals.css
cat src/data/generated/comparisons/royal-caribbean-vs-carnival.json | python3 -m json.tool | head -50
ls src/data/generated/comparisons/ | head -20
```

Also study these competitor sites for layout inspiration (don't copy, be better):
```bash
curl -sL "https://r.jina.ai/https://www.cruisesheet.com" | head -200
curl -sL "https://r.jina.ai/https://www.cruisecritic.com" | head -200
```

### Step 1: Design system foundation

Before touching page.tsx, establish the design system in `globals.css` and a shared config.

**Design direction: Refined maritime editorial.** Think high-end travel magazine meets modern SaaS. Not cartoonish cruise clipart. Not generic blue gradient. Clean typography, ocean-inspired but sophisticated color palette, plenty of whitespace, editorial card layouts.

**Color palette (marine blue system):**
- Primary: Deep ocean navy `#0A1B3D` (trust, premium)
- Marine: Rich blue `#1B6FA8` (headers, active nav, depth)
- Sky: Bright marine `#5DADE2` (highlights, badges, light accents)
- Accent: Coral sunset `#e8593c` (CTAs, urgency, deals)
- Success: Soft teal `#1a8a7d` (savings, positive indicators)
- Surface: Warm sand `#faf8f5` (page background, warmth against blues)
- Text: Almost black `#1a1a2e` on light, `#f0ede8` on dark
- Muted: `#5a6d80` (secondary text — blue-tinted gray, NOT pure gray)

**Typography — use Google Fonts, load via next/font or @import:**
- Headings: `DM Serif Display` or `Playfair Display` — editorial, premium feel
- Body: `DM Sans` or `Source Sans 3` — clean, readable
- Monospace/prices: `JetBrains Mono` or `Space Mono` — for price tags

**Spacing philosophy:** Generous. Let content breathe. Travel sites crammed with cards feel cheap. White space signals premium.

### Step 2: Root layout upgrade (`src/app/layout.tsx`)

Upgrade the root layout with:

1. **Proper `<head>` metadata** — title, description, OG tags, favicon reference
2. **Google Fonts** loaded via `next/font/google`
3. **Responsive navigation bar:**
   - Logo: "CruiseCompare" in heading font with a minimal wave/anchor icon (CSS or inline SVG, not an image)
   - Nav links: Deals, Cruises, Compare, Ships, Destinations, Guides
   - "Deals" link should have a subtle coral accent badge like "New" or a dot
   - Mobile: hamburger menu
   - Sticky on scroll with subtle backdrop blur

4. **Footer:**
   - 4 columns: Browse (cruise lines, destinations, ports), Compare (popular comparisons), Resources (guides, ship reviews), About (about us, no commissions promise)
   - "No commissions — honest cruise comparison" tagline (same trust signal as aifly.one)
   - Copyright + year
   - Subtle wave SVG divider above footer

### Step 3: Homepage (`src/app/page.tsx`)

This is the main deliverable. The page should have these sections, top to bottom:

**Section 1 — Hero**
- Full-width, generous height (~60vh on desktop, ~40vh mobile)
- Background: Marine blue gradient `linear-gradient(170deg, #5DADE2 0%, #1B6FA8 40%, #0A1B3D 95%)` — rich ocean feel, NOT a photo (static sites should be fast)
- Optional: subtle animated wave SVG at the bottom edge (CSS animation, lightweight)
- Headline: "Find Your Perfect Cruise" in large editorial serif font (DM Serif Display, ~48-56px)
- Subtitle: "Compare prices, ships, and itineraries across every major cruise line — no commissions, no bias" (~18px, lighter weight)
- Two CTAs side by side:
  - Primary (coral bg): "Browse Deals →" linking to /deals (or /cruises for now)
  - Secondary (outlined): "Compare Lines →" linking to /compare
- Trust badges below CTAs: "✓ No commissions" | "✓ 12 cruise lines" | "✓ 50+ destinations" (use real numbers from your data)

**Section 2 — Latest Deals (dynamic, from JSON)**
- Section title: "Latest cruise deals" with a "View all →" link
- Grid: 3 columns desktop, 2 tablet, 1 mobile
- Each deal card:
  - Top: destination image placeholder (use CSS gradient or pattern matching destination — NOT an external image that would slow load)
  - Cruise line name + ship name (small, muted)
  - Deal title: "Mediterranean 7-Night from €599"
  - Price badge: "From €599" with original price struck through if available
  - Duration: "7 nights" | Departure: "Barcelona"
  - Ports of call as small tags/pills
  - CTA button: "View Deal →"
- If no deals exist yet (Phase 1 not run), show 3-4 hardcoded placeholder deals with realistic data and a flag `isPlaceholder: true` so they can be replaced later. This way the site looks populated from day one.

Create a shared component for the deal card: `src/components/DealCard.tsx`

**Section 3 — Popular cruise lines**
- Horizontal scroll on mobile, grid on desktop
- Cards for: Royal Caribbean, MSC, Norwegian, Carnival, Princess, Costa, Viking, Celebrity
- Each card: cruise line name + "from €X/night" + number of ships + link to `/cruises/[line]`
- Use the line's brand color as an accent on each card (subtle left border or top stripe)

Create: `src/components/CruiseLineCard.tsx`
Create: `src/data/cruise-lines.ts` — static data file with cruise line info (name, slug, color, ship count, min price)

**Section 4 — Compare cruise lines (pulls from existing JSON data)**
- Section title: "Head-to-head comparisons"
- Read comparison JSONs from `src/data/generated/comparisons/`
- Show 4-6 comparison cards in a grid
- Each card: "[Line A] vs [Line B]" with a brief excerpt
- Link to `/compare/[lineA]-vs-[lineB]`
- Dynamically reads from the filesystem at build time

Create: `src/components/ComparisonCard.tsx`

**Section 5 — Popular destinations**
- Visual grid with 6-8 destinations
- Each: destination name (e.g., "Mediterranean", "Caribbean", "Alaska", "Northern Europe", "Asia", "South Pacific")
- Background: CSS gradient unique to each destination — use the marine blue system:
  - Mediterranean: `linear-gradient(135deg, #2E86C1, #0A1B3D)` (deep blue)
  - Caribbean: `linear-gradient(135deg, #1A8A7D, #0A4F44)` (tropical teal)
  - Alaska: `linear-gradient(135deg, #5DADE2, #1B4F72)` (icy sky blue)
  - Northern Europe: `linear-gradient(135deg, #34698A, #0A1B3D)` (steel blue)
  - Asia: `linear-gradient(135deg, #D4A853, #8B6914)` (golden, warm contrast)
  - South Pacific: `linear-gradient(135deg, #48D1CC, #1A6B5F)` (turquoise)
- Overlay text with deal count: "24 cruises from €499"
- Link to `/destinations/[destination]`

Create: `src/components/DestinationCard.tsx`
Create: `src/data/destinations.ts` — static data with destination info

**Section 6 — Departure ports**
- "Sail from your nearest port"
- Grid or list of 8-10 popular departure ports: Barcelona, Southampton, Miami, Rome (Civitavecchia), Copenhagen, Venice, New York, Marseille
- Each with country flag emoji + port name + cruise count
- Link to `/from/[port]`

Create: `src/data/ports.ts`

**Section 7 — Why CruiseCompare**
- 3 columns with icons (use simple SVG icons, not emoji):
  - "No commissions" — "We don't sell cruises. We compare them honestly so you get the best deal."
  - "Every major line" — "Royal Caribbean, MSC, Norwegian, Carnival, Princess, and more — all in one place."
  - "Real prices" — "Updated daily from multiple sources. No bait-and-switch pricing."

**Section 8 — SEO content block**
- Short paragraph of natural text about cruise comparison
- Helps with search engines without looking spammy
- 2-3 sentences max, muted color, smaller font
- Naturally includes keywords: cruise deals, compare cruise lines, cheap cruises 2026

### Step 4: Create all shared components

All components go in `src/components/`:

```
src/components/
├── DealCard.tsx
├── CruiseLineCard.tsx
├── ComparisonCard.tsx
├── DestinationCard.tsx
├── Header.tsx          ← extracted from layout
├── Footer.tsx          ← extracted from layout
└── TrustBadges.tsx
```

Each component should:
- Be fully typed with TypeScript interfaces
- Use Tailwind CSS 4 classes
- Be responsive (mobile-first)
- Have hover states and transitions
- Accept props for dynamic data
- Work with both real and placeholder data

### Step 5: Static data files

Create these in `src/data/`:

**`src/data/cruise-lines.ts`**
```typescript
export const cruiseLines = [
  { name: "Royal Caribbean", slug: "royal-caribbean", color: "#003087", ships: 28, minPricePerNight: 71 },
  { name: "MSC Cruises", slug: "msc", color: "#002855", ships: 22, minPricePerNight: 59 },
  { name: "Norwegian Cruise Line", slug: "norwegian", color: "#00205B", ships: 19, minPricePerNight: 79 },
  // ... add 8-10 major lines with accurate data
];
```

**`src/data/destinations.ts`** — popular cruise regions with gradient colors

**`src/data/ports.ts`** — top departure ports with coordinates and country

**`src/data/placeholder-deals.ts`** — 4-6 realistic placeholder deals shown until real deals flow in

### Step 6: Ensure static build works

After all changes:

```bash
npm run build 2>&1 | tail -20
```

The build must succeed. If there are TypeScript errors, fix them. If there are missing dependencies, install them.

Check the output:
```bash
ls out/ | head -20
find out/ -name "*.html" | wc -l
```

### Step 7: Test locally (optional but recommended)

```bash
npm run dev
# Open http://localhost:3000 in a browser or use curl
curl -s http://localhost:3000 | head -100
```

### Step 8: DO NOT push to git yet

After everything builds, tell Peter:
- How many components were created
- How the homepage looks (describe sections)
- Build status (success/errors)
- File count in out/
- Any issues or decisions needed

Peter will review and approve the git push.

---

## DESIGN RULES

1. **No stock photos, no external images.** Use CSS gradients, SVG patterns, and color to create visual interest. Static sites must be fast. Every external image is a render-blocking request on Cloudflare.

2. **No generic AI look.** If you catch yourself using Inter font, purple-blue gradients, or rounded cards with drop shadows on white — stop and rethink. This should look like a premium travel editorial site, not a SaaS dashboard template.

3. **Mobile first.** 60%+ of cruise shoppers browse on mobile. Every section must look great on 375px width.

4. **Performance.** No heavy JavaScript. No client-side data fetching. Everything static. Tailwind purges unused CSS. Google Fonts loaded optimally via next/font.

5. **Real data where possible.** Read from comparison JSONs at build time. Use real cruise line names, real port names, real destination names. Only deal cards use placeholder data (until the autoposter runs).

6. **SEO fundamentals.** Every page needs: unique title, meta description, OG image (can be a colored gradient with text overlay generated at build time), canonical URL, proper heading hierarchy (one H1 per page).

7. **Consistent with the existing nav.** Keep the navigation items that already exist: CruiseCompare, Cruises, Compare, Ships, Destinations. Add "Deals" as the first nav item.

---

## REPORTING FORMAT

```
CRUISECOMPARE HOMEPAGE — REDESIGNED
======================================

Design system:
  Fonts: [heading font] + [body font]
  Colors: [palette summary]
  
Components created:
  - [list all .tsx components]
  
Data files created:
  - [list all .ts data files]

Pages modified:
  - src/app/page.tsx (complete redesign)
  - src/app/layout.tsx (nav + footer + fonts)
  - src/app/globals.css (design tokens)

Homepage sections:
  1. Hero — [description]
  2. Latest deals — [N] placeholder cards
  3. Cruise lines — [N] lines
  4. Comparisons — [N] from JSON data
  5. Destinations — [N] regions
  6. Departure ports — [N] ports
  7. Why CruiseCompare — 3 trust pillars
  8. SEO content block

Build: [success / errors]
HTML pages in out/: [N]

Ready for Peter to review before git push.
```
