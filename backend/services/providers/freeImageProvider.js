const fetch = global.fetch;
const cloudinary = require('cloudinary').v2;

const generateImage = async ({ prompt, referenceAsset, model }) => {
  try {
    // Pollinations AI is a free open-source AI image generation API
    // We combine the base prompt with instructions to consider the reference asset implicitly
    const finalPrompt = `${prompt}. High quality, detailed, realistic product shot.`;
    
    // Create a unique seed to ensure variations across requests
    const seed = Math.floor(Math.random() * 1000000);
    
    const endpoint = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;

    console.log('--- FREE PROVIDER REQUEST ---');
    console.log(`Endpoint: ${endpoint}`);
    
    // Fetch the image from the free provider
    // Exponential backoff retry logic for temporary errors
    let imageBuffer;
    let maxRetries = 3;
    let success = false;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout
      
      try {
        const response = await fetch(endpoint, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded');
          }
          if (response.status >= 500) {
            throw new Error(`Server error ${response.status}`);
          }
          throw new Error(`Failed to generate image: HTTP ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        success = true;
        break; // Success! Exit retry loop.
        
      } catch (err) {
        clearTimeout(timeoutId);
        console.error(`Free provider attempt ${attempt} failed:`, err.message);
        
        if (attempt === maxRetries) {
          throw new Error(err.name === 'AbortError' ? 'Provider timeout' : err.message);
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000 + Math.random() * 500;
        console.log(`Retrying in ${Math.round(delay)}ms...`);
        await new Promise(res => setTimeout(res, delay));
      }
    }
    
    if (!success || !imageBuffer) {
      throw new Error('Failed to generate image after retries');
    }
    
    const base64Data = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    
    console.log('Uploading generated image to Cloudinary storage layer...');
    
    // Upload to our Cloudinary storage
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder: 'campaign_variations',
      tags: ['ai_generated', 'free_provider', 'pollinations']
    });

    return {
      secureUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      assetId: uploadResult.asset_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      modelUsed: 'free-pollinations'
    };

  } catch (error) {
    console.error('Free Provider API Error:', error);
    
    // Map timeout and rate limits
    const errorMsg = error.message || '';
    let code = 'GENERATION_ERROR';
    if (errorMsg.includes('timeout')) code = 'TIMEOUT';
    if (errorMsg.includes('Rate limit')) code = 'RATE_LIMITED';
    
    throw {
      code,
      provider: 'pollinations',
      message: errorMsg || 'Failed to generate image with free provider'
    };
  }
};

module.exports = {
  generateImage
};
