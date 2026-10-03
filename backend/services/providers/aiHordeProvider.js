const cloudinary = require('cloudinary').v2;
const fetch = global.fetch;

const getBase64FromUrl = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image from ${url}`);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
};

const submitHordeJob = async ({ prompt, referenceAsset }) => {
  try {
    console.log('[HORDE] submission started');
    if (!referenceAsset || !referenceAsset.secureUrl || !referenceAsset.mask || !referenceAsset.mask.secureUrl) {
      throw {
        code: "SOURCE_IMAGE_OR_MASK_MISSING",
        message: "Product image or product mask is missing. Please return to Upload Product."
      };
    }

    const sourceBase64 = await getBase64FromUrl(referenceAsset.secureUrl);
    const maskBase64 = await getBase64FromUrl(referenceAsset.mask.secureUrl);
    
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

    const submitRes = await fetch('https://stablehorde.net/api/v2/generate/async', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': '0000000000'
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

    console.log('[HORDE] submission accepted', jobId);
    console.log('[HORDE] horde job id:', jobId);

    return {
      isAsyncJob: true,
      providerJobId: jobId,
      provider: 'aihorde'
    };
  } catch (error) {
    console.error('AI Horde submission failed:', error);
    throw {
      code: error.code || 'GENERATION_ERROR',
      provider: 'aihorde',
      message: error.message || 'Unknown AI Horde error'
    };
  }
};

const checkHordeJob = async (jobId) => {
  try {
    const checkRes = await fetch(`https://stablehorde.net/api/v2/generate/check/${jobId}`);
    if (!checkRes.ok) throw new Error('Failed to check AI Horde status');
    const checkData = await checkRes.json();

    console.log(`[HORDE] status: checkData for ${jobId}`, { done: checkData.done, faulted: checkData.faulted, queue: checkData.queue_position });
    
    if (checkData.queue_position > 0) {
      console.log(`[HORDE] queue position: ${checkData.queue_position}`);
    }

    if (checkData.faulted) {
      return { status: 'failed', error: 'AI Horde job faulted or failed.' };
    }

    if (checkData.done) {
      console.log(`[HORDE] finished: ${jobId}`);
      const statusRes = await fetch(`https://stablehorde.net/api/v2/generate/status/${jobId}`);
      if (!statusRes.ok) throw new Error('Failed to retrieve AI Horde generation status');
      const statusData = await statusRes.json();
      
      if (!statusData.generations || statusData.generations.length === 0) {
        return { status: 'failed', error: 'RESULT_MISSING: AI Horde returned done but no generations were found.' };
      }
      
      const generatedBase64 = statusData.generations[0].img;
      console.log('[HORDE] result received');
      
      console.log('[CLOUDINARY] upload started');
      const b64Data = generatedBase64.startsWith('http') 
        ? generatedBase64 
        : `data:image/webp;base64,${generatedBase64}`;
        
      const uploadResult = await cloudinary.uploader.upload(b64Data, {
        folder: 'studio/variations'
      });
      console.log('[CLOUDINARY] upload completed');

      return {
        status: 'completed',
        secureUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        assetId: uploadResult.asset_id
      };
    }

    return { status: 'processing', queuePosition: checkData.queue_position };
  } catch (err) {
    console.error(`[HORDE] Error checking status for ${jobId}:`, err);
    return { status: 'processing', error: err.message }; // Transient error, keep processing
  }
};

const generateImage = async ({ prompt, referenceAsset }) => {
  // Backwards compatibility if needed, but not used by stateless variations
  throw new Error('Synchronous generateImage is deprecated for AI Horde. Use submitHordeJob.');
};

module.exports = { generateImage, submitHordeJob, checkHordeJob };
