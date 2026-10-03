const { generateImage: pollinationsGenerate } = require('./providers/pollinationsProvider');
const { submitHordeJob: aihordeGenerate } = require('./providers/aiHordeProvider');

const fetch = global.fetch;

// Keep only providers that are currently implemented and usable in this application.
// Cloudinary remains the storage layer for generated assets, but its image-generation
// provider is intentionally not exposed here because the account previously returned
// a model-access error. FLUX 2 Pro, GPT Image 2, Nano Banana 2, and Recraft are not
// exposed until their actual generation integrations are verified end-to-end.
const IMAGE_MODELS = [
  {
    id: "free-aihorde",
    label: "AI Horde — Free Image-to-Image",
    provider: "aihorde",
    description: "Free product-preserving image-to-image generation",
    requiresApiKey: false,
    requires: [],
    freeTier: true,
    capabilities: { textToImage: true, imageToImage: true, inpainting: true, productPreservation: true }
  },
  {
    id: "free-pollinations",
    label: "Open Source Free",
    provider: "pollinations",
    description: "Free text-to-image generation",
    requiresApiKey: false,
    requires: [],
    freeTier: true,
    capabilities: { textToImage: true, imageToImage: false, inpainting: false, productPreservation: false }
  }
];

let pollinationsStatusCache = { available: true, lastChecked: 0 };

const checkPollinationsAvailability = async () => {
  const now = Date.now();
  if (now - pollinationsStatusCache.lastChecked < 60000) {
    return pollinationsStatusCache.available;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const endpoint = 'https://image.pollinations.ai/prompt/test?width=10&height=10&nologo=true';
    const headers = {};

    if (process.env.POLLINATIONS_API_KEY) {
      headers.Authorization = `Bearer ${process.env.POLLINATIONS_API_KEY}`;
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
    } else if (model.provider === 'pollinations' && !isPollinationsAvailable) {
      available = false;
      reason = 'Free generation temporarily unavailable';
    }

    return {
      id: model.id,
      name: model.label,
      provider: model.provider,
      available,
      requiresApiKey: model.requiresApiKey,
      freeTier: model.freeTier,
      configured,
      capabilities: model.capabilities,
      reason
    };
  });
};

const routeGeneration = async ({ prompt, referenceAsset, model, count }) => {
  const modelId = model?.id;
  const modelConfig = IMAGE_MODELS.find(m => m.id === modelId);

  if (!modelConfig) {
    throw {
      code: "MODEL_NOT_FOUND",
      message: `Model ${modelId || 'unknown'} is not available.`
    };
  }

  const modelsConf = await getConfiguredModels();
  const currentStatus = modelsConf.find(m => m.id === modelConfig.id);

  if (!currentStatus?.configured) {
    throw {
      code: "MISSING_API_KEY",
      provider: modelConfig.provider,
      model: modelConfig.id,
      message: `${modelConfig.provider} API key is missing.`
    };
  }

  if (!currentStatus?.available) {
    throw {
      code: "MODEL_NOT_AVAILABLE",
      provider: modelConfig.provider,
      model: modelConfig.id,
      message: `${modelConfig.provider} model is unavailable: ${currentStatus.reason}`
    };
  }

  console.log(`[PROVIDER SELECTED] ${modelConfig.id}`);
  console.log(`[PROVIDER ROUTED] ${modelConfig.provider}`);

  switch (modelConfig.provider) {
    case 'aihorde':
      try {
        return await aihordeGenerate({ prompt, referenceAsset, count });
      } catch (err) {
        throw {
          code: err.code || 'GENERATION_ERROR',
          provider: 'aihorde',
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

    default:
      throw { code: "INVALID_PROVIDER", message: "Unsupported image generation provider." };
  }
};

module.exports = {
  getConfiguredModels,
  routeGeneration
};
