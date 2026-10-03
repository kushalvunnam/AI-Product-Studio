const fetch = global.fetch;
const cloudinary = require('cloudinary').v2;

const generateImage = async ({ prompt, referenceAsset, model }) => {
  try {
    const finalPrompt = `${prompt}. High quality, detailed, realistic product shot.`;
    const seed = Math.floor(Math.random() * 1000000);
    
    // Using current documented API for pollinations
    const endpoint = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;

    console.log('--- POLLINATIONS PROVIDER REQUEST ---');
    console.log(`Endpoint: ${endpoint}`);
    
    const headers = {};
    if (process.env.POLLINATIONS_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.POLLINATIONS_API_KEY}`;
    }
    
    let imageBuffer;
    let maxRetries = 3;
    let success = false;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); 
      
      try {
        const response = await fetch(endpoint, {
          headers,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded');
          }
          if (response.status === 401 || response.status === 403) {
             throw new Error('Pollinations API key is invalid or unauthorized');
          }
          if (response.status >= 500) {
            throw new Error(`Server error ${response.status}`);
          }
          throw new Error(`Failed to generate image: HTTP ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        success = true;
        break; 
        
      } catch (err) {
        clearTimeout(timeoutId);
        console.error(`Pollinations attempt ${attempt} failed:`, err.message);
        
        if (attempt === maxRetries) {
          throw new Error(err.name === 'AbortError' ? 'Provider timeout' : err.message);
        }
        
        const delay = Math.pow(2, attempt - 1) * 1000 + Math.random() * 500;
        console.log(`Retrying in ${Math.round(delay)}ms...`);
        await new Promise(res => setTimeout(res, delay));
      }
    }
    
    if (!success || !imageBuffer) {
      throw new Error('Failed to generate image after retries');
    }
    
    const base64Data = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder: 'campaign_variations',
      tags: ['ai_generated', 'pollinations']
    });

    return {
      secureUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      assetId: uploadResult.asset_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      modelUsed: model || 'pollinations'
    };

  } catch (error) {
    console.error('Pollinations API Error:', error);
    
    const errorMsg = error.message || '';
    let code = 'GENERATION_ERROR';
    if (errorMsg.includes('timeout')) code = 'TIMEOUT';
    if (errorMsg.includes('Rate limit')) code = 'RATE_LIMITED';
    if (errorMsg.includes('unauthorized')) code = 'MODEL_NOT_AVAILABLE';
    
    throw {
      code,
      provider: 'pollinations',
      message: errorMsg || 'Failed to generate image with Pollinations'
    };
  }
};

module.exports = { generateImage };
