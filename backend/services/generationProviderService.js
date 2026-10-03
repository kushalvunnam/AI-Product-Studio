const { generateImage: cloudinaryGenerate } = require('./providers/cloudinaryProvider');
const { generateImageWithGoogle } = require('./providers/googleProvider');
const { generateImage: pollinationsGenerate } = require('./providers/pollinationsProvider');
const { generateImage: openaiGenerate } = require('./providers/openaiProvider');
const { generateImage: fluxGenerate } = require('./providers/fluxProvider');
const { generateImage: recraftGenerate } = require('./providers/recraftProvider');

const fetch = global.fetch;

const IMAGE_MODELS = [
  {
    id: "free-pollinations",
    label: "Open Source Free",
    provider: "pollinations",
    description: "Free public image generation",
    requiresApiKey: false,
    requires: [],
    freeTier: true
  },
  {
    id: "auto",
    label: "Auto — Recommended",
    provider: "cloudinary",
    description: "Recommended for most campaigns",
    requiresApiKey: true,
    requires: ["CLOUDINARY_API_KEY", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_SECRET"],
    freeTier: false
  },
  {
    id: "nano-banana-2",
    label: "Nano Banana 2",
    provider: "google",
    description: "Google image generation",
    requiresApiKey: true,
    requires: ["GOOGLE_AI_API_KEY"],
    freeTier: false
  },
  {
    id: "flux-2-pro",
    label: "FLUX 2 Pro",
    provider: "flux",
    description: "High-quality image generation",
    requiresApiKey: true,
    requires: ["FLUX_API_KEY"],
    freeTier: false
  },
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    provider: "openai",
    description: "OpenAI image generation",
    requiresApiKey: true,
    requires: ["OPENAI_API_KEY"],
    freeTier: false
  },
  {
    id: "recraft-v4",
    label: "Recraft v4",
    provider: "recraft",
    description: "Creative/product visuals",
    requiresApiKey: true,
    requires: ["RECRAFT_API_KEY"],
    freeTier: false
  }
];

// Cache for pollinations check
let pollinationsStatusCache = { available: true, lastChecked: 0 };

const checkPollinationsAvailability = async () => {
  const now = Date.now();
  if (now - pollinationsStatusCache.lastChecked < 60000) {
    return pollinationsStatusCache.available;
  }
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    // Lightweight check
    const endpoint = 'https://image.pollinations.ai/prompt/test?width=10&height=10&nologo=true';
    const headers = {};
    if (process.env.POLLINATIONS_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.POLLINATIONS_API_KEY}`;
    }
    
    const res = await fetch(endpoint, { method: 'HEAD', headers, signal: controller.signal });
    clearTimeout(timeout);
    
    pollinationsStatusCache.available = res.ok;
    pollinationsStatusCache.lastChecked = now;
    return res.ok;
  } catch (err) {
    pollinationsStatusCache.available = false;
    pollinationsStatusCache.lastChecked = now;
    return false;
  }
};

const getConfiguredModels = async () => {
  // Check pollinations dynamically
  const isPollinationsAvailable = await checkPollinationsAvailability();

  return IMAGE_MODELS.map(model => {
    let configured = true;
    let available = true;
    let reason = '';

    if (model.requires.length > 0) {
      configured = model.requires.every(key => !!process.env[key]);
    }

    if (!configured) {
      available = false;
      reason = 'API Key Missing';
    } else {
      if (model.provider === 'google' && configured) {
         // Google API has a strict 0 limit in the current tier
         available = false;
         reason = 'Quota Exceeded / Free Tier Blocked';
      }
      
      if (model.provider === 'pollinations') {
        if (!isPollinationsAvailable) {
          available = false;
          reason = 'Free generation temporarily unavailable';
        }
      }
      
      // Force non-implemented paid models to be unavailable even if key exists
      if (['openai', 'flux', 'recraft'].includes(model.provider) && configured) {
        available = false;
        reason = 'Model logic not implemented';
      }
    }

    return {
      id: model.id,
      name: model.label,
      provider: model.provider,
      available,
      requiresApiKey: model.requiresApiKey,
      freeTier: model.freeTier,
      configured,
      reason
    };
  });
};

const routeGeneration = async ({ prompt, referenceAsset, model, count, settings }) => {
  let modelConfig = IMAGE_MODELS.find(m => m.id === model.id);
  
  if (!modelConfig) {
    if (model.mode === 'auto') {
      modelConfig = IMAGE_MODELS.find(m => m.id === 'auto');
    } else {
      throw { code: "MODEL_NOT_FOUND", message: `Model ${model.id} is not recognized.` };
    }
  }

  // Check availability dynamically
  const modelsConf = await getConfiguredModels();
  const currentStatus = modelsConf.find(m => m.id === modelConfig.id);
  
  if (!currentStatus.configured) {
    throw {
      code: "MISSING_API_KEY",
      provider: modelConfig.provider,
      model: modelConfig.id,
      message: `${modelConfig.provider.charAt(0).toUpperCase() + modelConfig.provider.slice(1)} API key is missing.`
    };
  }

  if (!currentStatus.available) {
    throw {
      code: "MODEL_NOT_AVAILABLE",
      provider: modelConfig.provider,
      model: modelConfig.id,
      message: `${modelConfig.provider.charAt(0).toUpperCase() + modelConfig.provider.slice(1)} model is unavailable: ${currentStatus.reason}`
    };
  }

  switch (modelConfig.provider) {
    case 'cloudinary':
      try {
        return await cloudinaryGenerate({ prompt, referenceAsset, model: { id: modelConfig.id, mode: modelConfig.id === 'auto' ? 'auto' : 'specific' }, settings });
      } catch (err) {
        throw {
          code: err.message.includes('allow this model') ? 'MODEL_NOT_AVAILABLE' : 
                err.message.includes('timeout') ? 'TIMEOUT' :
                err.message.includes('rate limit') ? 'RATE_LIMITED' : 'GENERATION_ERROR',
          provider: 'cloudinary',
          model: modelConfig.id,
          message: err.message
        };
      }
    
    case 'pollinations':
      try {
        return await pollinationsGenerate({ prompt, referenceAsset, model: modelConfig.id });
      } catch (err) {
        throw {
          code: err.code || 'GENERATION_ERROR',
          provider: 'pollinations',
          model: modelConfig.id,
          message: err.message
        };
      }

    case 'google':
      return await generateImageWithGoogle(referenceAsset.url, prompt, modelConfig.id, count || 1);
      
    case 'flux':
      return await fluxGenerate();

    case 'openai':
      return await openaiGenerate();

    case 'recraft':
      return await recraftGenerate();

    default:
      throw { code: "INVALID_PROVIDER", message: "Unsupported image generation provider." };
  }
};

module.exports = {
  getConfiguredModels,
  routeGeneration
};
