const fs = require('fs');

let api = fs.readFileSync('frontend/src/services/api.js', 'utf8');

const regex = /export const generateCampaignVariations = async \(data\) => \{[\s\S]*?^};/m;

const replacement = `export const generateCampaignVariations = async (data) => {
  try {
    const response = await fetch(\`\${API_BASE_URL}/api/generation/variations\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const text = await response.text();
    
    if (!text) {
      throw new Error('Empty backend response. The image generation service might be down.');
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      // It's not JSON (probably HTML from Render 502/504)
      if (response.status === 504) {
        throw new Error('Variation generation timed out. The image generation service took too long.');
      }
      if (response.status === 503 || response.status === 502) {
        throw new Error('Image generation service is temporarily unavailable. Please retry.');
      }
      if (response.status === 429) {
        throw new Error('Image generation rate limit reached. Please wait and retry.');
      }
      throw new Error(\`Unexpected HTML response from server (Status \${response.status})\`);
    }

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Variation generation failed on the backend.');
    }

    if (!result.success) {
      throw new Error(result.message || 'Invalid response from server');
    }

    // Notice we removed !result.variations because isAsync might be true
    return result;
  } catch (error) {
    console.error('API Error during variations generation:', error);
    throw error;
  }
};`;

api = api.replace(regex, replacement);

fs.writeFileSync('frontend/src/services/api.js', api);
console.log('Fixed api.js');
