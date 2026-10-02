const fs = require('fs');
let file = fs.readFileSync('backend/services/cloudinaryGenerationService.js', 'utf8');
file = file.replace(/const fetch = require\('node-fetch'\) \|\| global.fetch;/g, 'const fetch = global.fetch;');
fs.writeFileSync('backend/services/cloudinaryGenerationService.js', file);
console.log('Fixed fetch.');
