const fs = require('fs');
const path = require('path');

const generatedDir = 'src/data/generated';
let total = 0;

['cruises','comparisons','ports','ships','destinations'].forEach(type => {
  const dir = path.join(generatedDir, type);
  if (!fs.existsSync(dir)) {
    console.error(`MISSING: ${dir}`);
    process.exit(1);
  }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  console.log(`${type}: ${files.length} files`);
  total += files.length;
});

console.log(`Total: ${total} JSON files`);
if (total < 600) {
  console.error(`ERROR: Only ${total} files. Need 600+ before building.`);
  process.exit(1);
}
console.log('Pre-build check PASSED');
