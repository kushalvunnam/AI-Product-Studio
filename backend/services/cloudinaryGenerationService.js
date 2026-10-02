const fetch = global.fetch;

const generateImageWithRetry = async (payload, authHeader, maxRetries = 3) => {
  const endpoint = `https://api.cloudinary.com/v2/generate/${process.env.CLOUDINARY_CLOUD_NAME}/image_to_image`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle successful responses
      if (response.ok) {
        const data = await response.json();
        return data;
      }

      // Handle errors
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}`;

      // Check if error is transient (429 Too Many Requests, or 5xx server errors)
      // "Generation limit exceeded" is usually 400 or 403, but let's check text as well
      const isTransient = response.status === 429 || (response.status >= 500 && response.status < 600) || errorMessage.toLowerCase().includes('limit');
      
      if (!isTransient || attempt === maxRetries) {
        throw new Error(errorMessage || 'Failed to generate image with Cloudinary API');
      }

      // Exponential backoff with jitter
      const delay = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 500, 10000);
      console.log(`Cloudinary rate limit/transient error (${response.status}). Retrying in ${Math.round(delay)}ms... (Attempt ${attempt}/${maxRetries})`);
      await new Promise(res => setTimeout(res, delay));
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        if (attempt === maxRetries) {
          throw new Error('Cloudinary image generation timed out after 60 seconds.');
        }
        // Timeout is considered transient, retry
        const delay = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 500, 10000);
        console.log(`Cloudinary timeout. Retrying in ${Math.round(delay)}ms... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }

      throw error; // Not an abort error, maybe syntax error or unhandled error
    }
  }
};

const generateImage = async ({ prompt, referenceAsset, model, settings }) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not properly configured.');
  }

  const payload = {
    prompt: prompt,
    target: {
      target_type: "managed_asset",
      folder: "productstudio/generated"
    }
  };

  if (referenceAsset.assetId) {
    payload.reference_images = [{ source_type: "managed_asset", asset_id: referenceAsset.assetId }];
  } else if (referenceAsset.secureUrl) {
    payload.reference_images = [{ source_type: "url", url: referenceAsset.secureUrl }];
  } else {
    throw new Error('A reference asset with assetId or secureUrl must be provided.');
  }

  if (model.id && model.id !== 'auto') {
    payload.model = { id: model.id };
  } else {
    payload.model = { mode: 'auto', preference: model.preference || 'balanced' };
  }

  const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  
  try {
    const data = await generateImageWithRetry(payload, authHeader);

    const generatedAsset = data.data?.assets ? data.data.assets[0] : data.target_asset;
    
    if (!generatedAsset) {
        throw new Error('Cloudinary response missing generated asset: ' + JSON.stringify(data));
    }
    
    const storage = generatedAsset.storage || generatedAsset;

    return {
      secureUrl: storage.secure_url,
      publicId: storage.public_id,
      assetId: storage.asset_id,
      width: generatedAsset.width,
      height: generatedAsset.height,
      format: generatedAsset.format,
      modelUsed: data.model ? data.model.id : (model.id || 'auto')
    };

  } catch (error) {
    console.error('Cloudinary Generation API Error:', error.message);
    throw new Error(error.message || 'Failed to generate image with Cloudinary API');
  }
};

module.exports = {
  generateImage
};
