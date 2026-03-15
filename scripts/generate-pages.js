#!/usr/bin/env node
/**
 * Generate static data files for all page types
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data/taxonomy');
const GENERATED_DIR = path.join(__dirname, '../src/data/generated');

// Load taxonomy data
const cruiseLines = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'cruise-lines.json'), 'utf-8'));
const destinations = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'destinations.json'), 'utf-8'));
const ports = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ports.json'), 'utf-8'));
const ships = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ships.json'), 'utf-8'));
const tripTypes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'trip-types.json'), 'utf-8'));

console.log('Loaded taxonomy:');
console.log(`  - ${cruiseLines.length} cruise lines`);
console.log(`  - ${destinations.length} destinations`);
console.log(`  - ${ports.length} ports`);
console.log(`  - ${ships.length} ships`);
console.log(`  - ${tripTypes.length} trip types`);
console.log();

// Ensure directories exist
const dirs = ['cruises', 'compare', 'ships', 'ports', 'destinations', 'guides'];
dirs.forEach(dir => {
  const dirPath = path.join(GENERATED_DIR, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Generate cruise line + destination pages (300)
console.log('Generating cruise line + destination pages...');
let cruiseCount = 0;
cruiseLines.forEach(line => {
  destinations.forEach(dest => {
    const pageData = {
      cruiseLine: line,
      destination: dest,
      title: `${line.name} ${dest.name} Cruises 2026 — Itineraries, Prices & Ships`,
      generated: new Date().toISOString(),
    };
    const filePath = path.join(GENERATED_DIR, 'cruises', `${line.slug}-${dest.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2));
    cruiseCount++;
  });
});
console.log(`  ✓ Generated ${cruiseCount} cruise pages`);

// Generate comparison pages (105 line comparisons)
console.log('Generating cruise line comparison pages...');
let compareCount = 0;
for (let i = 0; i < cruiseLines.length; i++) {
  for (let j = i + 1; j < cruiseLines.length; j++) {
    const lineA = cruiseLines[i];
    const lineB = cruiseLines[j];
    const pageData = {
      lineA,
      lineB,
      title: `${lineA.name} vs ${lineB.name} 2026 — Which Is Better?`,
      generated: new Date().toISOString(),
    };
    const slugA = lineA.slug;
    const slugB = lineB.slug;
    const filePath = path.join(GENERATED_DIR, 'compare', `${slugA}-vs-${slugB}.json`);
    fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2));
    compareCount++;
  }
}
console.log(`  ✓ Generated ${compareCount} comparison pages`);

// Generate ship review pages (40)
console.log('Generating ship review pages...');
let shipCount = 0;
ships.forEach(ship => {
  const pageData = {
    ship,
    title: `${ship.name} Review 2026 — Cabins, Dining, Entertainment & Tips`,
    generated: new Date().toISOString(),
  };
  const filePath = path.join(GENERATED_DIR, 'ships', `${ship.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2));
  shipCount++;
});
console.log(`  ✓ Generated ${shipCount} ship pages`);

// Generate port pages (25)
console.log('Generating port pages...');
let portCount = 0;
ports.forEach(port => {
  const pageData = {
    port,
    title: `Cruises from ${port.name} 2026 — All Lines, Dates & Itineraries`,
    generated: new Date().toISOString(),
  };
  const filePath = path.join(GENERATED_DIR, 'ports', `${port.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2));
  portCount++;
});
console.log(`  ✓ Generated ${portCount} port pages`);

// Generate destination guides (20)
console.log('Generating destination guides...');
let destCount = 0;
destinations.forEach(dest => {
  const pageData = {
    destination: dest,
    title: `${dest.name} Cruises 2026 — Complete Guide to Ships, Ports & Prices`,
    generated: new Date().toISOString(),
  };
  const filePath = path.join(GENERATED_DIR, 'destinations', `${dest.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2));
  destCount++;
});
console.log(`  ✓ Generated ${destCount} destination guides`);

// Generate resource/guide pages (200)
console.log('Generating resource/guide pages...');
let guideCount = 0;
const guideTypes = [
  { slug: 'packing-list', name: 'Packing List' },
  { slug: 'first-time-tips', name: 'First-Time Tips' },
  { slug: 'excursions-guide', name: 'Excursions Guide' },
  { slug: 'dress-code', name: 'Dress Code Guide' },
  { slug: 'sea-sickness', name: 'Sea Sickness Prevention' },
  { slug: 'budget-tips', name: 'Budget Tips' },
  { slug: 'best-cabins', name: 'Best Cabins' },
  { slug: 'dining-guide', name: 'Dining Guide' },
  { slug: 'entertainment', name: 'Entertainment Guide' },
  { slug: 'booking-tips', name: 'Booking Tips' },
];

guideTypes.forEach(type => {
  destinations.forEach(dest => {
    const pageData = {
      type,
      destination: dest,
      title: `${type.name} for ${dest.name} Cruise 2026`,
      generated: new Date().toISOString(),
    };
    const filePath = path.join(GENERATED_DIR, 'guides', `${type.slug}-${dest.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2));
    guideCount++;
  });
});
console.log(`  ✓ Generated ${guideCount} guide pages`);

// Summary
console.log();
console.log('='.repeat(50));
console.log('Generation Summary');
console.log('='.repeat(50));
console.log(`Cruise line + destination: ${cruiseCount}`);
console.log(`Line comparisons:          ${compareCount}`);
console.log(`Ship reviews:              ${shipCount}`);
console.log(`Port pages:                ${portCount}`);
console.log(`Destination guides:        ${destCount}`);
console.log(`Resource guides:           ${guideCount}`);
console.log('-'.repeat(50));
console.log(`Total pages:               ${cruiseCount + compareCount + shipCount + portCount + destCount + guideCount}`);
console.log();
console.log('Data files saved to: src/data/generated/');
