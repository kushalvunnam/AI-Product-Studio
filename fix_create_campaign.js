const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');

const newLogic = `        if (result.isAsync && campaignId) {
          // Poll for completion
          let isDone = false;
          let finalResult = null;
          while (!isDone) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            const camp = await getCampaignById(campaignId);
            if (camp.status === 'review' && camp.variations && camp.variations.length > 0) {
              isDone = true;
              finalResult = { success: true, variations: camp.variations };
            } else if (camp.status === 'failed') {
              throw new Error('Generation failed on the server. Please try again.');
            }
          }
          setGeneratedResult(finalResult);
          
          if (finalResult && finalResult.variations && finalResult.variations.length > 0) {
            const firstVariant = finalResult.variations[0];
            setSelectedVariant(firstVariant);
            await updateCampaign(campaignId, { selectedVariation: firstVariant });
            setStep(5);
          }
        } else {
          setGeneratedResult(result);
          if (campaignId) await updateCampaign(campaignId, { variations: result.variations, status: 'review' });
          if (result && result.variations && result.variations.length > 0) {
            const firstVariant = result.variations[0];
            setSelectedVariant(firstVariant);
            if (campaignId) await updateCampaign(campaignId, { selectedVariation: firstVariant });
            setStep(5);
          }
        }
        setIsGenerating(false);`;

// We will replace the entire block from `if (result.isAsync && campaignId)` down to `setIsGenerating(false);`
const lines = content.split('\n');
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('if (result.isAsync && campaignId) {')) {
    startIdx = i;
  }
  if (startIdx !== -1 && i > startIdx && lines[i].includes('setIsGenerating(false);')) {
    endIdx = i;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx + 1, newLogic);
  fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', lines.join('\n'));
  console.log('Fixed CreateCampaign.jsx successfully.');
} else {
  console.log('Could not find logic to replace in CreateCampaign.jsx');
}
