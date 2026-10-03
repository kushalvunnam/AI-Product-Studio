const fs = require('fs');
let content = fs.readFileSync('backend/controllers/variationController.js', 'utf8');

content = content.replace(
  "v.secureUrl = statusRes.secureUrl;",
  "v.secureUrl = statusRes.secureUrl;\n              console.log('[VARIATION] saved image URL:', v.secureUrl);"
);

fs.writeFileSync('backend/controllers/variationController.js', content);
