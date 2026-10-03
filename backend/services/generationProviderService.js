const { generateImage: pollinationsGenerate } = require('./providers/pollinationsProvider');
const { submitHordeJob: aihordeGenerate } = require('./providers/aiHordeProvider');
const { submitFluxJob, checkFluxJob } = require('./providers/fluxProvider');
const { generateOpenAIImage } = require('./providers/openaiProvider');
const https = require('https');

const fetch = global.fetch;

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
  },
  {
    id: "flux-2-pro",
    label: "FLUX 2 Pro",
    provider: "flux",
    description: "High quality generation via Black Forest Labs",
    requiresApiKey: true,
    requires: ['BFL_API_KEY'],
    freeTier: false,
    capabilities: { textToImage: true, imageToImage: false, inpainting: false, productPreservation: false }
  },
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    provider: "openai",
    description: "OpenAI DALL-E generation",
    requiresApiKey: true,
    requires: ['OPENAI_API_KEY'],
    freeTier: false,
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

const checkOpenAIAvailability = () => {
  return new Promise((resolve) => {
    if (!process.env.OPENAI_API_KEY) return resolve({ reachable: false });
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/models',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
    }, (res) => {
      resolve({ reachable: res.statusCode === 200 });
    });
    req.on('error', () => resolve({ reachable: false }));
    req.end();
  });
};

const checkBFLAvailability = () => {
  return new Promise((resolve) => {
    if (!process.env.BFL_API_KEY) return resolve({ reachable: false });
    const req = https.request({
      hostname: 'api.bfl.ai', // Correct endpoint domain
      path: '/v1/models', // Dummy check
      method: 'GET',
      headers: { 'X-Key': process.env.BFL_API_KEY }
    }, (res) => {
      // If it redirects or returns any non-5xx, we consider it reachable for diagnostic
      resolve({ reachable: res.statusCode < 500 }); 
    });
    req.on('error', () => resolve({ reachable: false }));
    req.end();
  });
};

// Expose Diagnostics explicitly
const getProviderDiagnostics = async () => {
  const bflCheck = await checkBFLAvailability();
  const oaiCheck = await checkOpenAIAvailability();

  return {
    FLUX: {
      configured: !!process.env.BFL_API_KEY,
      implementation: true,
      api_reachable: bflCheck.reachable,
      generation_supported: true,
      product_workflow_supported: false,
      status: 'NOT WORKING - Unsupported Workflow'
    },
    GPT: {
      configured: !!process.env.OPENAI_API_KEY,
      implementation: true,
      api_reachable: oaiCheck.reachable,
      generation_supported: true,
      product_workflow_supported: false,
      status: 'NOT WORKING - Unsupported Workflow'
    }
  };
};

const getConfiguredModels = async () => {
  const isPollinationsAvailable = await checkPollinationsAvailability();
  
  // We can also check OpenAI / BFL if needed, but since they don't support productPreservation, 
  // we will just mark them as NOT AVAILABLE.

  const mapped = IMAGE_MODELS.map(model => {
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
    } else if (model.provider === 'flux' || model.provider === 'openai') {
      // As per instructions: if it doesn't support the required workflow, mark it unavailable.
      if (!model.capabilities.productPreservation) {
        available = false;
        reason = 'Does not support product preservation workflow natively.';
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
      capabilities: model.capabilities,
      reason
    };
  });

  // STEP 7: REMOVE BROKEN PROVIDERS
  // Hide any provider that does not support the product workflow AND is not ai-horde.
  // Actually, wait, pollinations doesn't support productPreservation either!
  // But the prompt says "Do not bring back Pollinations for product image-to-image."
  return mapped.filter(m => m.available || m.provider === 'aihorde');
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
  // Since we filtered unavailable ones out in getConfiguredModels, find might return undefined if we try to force it.
  const currentStatus = modelsConf.find(m => m.id === modelConfig.id) || { configured: true, available: false, reason: 'Unsupported workflow' };

  if (!currentStatus?.configured) {
    throw {
      code: "PROVIDER_NOT_CONFIGURED",
      provider: modelConfig.provider,
      model: modelConfig.id,
      message: `${modelConfig.provider} API key is missing.`
    };
  }

  if (!currentStatus?.available) {
    throw {
      code: "PROVIDER_UNSUPPORTED_WORKFLOW",
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
          code: err.code || 'PROVIDER_API_ERROR',
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
          code: err.code || 'PROVIDER_API_ERROR',
          provider: 'pollinations',
          model: modelConfig.id,
          message: err.message
        };
      }
      
    case 'flux':
      try {
        return await submitFluxJob({ prompt, referenceAsset, count });
      } catch (err) {
        throw {
          code: err.code || 'PROVIDER_API_ERROR',
          provider: 'flux',
          model: modelConfig.id,
          message: err.message
        };
      }
      
    case 'openai':
      try {
        return await generateOpenAIImage({ prompt, referenceAsset });
      } catch (err) {
        throw {
          code: err.code || 'PROVIDER_API_ERROR',
          provider: 'openai',
          model: modelConfig.id,
          message: err.message
        };
      }

    default:
      throw { code: "PROVIDER_NOT_IMPLEMENTED", message: "Unsupported image generation provider." };
  }
};

module.exports = {
  getConfiguredModels,
  routeGeneration,
  getProviderDiagnostics
};
