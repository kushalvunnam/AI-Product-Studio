const fs = require('fs');

let varController = fs.readFileSync('backend/controllers/variationController.js', 'utf8');

varController = varController.replace(
`        if (result.variations.length > 0) {
          await Campaign.findByIdAndUpdate(campaignId, { variations: result.variations, status: 'review' });
        } else {
          await Campaign.findByIdAndUpdate(campaignId, { status: 'failed' });
        }`,
`        if (result.variations.length > 0) {
          await Campaign.findByIdAndUpdate(campaignId, { variations: result.variations, status: 'review' });
        } else {
          const errMsg = result.failed && result.failed.length > 0 ? result.failed[0].error : 'All variations failed to generate.';
          await Campaign.findByIdAndUpdate(campaignId, { status: 'failed', errorMessage: errMsg });
        }`
);

varController = varController.replace(
`      }).catch(async (err) => {
        console.error('Async generation failed:', err);
        await Campaign.findByIdAndUpdate(campaignId, { status: 'failed' });
      });`,
`      }).catch(async (err) => {
        console.error('Async generation failed:', err);
        await Campaign.findByIdAndUpdate(campaignId, { status: 'failed', errorMessage: err.message || 'Generation failed on the server.' });
      });`
);

fs.writeFileSync('backend/controllers/variationController.js', varController);
console.log('Fixed variationController.js');
