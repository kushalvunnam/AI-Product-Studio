const fs = require('fs');

let apiJs = fs.readFileSync('frontend/src/services/api.js', 'utf8');

if (!apiJs.includes('export const getGenerationStatus')) {
  apiJs += `
export const getGenerationStatus = async (jobId) => {
  try {
    const response = await fetch(\`\${API_BASE_URL}/api/generation/status/\${jobId}\`);
    const text = await response.text();
    
    if (!text) {
      throw new Error('Empty backend response.');
    }
    
    let result;
    try {
      result = JSON.parse(text);
    } catch(e) {
      throw new Error('Invalid JSON from status endpoint');
    }
    
    return result;
  } catch (error) {
    console.error('Status Error:', error);
    throw error;
  }
};
`;
}

fs.writeFileSync('frontend/src/services/api.js', apiJs);
console.log('Fixed api.js');
