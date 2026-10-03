const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');

// 1. Update retry timeout and message
content = content.replace(
  "if (attempts > 40) { clearInterval(pollingRef.current); setGenerationError('AI Horde is currently busy. Please retry in a moment.'); setIsGenerating(false); return; }",
  "if (attempts > 100) { clearInterval(pollingRef.current); setGenerationError('AI Horde is processing your image. The free community GPU queue may take a few minutes.'); setIsGenerating(false); return; }"
);

// 2. Update startGeneration timeout and message
content = content.replace(
  "if (attempts > 40) {\n                  clearInterval(pollingRef.current);\n                  setGenerationError('AI Horde is currently busy. Please retry in a moment.');",
  "if (attempts > 100) {\n                  clearInterval(pollingRef.current);\n                  setGenerationError('AI Horde is processing your image. The free community GPU queue may take a few minutes.');"
);

// 3. Update Generate Button text
content = content.replace(
  "{isGenerating ? 'Generating...' : `Generate ${variationCount} Variation`}",
  "{isGenerating ? 'Generating 1 variation...' : `Generate 1 Variation`}"
);

// 4. Update the select approved creative success message
content = content.replace(
  "Select Approved Creative",
  "Variation generated successfully"
);

fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', content);
