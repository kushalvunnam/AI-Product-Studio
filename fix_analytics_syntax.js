const fs = require('fs');
let file = fs.readFileSync('frontend/src/pages/Analytics.jsx', 'utf8');

file = file.replace(/\\`/g, '`');
file = file.replace(/\\\$/g, '$');

fs.writeFileSync('frontend/src/pages/Analytics.jsx', file);
console.log('Fixed JSX syntax');
