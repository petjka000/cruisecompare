const fs = require('fs');
const path = require('path');

const generatedDir = 'src/data/generated';
let total = 0;

// Required directories (cruise content - fail if missing)
const required = ['cruises', 'comparisons'];
// Optional directories (skip if not yet generated)
const optional = ['ports', 'ships', 'destinations', 'deals'];

required.forEach(type => {
  const dir = path.join(generatedDir, type);
  if (!fs.existsSync(dir)) {
    console.error(`MISSING required: ${dir}`);
    process.exit(1);
  }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  console.log(`${type}: ${files.length} files`);
  total += files.length;
});

optional.forEach(type => {
  const dir = path.join(generatedDir, type);
  if (!fs.existsSync(dir)) {
    console.log(`${type}: 0 files (not yet generated)`);
    return;
  }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  console.log(`${type}: ${files.length} files`);
  total += files.length;
});

console.log(`Total: ${total} JSON files`);

// Skip minimum file check in test mode
if (process.env.CRUISE_TEST === '1') {
  console.log('Pre-build check PASSED (test mode)');
  process.exit(0);
}

if (total < 400) {
  console.error(`ERROR: Only ${total} files. Need 400+ before building.`);
  process.exit(1);
}
console.log('Pre-build check PASSED');
