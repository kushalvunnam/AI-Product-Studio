/**
 * Generates an image using Cloudinary's official Image Generation API (POST /v2/generate/<CLOUD_NAME>/image_to_image)
 * 
 * @param {Object} params
 * @param {string} params.prompt - The generated prompt
 * @param {Object} params.referenceAsset - The source image containing assetId and secureUrl
 * @param {Object} params.model - Model selection (mode, preference, or specific id)
 * @param {Object} params.settings - Additional settings
 * @returns {Promise<Object>} - The generated asset details
 */
const generateImage = async ({ prompt, referenceAsset, model, settings }) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not properly configured.');
  }

  const endpoint = `https://api.cloudinary.com/v2/generate/${cloudName}/image_to_image`;
  
  // Construct the payload according to Cloudinary Image Generation API specs
  const payload = {
    prompt: prompt,
    target: {
      target_type: "managed_asset",
      folder: "productstudio/generated"
    }
  };

  // Configure reference image using managed asset if available, otherwise fallback to URL
  if (referenceAsset.assetId) {
    payload.reference_images = [
      {
        source_type: "managed_asset",
        asset_id: referenceAsset.assetId
      }
    ];
  } else if (referenceAsset.secureUrl) {
    payload.reference_images = [
      {
        source_type: "url",
        url: referenceAsset.secureUrl
      }
    ];
  } else {
    throw new Error('A reference asset with assetId or secureUrl must be provided.');
  }

  // Configure Model
  if (model.id && model.id !== 'auto') {
    payload.model = { id: model.id };
  } else {
    payload.model = {
      mode: 'auto',
      preference: model.preference || 'balanced'
    };
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    // Dynamic import for node-fetch if using Node 16/17, or just use global fetch for Node 18+
    // Using global fetch (Express + Node >= 18)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate image with Cloudinary API');
    }
    
    console.log("Cloudinary Success Response:", JSON.stringify(data, null, 2));

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
