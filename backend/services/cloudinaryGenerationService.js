const fetch = global.fetch;

const generateImageWithRetry = async (payload, authHeader, modelContext, maxRetries = 3) => {
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

      // Handle errors securely without exposing secrets
      let errorData = {};
      try {
        const text = await response.text();
        if (text) {
          errorData = JSON.parse(text);
        }
      } catch (e) {
        // failed to parse json
      }

      const cloudinaryErrorCode = errorData.error?.code || 'UNKNOWN';
      const cloudinaryErrorMsg = errorData.error?.message || `HTTP ${response.status}`;

      // Log safely
      console.error('--- CLOUDINARY API ERROR ---');
      console.error(`HTTP status: ${response.status}`);
      console.error(`Cloudinary error code: ${cloudinaryErrorCode}`);
      console.error(`Cloudinary error message: ${cloudinaryErrorMsg}`);
      console.error(`Selected model: ${modelContext.resolvedModel}`);
      console.error(`Attempt: ${attempt}/${maxRetries}`);
      console.error('----------------------------');

      const isRateLimit = response.status === 429 || cloudinaryErrorMsg.toLowerCase().includes('rate limit');
      const isTransient = isRateLimit || (response.status >= 500 && response.status < 600);
      
      const errorStrLower = cloudinaryErrorMsg.toLowerCase();
      const codeStrLower = String(cloudinaryErrorCode).toLowerCase();

      // Check specific error messages requested by user
      if (
        response.status === 400 && 
        (errorStrLower.includes('unsupported') || errorStrLower.includes('invalid') || errorStrLower.includes('not support') || codeStrLower.includes('invalid_model'))
      ) {
        throw new Error('Selected model is currently unavailable for reference-image generation.');
      }

      if (
        response.status === 401 || response.status === 403 || 
        errorStrLower.includes('plan') || errorStrLower.includes('credit') || errorStrLower.includes('allow')
      ) {
        throw new Error('Cloudinary does not currently allow this model for this account.');
      }

      if (!isTransient || attempt === maxRetries) {
        if (isRateLimit) {
            throw new Error('Cloudinary rate limit reached. Please try again later.');
        }
        throw new Error(cloudinaryErrorMsg || 'Failed to generate image with Cloudinary API');
      }

      // Transient delay
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

      throw error; // Rethrow parsed error
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

  let resolvedModel = 'auto';
  let mode = 'auto';
  if (model.id && model.id !== 'auto') {
    payload.model = { id: model.id };
    resolvedModel = model.id;
    mode = 'manual';
  } else {
    payload.model = { mode: 'auto', preference: model.preference || 'balanced' };
    resolvedModel = 'auto';
    mode = 'auto';
  }

  const modelContext = {
    resolvedModel,
    mode
  };

  console.log('--- GENERATION REQUEST ---');
  console.log(`Selected UI model: ${model.name || model.id || 'Auto'}`);
  console.log(`Resolved Cloudinary model: ${resolvedModel}`);
  console.log(`Endpoint: image_to_image`);
  console.log(`Generation mode: ${mode}`);
  console.log('--------------------------');

  const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  
  try {
    const data = await generateImageWithRetry(payload, authHeader, modelContext);

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
      modelUsed: data.model ? data.model.id : resolvedModel
    };

  } catch (error) {
    console.error('Cloudinary Generation API Error:', error.message);
    throw new Error(error.message || 'Failed to generate image with Cloudinary API');
  }
};

module.exports = {
  generateImage
};
