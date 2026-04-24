const fs = require('fs');
const path = require('path');

const REQUIRED_MARKERS = [
  {
    file: 'src/app/layout.tsx',
    text: 'https://github.com/Dev-i-ant',
  },
  {
    file: 'LICENSE',
    text: 'https://github.com/Dev-i-ant',
  },
  {
    file: 'README.md',
    text: 'Автор: [Dev-i-ant](https://github.com/Dev-i-ant)',
  },
];

const missing = [];

for (const marker of REQUIRED_MARKERS) {
  const fullPath = path.resolve(process.cwd(), marker.file);
  if (!fs.existsSync(fullPath)) {
    missing.push(`${marker.file} (file not found)`);
    continue;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  if (!content.includes(marker.text)) {
    missing.push(`${marker.file} (missing required copyright marker)`);
  }
}

if (missing.length > 0) {
  console.error('Copyright verification failed:');
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log('Copyright verification passed.');
