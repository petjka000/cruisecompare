#!/usr/bin/env node
/**
 * Generate sitemaps for cruisecompare.online
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

const GENERATED_DIR = path.join(__dirname, '../src/data/generated');
const PUBLIC_SITEMAPS_DIR = path.join(__dirname, '../public/sitemaps');

// Ensure sitemaps directory exists
if (!fs.existsSync(PUBLIC_SITEMAPS_DIR)) {
  fs.mkdirSync(PUBLIC_SITEMAPS_DIR, { recursive: true });
}

// Get all generated page data files
const getAllPages = () => {
  const pages = [];
  
  // Cruise pages
  const cruiseDir = path.join(GENERATED_DIR, 'cruises');
  if (fs.existsSync(cruiseDir)) {
    const files = fs.readdirSync(cruiseDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const slug = file.replace('.json', '');
        pages.push({
          url: `/cruises/${slug.replace('-', '/')}/`,
          type: 'cruises',
          lastmod: new Date().toISOString().split('T')[0]
        });
      }
    });
  }
  
  // Compare pages
  const compareDir = path.join(GENERATED_DIR, 'compare');
  if (fs.existsSync(compareDir)) {
    const files = fs.readdirSync(compareDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const slug = file.replace('.json', '');
        pages.push({
          url: `/compare/${slug}/`,
          type: 'comparisons',
          lastmod: new Date().toISOString().split('T')[0]
        });
      }
    });
  }
  
  // Ship pages
  const shipsDir = path.join(GENERATED_DIR, 'ships');
  if (fs.existsSync(shipsDir)) {
    const files = fs.readdirSync(shipsDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const slug = file.replace('.json', '');
        pages.push({
          url: `/ships/${slug}/`,
          type: 'ships',
          lastmod: new Date().toISOString().split('T')[0]
        });
      }
    });
  }
  
  // Port pages
  const portsDir = path.join(GENERATED_DIR, 'ports');
  if (fs.existsSync(portsDir)) {
    const files = fs.readdirSync(portsDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const slug = file.replace('.json', '');
        pages.push({
          url: `/from/${slug}/`,
          type: 'ports',
          lastmod: new Date().toISOString().split('T')[0]
        });
      }
    });
  }
  
  // Destination pages
  const destinationsDir = path.join(GENERATED_DIR, 'destinations');
  if (fs.existsSync(destinationsDir)) {
    const files = fs.readdirSync(destinationsDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const slug = file.replace('.json', '');
        pages.push({
          url: `/destinations/${slug}/`,
          type: 'destinations',
          lastmod: new Date().toISOString().split('T')[0]
        });
      }
    });
  }
  
  // Guide pages
  const guidesDir = path.join(GENERATED_DIR, 'guides');
  if (fs.existsSync(guidesDir)) {
    const files = fs.readdirSync(guidesDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const slug = file.replace('.json', '');
        pages.push({
          url: `/guides/${slug}/`,
          type: 'guides',
          lastmod: new Date().toISOString().split('T')[0]
        });
      }
    });
  }
  
  return pages;
};

const pages = getAllPages();
console.log(`Found ${pages.length} pages to include in sitemaps`);

// Group pages by type
const groupedPages = {};
pages.forEach(page => {
  if (!groupedPages[page.type]) {
    groupedPages[page.type] = [];
  }
  groupedPages[page.type].push(page);
});

// Generate individual sitemaps
Object.keys(groupedPages).forEach(type => {
  const pagesOfType = groupedPages[type];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  pagesOfType.forEach(page => {
    xml += `  <url>\n`;
    xml += `    <loc>https://cruisecompare.online${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });
  
  xml += '</urlset>';
  
  const fileName = `sitemap-${type}.xml`;
  const filePath = path.join(PUBLIC_SITEMAPS_DIR, fileName);
  fs.writeFileSync(filePath, xml);
  console.log(`Generated ${fileName} with ${pagesOfType.length} URLs`);
});

// Generate sitemap index
let indexXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
indexXml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

Object.keys(groupedPages).forEach(type => {
  indexXml += `  <sitemap>\n`;
  indexXml += `    <loc>https://cruisecompare.online/sitemaps/sitemap-${type}.xml</loc>\n`;
  indexXml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
  indexXml += `  </sitemap>\n`;
});

indexXml += '</sitemapindex>';

const indexPath = path.join(PUBLIC_SITEMAPS_DIR, '../sitemap-index.xml');
fs.writeFileSync(indexPath, indexXml);
console.log(`Generated sitemap-index.xml`);

// Also create a root sitemap.xml that redirects to index
const rootSitemapPath = path.join(__dirname, '../public/sitemap.xml');
const rootSitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
fs.writeFileSync(rootSitemapPath, rootSitemap);

console.log('');
console.log('='.repeat(50));
console.log('Sitemap Generation Complete');
console.log('='.repeat(50));
console.log('Sitemaps created in public/sitemaps/:');
Object.keys(groupedPages).forEach(type => {
  console.log(`- sitemap-${type}.xml (${groupedPages[type].length} URLs)`);
});
console.log('- sitemap-index.xml');
console.log('');
console.log('Total pages in sitemaps:', pages.length);
console.log('');
