#!/usr/bin/env node
/**
 * Generate sitemaps for cruisecompare.online
 * Run: node scripts/generate-sitemaps.js
 */

const fs = require('fs');
const path = require('path');

const GENERATED_DIR = path.join(__dirname, '../src/data/generated');
const TAXONOMY_DIR = path.join(__dirname, '../src/data/taxonomy');
const PUBLIC_DIR = path.join(__dirname, '../public');
const SITEMAPS_DIR = path.join(PUBLIC_DIR, 'sitemaps');
const BASE_URL = 'https://cruisecompare.online';
const today = new Date().toISOString().split('T')[0];

if (!fs.existsSync(SITEMAPS_DIR)) {
  fs.mkdirSync(SITEMAPS_DIR, { recursive: true });
}

function jsonSlugs(dir) {
  try {
    return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
  } catch { return []; }
}

const pages = [];

// Static pages
[
  { url: '/', priority: 1.0, freq: 'weekly' },
  { url: '/deals/', priority: 0.9, freq: 'daily' },
  { url: '/compare/', priority: 0.8, freq: 'monthly' },
  { url: '/cruises/', priority: 0.8, freq: 'monthly' },
  { url: '/destinations/', priority: 0.8, freq: 'monthly' },
  { url: '/ships/', priority: 0.7, freq: 'monthly' },
  { url: '/from/', priority: 0.7, freq: 'monthly' },
].forEach(p => pages.push({ ...p, type: 'pages' }));

// Comparisons
jsonSlugs(path.join(GENERATED_DIR, 'comparisons')).forEach(slug =>
  pages.push({ url: `/compare/${slug}/`, priority: 0.6, freq: 'monthly', type: 'comparisons' })
);

// Destinations
jsonSlugs(path.join(GENERATED_DIR, 'destinations')).forEach(slug =>
  pages.push({ url: `/destinations/${slug}/`, priority: 0.7, freq: 'monthly', type: 'destinations' })
);

// Ports
jsonSlugs(path.join(GENERATED_DIR, 'ports')).forEach(slug =>
  pages.push({ url: `/from/${slug}/`, priority: 0.6, freq: 'monthly', type: 'ports' })
);

// Ships
jsonSlugs(path.join(GENERATED_DIR, 'ships')).forEach(slug =>
  pages.push({ url: `/ships/${slug}/`, priority: 0.6, freq: 'monthly', type: 'ships' })
);

// Deals
jsonSlugs(path.join(GENERATED_DIR, 'deals')).forEach(slug =>
  pages.push({ url: `/deals/${slug}/`, priority: 0.8, freq: 'weekly', type: 'deals' })
);

// Cruise line pages from taxonomy
try {
  const lines = JSON.parse(fs.readFileSync(path.join(TAXONOMY_DIR, 'cruise-lines.json'), 'utf-8'));
  lines.forEach(l =>
    pages.push({ url: `/cruises/${l.slug}/`, priority: 0.7, freq: 'monthly', type: 'cruiselines' })
  );
} catch {}

console.log(`Total: ${pages.length} URLs`);

// Generate single sitemap.xml (under 50k URLs, no need for index)
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
pages.forEach(p => {
  xml += `  <url>\n`;
  xml += `    <loc>${BASE_URL}${p.url}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>${p.freq}</changefreq>\n`;
  xml += `    <priority>${p.priority}</priority>\n`;
  xml += `  </url>\n`;
});
xml += '</urlset>\n';

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml);
console.log(`Generated sitemap.xml with ${pages.length} URLs`);
