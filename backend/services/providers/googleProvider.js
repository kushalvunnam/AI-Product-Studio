const { GoogleGenerativeAI } = require('@google/generative-ai');
const cloudinary = require('cloudinary').v2;

/**
 * Generates an image using Google's Gemini models
 * (Currently gemini-3.1-flash-image)
 */
async function generateImageWithGoogle(imageUrl, prompt, modelId, count) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw { code: 'MISSING_API_KEY', message: 'Google API key is missing' };
    }

    // Map internal UI model ID to actual Google API model ID
    let googleModel = 'gemini-3.1-flash-image';
    if (modelId === 'nano-banana-2' || modelId === 'gemini-3.1-flash-image') {
      googleModel = 'gemini-3.1-flash-image';
    } else if (modelId === 'nano-banana-pro' || modelId === 'gemini-3-pro-image') {
      googleModel = 'gemini-3-pro-image';
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: googleModel });

    // We fetch the source image to pass as part of the prompt for image-to-image/reference
    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) throw new Error('Failed to fetch source image');
    const arrayBuffer = await imageResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType
      }
    };

    const finalPrompt = prompt + "\nProvide the output as an image. Generate a high quality product shot.";

    const variations = [];

    // The free tier Google API currently throws 429 Limit 0 for all image models.
    // However, if the quota is increased, this will execute successfully.
    for (let i = 0; i < count; i++) {
      try {
        const result = await model.generateContent([finalPrompt, imagePart]);
        const response = result.response;
        
        // Extract base64 image from the model response
        let generatedBase64 = null;
        
        // Check if the response returned an image part
        if (response.candidates && response.candidates[0].content.parts) {
          const parts = response.candidates[0].content.parts;
          for (const part of parts) {
            if (part.inlineData) {
              generatedBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
        }
        
        if (!generatedBase64) {
          throw new Error('Google API did not return an image part');
        }

        // Upload the base64 generated image to Cloudinary for permanent storage
        const uploadResult = await cloudinary.uploader.upload(generatedBase64, {
          folder: 'campaign_variations',
          tags: ['ai_generated', 'google', googleModel]
        });

        variations.push({
          url: uploadResult.secure_url,
          provider: 'google',
          modelUsed: googleModel
        });
      } catch (err) {
        console.error(`Google generation failed for variation ${i}:`, err);
        throw err;
      }
    }

    return {
      success: true,
      provider: 'google',
      model: googleModel,
      variations
    };
  } catch (error) {
    console.error('Google Generation Service Error:', error);
    
    // Parse Google quota limit error specifically
    if (error.status === 429) {
       throw { 
         success: false, 
         provider: 'google', 
         code: 'QUOTA_EXCEEDED', 
         message: 'Your Google AI Studio quota for this model has been exceeded or is not enabled for this tier.' 
       };
    }
    
    throw {
      success: false,
      provider: 'google',
      code: error.code || 'GOOGLE_API_ERROR',
      message: error.message || 'An error occurred during Google generation',
      raw: error.toString()
    };
  }
}

module.exports = {
  generateImageWithGoogle
};
