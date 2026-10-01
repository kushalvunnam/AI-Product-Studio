const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY || '');

/**
 * Fetch image from URL and convert to generative AI part
 */
async function urlToGenerativePart(imageUrl) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch image from Cloudinary');
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: response.headers.get('content-type') || 'image/jpeg'
    }
  };
}

/**
 * Analyze an uploaded product image using AI Vision
 * @param {string} imageUrl - URL of the uploaded image
 * @returns {Promise<Object>} - Vision analysis results
 */
const analyzeProductImage = async (imageUrl) => {
  if (!process.env.AI_API_KEY) {
    throw new Error('Your AI API configuration is missing.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const imagePart = await urlToGenerativePart(imageUrl);
    
    const prompt = `Analyze this product image for a marketing campaign. Return ONLY a valid JSON object with the exact following schema. Do not include markdown formatting or backticks around the JSON.
{
  "productName": "A concise name for the product",
  "category": "Broad category",
  "subcategory": "Specific subcategory",
  "description": "A detailed, descriptive marketing-friendly description of the product and its aesthetic",
  "dominantColors": ["#hex1", "#hex2", "Color Name"],
  "visualStyle": "The overall visual aesthetic (e.g., Minimalist, Rugged, Premium)",
  "materials": ["Material 1", "Material 2"],
  "visibleFeatures": ["Feature 1", "Feature 2"],
  "background": "Description of the current background",
  "composition": "How the product is framed/positioned",
  "targetAudience": "Who this product appeals to",
  "marketingKeywords": ["keyword1", "keyword2"]
}
If a field cannot be reliably determined from the image, use "unknown" or an empty array. Do not hallucinate.`;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Clean up response if model included markdown
    const cleanedText = responseText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    
    const analysis = JSON.parse(cleanedText);
    
    // Validate output roughly
    return {
      productName: typeof analysis.productName === 'string' ? analysis.productName : 'unknown',
      category: typeof analysis.category === 'string' ? analysis.category : 'unknown',
      subcategory: typeof analysis.subcategory === 'string' ? analysis.subcategory : 'unknown',
      description: typeof analysis.description === 'string' ? analysis.description : 'unknown',
      dominantColors: Array.isArray(analysis.dominantColors) ? analysis.dominantColors : [],
      visualStyle: typeof analysis.visualStyle === 'string' ? analysis.visualStyle : 'unknown',
      materials: Array.isArray(analysis.materials) ? analysis.materials : [],
      visibleFeatures: Array.isArray(analysis.visibleFeatures) ? analysis.visibleFeatures : [],
      background: typeof analysis.background === 'string' ? analysis.background : 'unknown',
      composition: typeof analysis.composition === 'string' ? analysis.composition : 'unknown',
      targetAudience: typeof analysis.targetAudience === 'string' ? analysis.targetAudience : 'unknown',
      marketingKeywords: Array.isArray(analysis.marketingKeywords) ? analysis.marketingKeywords : [],
    };
  } catch (error) {
    console.error('AI Vision Error:', error);
    if (error.name === 'SyntaxError') {
      throw new Error('AI returned malformed JSON response.');
    }
    if (error.message && error.message.includes('API configuration is missing')) {
      throw error;
    }
    throw new Error('AI Vision service is temporarily unavailable.');
  }
};

/**
 * Generate marketing assets based on creative brief
 * @param {Object} brief - Campaign creative brief
 * @param {string} sourceImageUrl - Original product image URL
 * @returns {Promise<Array>} - Array of generated asset objects
 */
const generateCampaignAssets = async (brief, sourceImageUrl) => {
  // Simulate API delay for Phase 4 implementation placeholder
  await new Promise(resolve => setTimeout(resolve, 3500));
  
  const { variations, platforms, style } = brief;
  const assets = [];
  
  // Create mock generated assets based on requested variations
  for (let i = 0; i < (variations || 2); i++) {
    assets.push({
      id: `asset_${Date.now()}_${i}`,
      url: sourceImageUrl, // In reality, this would be the newly generated image URL
      platform: platforms && platforms.length > 0 ? platforms[i % platforms.length] : 'Instagram Post',
      aiModel: brief.model || 'Stable Diffusion XL',
      style: style || 'Premium',
      generationTime: '3.2s',
      variationNumber: i + 1,
      createdAt: new Date().toISOString()
    });
  }
  
  return assets;
};

module.exports = {
  analyzeProductImage,
  generateCampaignAssets
};
