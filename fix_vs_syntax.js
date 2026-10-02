const fs = require('fs');

let file = fs.readFileSync('backend/services/variationService.js', 'utf8');
file = file.replace(/\\`/g, '`');
file = file.replace(/\\\$/g, '$');
fs.writeFileSync('backend/services/variationService.js', file);
console.log('Fixed syntax in variationService.js');
