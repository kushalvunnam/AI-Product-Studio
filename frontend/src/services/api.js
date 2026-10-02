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

    const text = await response.text();
    
    if (!text) {
      throw new Error('Empty backend response. The image generation service might be down.');
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      // It's not JSON (probably HTML from Render 502/504)
      if (response.status === 504) {
        throw new Error('Variation generation timed out. The image generation service took too long.');
      }
      if (response.status === 503 || response.status === 502) {
        throw new Error('Image generation service is temporarily unavailable. Please retry.');
      }
      if (response.status === 429) {
        throw new Error('Image generation rate limit reached. Please wait and retry.');
      }
      throw new Error(`Unexpected HTML response from server (Status ${response.status})`);
    }

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Variation generation failed on the backend.');
    }

    if (!result.success) {
      throw new Error(result.message || 'Invalid response from server');
    }

    // Notice we removed !result.variations because isAsync might be true
    return result;
  } catch (error) {
    console.error('API Error during variations generation:', error);
    throw error;
  }
};
