const fs = require('fs');
let content = fs.readFileSync('backend/controllers/campaignController.js', 'utf8');

content = content.replace(
  "return res.status(200).json({ success: true, campaign });",
  `
    if (campaign.variations && campaign.variations.length > 0) {
      campaign.variations.forEach((v, i) => {
        if (v.secureUrl) {
          console.log(\`[CAMPAIGN] returned image URL: \${v.secureUrl}\`);
        }
      });
    }
    return res.status(200).json({ success: true, campaign });
`
);

fs.writeFileSync('backend/controllers/campaignController.js', content);
