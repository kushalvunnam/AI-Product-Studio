const fetch = require('node-fetch') || global.fetch;

const generateImage = async ({ prompt, referenceAsset, model, settings }) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not properly configured.');
  }

  const endpoint = \`https://api.cloudinary.com/v2/generate/\${cloudName}/image_to_image\`;
  
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

  const authHeader = 'Basic ' + Buffer.from(\`\${apiKey}:\${apiSecret}\`).toString('base64');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout per variation

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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate image with Cloudinary API');
    }
    
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
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Cloudinary image generation timed out after 60 seconds.');
    }
    throw new Error(error.message || 'Failed to generate image with Cloudinary API');
  }
};

module.exports = {
  generateImage
};
