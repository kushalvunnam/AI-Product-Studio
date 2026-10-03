export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  try {
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Upload failed');
    if (!data.success || !data.asset) throw new Error('Invalid response from server');
    return data.asset;
  } catch (error) {
    console.error('API Error during upload:', error);
    throw error;
  }
};

export const analyzeProductImage = async (imageUrl) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Vision analysis failed');
    if (!data.success || !data.analysis) throw new Error('Invalid response from server');
    return data.analysis;
  } catch (error) {
    console.error('API Error during vision analysis:', error);
    throw error;
  }
};

export const generateCampaignImage = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generation/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Generation failed');
    if (!result.success || !result.asset) throw new Error('Invalid response from server');
    return result;
  } catch (error) {
    console.error('API Error during image generation:', error);
    throw error;
  }
};

export const generateCampaignVariations = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generation/variations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const text = await response.text();
    if (!text) throw new Error('Empty backend response. The image generation service might be down.');
    
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      if (response.status === 504) throw new Error('Variation generation timed out. The image generation service took too long.');
      if (response.status === 503 || response.status === 502) throw new Error('Image generation service is temporarily unavailable. Please retry.');
      if (response.status === 429) throw new Error('Image generation rate limit reached. Please wait and retry.');
      throw new Error(`Unexpected HTML response from server (Status ${response.status})`);
    }

    if (!response.ok) {
      const msg = result.message || result.error?.message || 'Variation generation failed on the backend.';
      const err = new Error(msg);
      if (result.error) err.code = result.error.code;
      throw err;
    }

    if (!result.success) throw new Error(result.message || 'Invalid response from server');
    return result;
  } catch (error) {
    console.error('API Error during variations generation:', error);
    throw error;
  }
};

export const getGenerationStatus = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generation/status/${jobId}`);
    const text = await response.text();
    if (!text) throw new Error('Empty backend response.');
    let result;
    try {
      result = JSON.parse(text);
    } catch(e) {
      throw new Error('Invalid JSON from status endpoint');
    }
    return result;
  } catch (error) {
    console.error('Status Error:', error);
    throw error;
  }
};

export const getConfiguredModels = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generation/models`);
    const result = await response.json();
    if (result.success) return result.models;
    return [];
  } catch (error) {
    console.error('API Error during get models:', error);
    return [];
  }
};