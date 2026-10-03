const { generateImage: cloudinaryGenerate } = require('./cloudinaryGenerationService');

const IMAGE_MODELS = [
  {
    id: "auto",
    label: "Auto — Recommended",
    provider: "cloudinary",
    description: "Recommended for most campaigns",
    requires: ["CLOUDINARY_API_KEY", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_SECRET"]
  },
  {
    id: "nano-banana-2",
    label: "Nano Banana 2",
    provider: "google",
    description: "Google image generation",
    requires: ["GOOGLE_AI_API_KEY"]
  },
  {
    id: "flux-2-pro",
    label: "FLUX 2 Pro",
    provider: "flux",
    description: "High-quality image generation",
    requires: ["FLUX_API_KEY"]
  },
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    provider: "openai",
    description: "OpenAI image generation",
    requires: ["OPENAI_API_KEY"]
  },
  {
    id: "recraft-v4",
    label: "Recraft v4",
    provider: "recraft",
    description: "Creative/product visuals",
    requires: ["RECRAFT_API_KEY"]
  }
];

const getConfiguredModels = () => {
  return IMAGE_MODELS.map(model => {
    // Check if all required env vars are present
    const available = model.requires.every(key => !!process.env[key]);
    return {
      id: model.id,
      label: model.label,
      provider: model.provider,
      description: model.description,
      available
    };
  });
};

const routeGeneration = async ({ prompt, referenceAsset, model, count, settings }) => {
  let modelConfig = IMAGE_MODELS.find(m => m.id === model.id);
  
  if (!modelConfig) {
    if (model.mode === 'auto') {
      modelConfig = IMAGE_MODELS[0];
    } else {
      throw { code: "MODEL_NOT_FOUND", message: `Model ${model.id} is not recognized.` };
    }
  }

  // Check availability
  const isAvailable = modelConfig.requires.every(key => !!process.env[key]);
  if (!isAvailable) {
    throw {
      code: "MISSING_API_KEY",
      provider: modelConfig.provider,
      model: modelConfig.id,
      message: `${modelConfig.provider.charAt(0).toUpperCase() + modelConfig.provider.slice(1)} generation is not configured on this server.`
    };
  }

  switch (modelConfig.provider) {
    case 'cloudinary':
      try {
        return await cloudinaryGenerate({ prompt, referenceAsset, model: { id: modelConfig.id, mode: modelConfig.id === 'auto' ? 'auto' : 'specific' }, settings });
      } catch (err) {
        // Wrap and standardize error
        throw {
          code: err.message.includes('allow this model') ? 'MODEL_NOT_AVAILABLE' : 
                err.message.includes('timeout') ? 'TIMEOUT' :
                err.message.includes('rate limit') ? 'RATE_LIMITED' : 'GENERATION_ERROR',
          provider: 'cloudinary',
          model: modelConfig.id,
          message: err.message
        };
      }
    
    case 'google':
      throw { code: "NOT_IMPLEMENTED", provider: "google", message: "Google image generation logic is not yet implemented." };
      
    case 'flux':
      throw { code: "NOT_IMPLEMENTED", provider: "flux", message: "FLUX image generation logic is not yet implemented." };

    case 'openai':
      throw { code: "NOT_IMPLEMENTED", provider: "openai", message: "OpenAI image generation logic is not yet implemented." };

    case 'recraft':
      throw { code: "NOT_IMPLEMENTED", provider: "recraft", message: "Recraft image generation logic is not yet implemented." };

    default:
      throw { code: "INVALID_PROVIDER", message: "Unsupported image generation provider." };
  }
};

module.exports = {
  getConfiguredModels,
  routeGeneration
};
