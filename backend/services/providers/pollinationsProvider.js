const fetch = global.fetch;
const cloudinary = require('cloudinary').v2;

const generateImage = async ({ prompt, referenceAsset, model }) => {
  try {
    if (referenceAsset && (referenceAsset.publicId || referenceAsset.url || referenceAsset.secure_url)) {
      throw {
        code: "SOURCE_IMAGE_TRANSFORMATION_UNSUPPORTED",
        message: "The selected free provider cannot reliably transform the uploaded source image."
      };
    }

    const finalPrompt = `${prompt}. High quality, detailed, realistic product shot.`;
    const seed = Math.floor(Math.random() * 1000000);
    
    const endpoint = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;

    console.log('--- POLLINATIONS PROVIDER REQUEST ---');
    console.log(`Endpoint: https://image.pollinations.ai/prompt/...`); // Avoid logging full prompts if they contain PII
    
    const headers = {};
    if (process.env.POLLINATIONS_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.POLLINATIONS_API_KEY}`;
    }
    
    let imageBuffer;
    let maxRetries = 3;
    let success = false;
    let lastError = '';
    
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
          if (response.status === 429) throw new Error('Rate limit exceeded');
          if (response.status === 408) throw new Error('Request Timeout');
          if (response.status === 401 || response.status === 403) throw new Error('Pollinations API key is invalid or unauthorized');
          if (response.status >= 500) throw new Error(`Server error ${response.status}`);
          throw new Error(`Failed to generate image: HTTP ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          throw new Error(`Invalid content type received: ${contentType}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength === 0) {
          throw new Error('Received empty image buffer from provider');
        }

        imageBuffer = Buffer.from(arrayBuffer);
        success = true;
        break; 
        
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err.name === 'AbortError' ? 'Provider timeout' : err.message;
        console.error(`[Attempt ${attempt}/${maxRetries}] Pollinations generation failed:`, lastError);
        
        if (attempt === maxRetries) {
          throw {
            code: "FREE_PROVIDER_UNAVAILABLE",
            message: "Free image generation is temporarily unavailable. Please try again.",
            details: lastError
          };
        }
        
        const delay = Math.pow(2, attempt - 1) * 1000 + Math.random() * 500;
        await new Promise(res => setTimeout(res, delay));
      }
    }
    
    if (!success || !imageBuffer) {
      throw {
        code: "FREE_PROVIDER_UNAVAILABLE",
        message: "Free image generation is temporarily unavailable. Please try again."
      };
    }
    
    const base64Data = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    
    // Cloudinary used ONLY for storage
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
    if (error.code === 'FREE_PROVIDER_UNAVAILABLE' || error.code === 'SOURCE_IMAGE_TRANSFORMATION_UNSUPPORTED') {
      throw error;
    }
    
    console.error('Pollinations Unexpected Error:', error);
    throw {
      code: 'FREE_PROVIDER_UNAVAILABLE',
      provider: 'pollinations',
      message: 'Free image generation is temporarily unavailable. Please try again.'
    };
  }
};

module.exports = { generateImage };
