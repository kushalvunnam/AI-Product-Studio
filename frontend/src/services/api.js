export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Uploads a product image to the backend which handles Cloudinary upload
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} - The Cloudinary asset metadata
 */
export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    if (!data.success || !data.asset) {
      throw new Error('Invalid response from server');
    }

    return data.asset;
  } catch (error) {
    console.error('API Error during upload:', error);
    throw error;
  }
};

/**
 * Analyze a product image using the backend AI Vision service
 * @param {string} imageUrl - The Cloudinary secure URL of the image
 * @returns {Promise<Object>} - The structured AI analysis
 */
export const analyzeProductImage = async (imageUrl) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vision/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Vision analysis failed');
    }

    if (!data.success || !data.analysis) {
      throw new Error('Invalid response from server');
    }

    return data.analysis;
  } catch (error) {
    console.error('API Error during vision analysis:', error);
    throw error;
  }
};

/**
 * Generate a campaign image using Cloudinary's Generative AI
 * @param {Object} data - Contains sourceImage, analysis, creativeBrief, model
 * @returns {Promise<Object>} - The generated Cloudinary asset and metadata
 */
export const generateCampaignImage = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generation/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Generation failed');
    }

    if (!result.success || !result.asset) {
      throw new Error('Invalid response from server');
    }

    return result;
  } catch (error) {
    console.error('API Error during image generation:', error);
    throw error;
  }
};

/**
 * Generate multiple campaign variations using Cloudinary's Generative AI
 * @param {Object} data - Contains sourceImage, analysis, creativeBrief, model, variationCount
 * @returns {Promise<Object>} - The generated Cloudinary variations and failures
 */
export const generateCampaignVariations = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generation/variations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    let result; try { result = await response.json(); } catch(e) { throw new Error('Cloudinary Generation Timeout/Error (500/504). Please try again.'); } if (!response.ok) { throw new Error(result.message || 'Variation generation failed'); }

    if (!result.success || !result.variations) {
      throw new Error('Invalid response from server');
    }

    return result;
  } catch (error) {
    console.error('API Error during variations generation:', error);
    throw error;
  }
};
