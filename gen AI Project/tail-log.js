const fs = require('fs');
const content = fs.readFileSync('.next/dev/logs/next-development.log', 'utf8');
const lines = content.split('\n');
fs.writeFileSync('tail-log.txt', lines.slice(-100).join('\n'));
