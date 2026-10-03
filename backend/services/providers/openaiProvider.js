const cloudinary = require('cloudinary').v2;
const fetch = global.fetch;

const generateImage = async ({ prompt, referenceAsset }) => {
  try {
    if (process.env.NODE_ENV === 'development' || true) {
      console.log('[OPENAI] provider selected');
      if (referenceAsset) {
        console.log('[OPENAI] source image available');
      }
      console.log('[OPENAI] generation request started');
    }

    // Since we don't implement complex PNG masking in memory, we enforce text-to-image only
    if (referenceAsset && referenceAsset.secureUrl) {
       // Should be blocked by frontend UI now, but just in case:
       throw {
         code: "SOURCE_IMAGE_TRANSFORMATION_UNSUPPORTED",
         message: "GPT Image 2 supports text-to-image only and cannot preserve your uploaded product."
       };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set.");
    }

    const payload = {
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json"
    };

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`OpenAI API Error: ${errorText}`);
    }

    const data = await res.json();
    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
      throw new Error("Invalid response format from OpenAI.");
    }
    
    if (process.env.NODE_ENV === 'development' || true) {
      console.log('[OPENAI] generation completed');
    }

    const b64Data = `data:image/png;base64,${data.data[0].b64_json}`;

    const uploadResult = await cloudinary.uploader.upload(b64Data, {
      folder: 'studio/variations'
    });

    return {
      success: true,
      secureUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      provider: 'openai'
    };
  } catch (error) {
    console.error('OpenAI generation failed:', error);
    throw {
      code: error.code || 'GENERATION_ERROR',
      provider: 'openai',
      message: error.message || 'Unknown OpenAI error'
    };
  }
};

module.exports = { generateImage };
