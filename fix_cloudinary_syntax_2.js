const fs = require('fs');

let file = fs.readFileSync('backend/services/cloudinaryGenerationService.js', 'utf8');

file = file.replace(/\\`/g, '`');
file = file.replace(/\\\$/g, '$');

fs.writeFileSync('backend/services/cloudinaryGenerationService.js', file);
console.log('Fixed syntax in cloudinaryGenerationService.js');
