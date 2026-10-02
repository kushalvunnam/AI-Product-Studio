const fs = require('fs');
let content = fs.readFileSync('frontend/src/services/api.js', 'utf8');

content = content.replace(
  "const result = await response.json();\n\n    if (!response.ok) {\n      throw new Error(result.message || 'Variation generation failed');\n    }",
  "let result; try { result = await response.json(); } catch(e) { throw new Error('Cloudinary Generation Timeout/Error (500/504). Please try again.'); } if (!response.ok) { throw new Error(result.message || 'Variation generation failed'); }"
);

fs.writeFileSync('frontend/src/services/api.js', content);
