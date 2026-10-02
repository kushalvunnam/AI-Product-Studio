const fs = require('fs');

let file = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');

file = file.replace(
  'const startGeneration = async () => {\n      if (!sourceImage || !analysis) return;',
  'const startGeneration = async () => {\n      if (isGenerating || !sourceImage || !analysis) return;'
);

fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', file);
console.log('Added guard to startGeneration.');
