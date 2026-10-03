const cloudinary = require('cloudinary').v2;
const fetch = global.fetch;

const getBase64FromUrl = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image from ${url}`);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
};

const pollHordeStatus = async (id, maxWaitMs = 300000) => {
  const startTime = Date.now();
  let pollInterval = 5000;

  while (Date.now() - startTime < maxWaitMs) {
    const checkRes = await fetch(`https://stablehorde.net/api/v2/generate/check/${id}`);
    if (!checkRes.ok) throw new Error('Failed to check AI Horde status');
    const checkData = await checkRes.json();

    if (checkData.faulted) {
      throw new Error('AI Horde job faulted or failed.');
    }

    if (checkData.done) {
      const statusRes = await fetch(`https://stablehorde.net/api/v2/generate/status/${id}`);
      if (!statusRes.ok) throw new Error('Failed to retrieve AI Horde generation status');
      const statusData = await statusRes.json();
      
      if (!statusData.generations || statusData.generations.length === 0) {
        throw new Error('AI Horde returned done but no generations were found.');
      }
      return statusData.generations[0].img;
    }

    // Wait and backoff slightly up to 15s
    await new Promise(r => setTimeout(r, pollInterval));
    pollInterval = Math.min(pollInterval + 2000, 15000);
  }

  throw new Error('AI Horde generation timed out.');
};

const generateImage = async ({ prompt, referenceAsset }) => {
  try {
    console.log('[AI HORDE] request started');
    if (!referenceAsset || !referenceAsset.secureUrl || !referenceAsset.mask || !referenceAsset.mask.secureUrl) {
      throw {
        code: "SOURCE_IMAGE_OR_MASK_MISSING",
        message: "Product image or product mask is missing. Please return to Upload Product."
      };
    }

    console.log('[AI HORDE] source image available');
    console.log('[AI HORDE] mask available');

    // 1. Fetch and convert images
    const sourceBase64 = await getBase64FromUrl(referenceAsset.secureUrl);
    const maskBase64 = await getBase64FromUrl(referenceAsset.mask.secureUrl);
    
    // 2. Submit to AI Horde
    const payload = {
      prompt: `${prompt}, photorealistic, high quality, 8k, highly detailed`,
      params: {
        sampler_name: "k_euler_a",
        cfg_scale: 7,
        denoising_strength: 0.9,
        steps: 30,
        width: 512,
        height: 512,
        karras: true
      },
      nsfw: false,
      censor_nsfw: true,
      models: ["stable_diffusion"],
      source_image: sourceBase64,
      source_processing: "inpainting",
      source_mask: maskBase64
    };

    console.log('[AI HORDE] job submitted');
    const submitRes = await fetch('https://stablehorde.net/api/v2/generate/async', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': '0000000000' // anonymous
      },
      body: JSON.stringify(payload)
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      throw new Error(`AI Horde API rejected request: ${errText}`);
    }

    const submitData = await submitRes.json();
    const jobId = submitData.id;

    if (!jobId) {
      throw new Error('AI Horde did not return a job ID');
    }

    // 3. Poll
    const generatedBase64 = await pollHordeStatus(jobId);
    console.log('[AI HORDE] job completed');

    // 4. Upload to Cloudinary
    const b64Data = generatedBase64.startsWith('http') 
      ? generatedBase64 
      : `data:image/webp;base64,${generatedBase64}`;
      
    const uploadResult = await cloudinary.uploader.upload(b64Data, {
      folder: 'studio/variations'
    });

    console.log('[AI HORDE] generation uploaded');

    return {
      success: true,
      secureUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      provider: 'aihorde'
    };
  } catch (error) {
    console.error('AI Horde generation failed:', error);
    throw {
      code: error.code || 'GENERATION_ERROR',
      provider: 'aihorde',
      message: error.message || 'Unknown AI Horde error'
    };
  }
};

module.exports = { generateImage };
