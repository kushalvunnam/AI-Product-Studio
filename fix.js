const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');

content = content.replace(
  "if (campaignId) await updateCampaign(campaignId, { status: 'failed' });",
  "if (campaignId) { try { await updateCampaign(campaignId, { status: 'failed' }); } catch(e) {} }"
);

content = content.replace(
  "{isGenerating && (",
  "{generationError && (<div className=\"bg-red-500/10 border border-red-500 rounded-xl p-6 text-red-500 mb-8\">{generationError}</div>)}\n              {isGenerating && ("
);

fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', content);
