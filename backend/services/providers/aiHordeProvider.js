const cloudinary = require('cloudinary').v2;
const fetch = global.fetch;

const getBase64FromUrl = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image from ${url}`);
  const contentType = response.headers.get('content-type');
  const buffer = await response.arrayBuffer();
  const buff = Buffer.from(buffer);
  
  return {
    base64: buff.toString('base64'),
    size: buff.length,
    contentType,
    status: response.status
  };
};

const submitHordeJob = async ({ prompt, referenceAsset, count }) => {
  try {
    console.log('[HORDE] submission started');
    if (!referenceAsset || !referenceAsset.secureUrl || !referenceAsset.mask || !referenceAsset.mask.secureUrl) {
      throw {
        code: "SOURCE_IMAGE_OR_MASK_MISSING",
        message: "Product image or product mask is missing. Please return to Upload Product."
      };
    }

    const sourceData = await getBase64FromUrl(referenceAsset.secureUrl);
    if (!sourceData.base64 || sourceData.size === 0) {
      throw { code: 'SOURCE_IMAGE_INVALID', message: `Invalid source image. Size: ${sourceData.size}, Status: ${sourceData.status}, Type: ${sourceData.contentType}` };
    }
    
    const maskData = await getBase64FromUrl(referenceAsset.mask.secureUrl);
    if (!maskData.base64 || maskData.size === 0) {
      throw { code: 'SOURCE_MASK_INVALID', message: `Invalid mask image. Size: ${maskData.size}, Status: ${maskData.status}, Type: ${maskData.contentType}` };
    }

    console.log('[AI HORDE] MASK_FILE_SIZE', maskData.size);
    // Calculated correctly in frontend component (`alpha > 128 -> BLACK(0,0,0) [preserve], alpha <= 128 -> WHITE(255) [edit]`)
    console.log('[AI HORDE] BLACK_PIXEL_PERCENTAGE', 'calculated_in_frontend');
    console.log('[AI HORDE] WHITE_PIXEL_PERCENTAGE', 'calculated_in_frontend');

    // Using an explicit inpainting model solves the NoAvailableWorker hang that occurs if you use 'stable_diffusion'
    const models = ["Realistic Vision Inpainting", "DreamShaper Inpainting", "Anything Diffusion Inpainting"];

    const payload = {
      prompt: `${prompt}, photorealistic, high quality, 8k, highly detailed`,
      params: {
        sampler_name: "k_euler_a",
        cfg_scale: 7,
        denoising_strength: 0.9,
        steps: 30,
        width: 512,
        height: 512,
        karras: true,
        n: 1 // Test with 1 variation first to ensure robustness
      },
      nsfw: false,
      censor_nsfw: true,
      models: models,
      source_image: sourceData.base64,
      source_processing: "inpainting",
      source_mask: maskData.base64
    };

    console.log('[AI HORDE] model', payload.models);
    console.log('[AI HORDE] source_processing', payload.source_processing);
    console.log('[AI HORDE] source image present', !!payload.source_image);
    console.log('[AI HORDE] source image size', sourceData.size);
    console.log('[AI HORDE] source mask present', !!payload.source_mask);
    console.log('[AI HORDE] source mask size', maskData.size);
    console.log('[AI HORDE] width', payload.params.width);
    console.log('[AI HORDE] height', payload.params.height);
    console.log('[AI HORDE] steps', payload.params.steps);
    console.log('[AI HORDE] sampler', payload.params.sampler_name);

    const submitRes = await fetch('https://stablehorde.net/api/v2/generate/async', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': '0000000000'
      },
      body: JSON.stringify(payload)
    });

    console.log('[AI HORDE] request status', submitRes.status);
    const submitData = await submitRes.json();
    console.log('[AI HORDE] request ID', submitData.id);
    console.log('[AI HORDE] warnings', submitData.warnings || []);

    if (submitData.warnings && submitData.warnings.length > 0) {
      const w = submitData.warnings[0];
      if (w.code === 'NoAvailableWorker') {
        throw new Error(`AI Horde Warning: ${w.message} - Please try again later or use a different model.`);
      }
    }

    if (!submitRes.ok) {
      throw new Error(`AI Horde API rejected request: ${submitData.message || 'Unknown error'}`);
    }

    const jobId = submitData.id;
    if (!jobId) {
      throw new Error('AI Horde did not return a job ID');
    }

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
    
    if (checkData.faulted) {
      return { status: 'failed', error: 'AI Horde job faulted or failed.' };
    }

    if (checkData.done) {
      const statusRes = await fetch(`https://stablehorde.net/api/v2/generate/status/${jobId}`);
      if (!statusRes.ok) throw new Error('Failed to retrieve AI Horde generation status');
      const statusData = await statusRes.json();
      
      if (!statusData.generations || statusData.generations.length === 0) {
        return { status: 'failed', error: 'RESULT_MISSING: AI Horde returned done but no generations were found.' };
      }
      
      const generatedBase64 = statusData.generations[0].img;
      const b64Data = generatedBase64.startsWith('http') 
        ? generatedBase64 
        : `data:image/webp;base64,${generatedBase64}`;
        
      try {
        const uploadResult = await cloudinary.uploader.upload(b64Data, {
          folder: 'studio/variations'
        });
        return {
          status: 'completed',
          secureUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          assetId: uploadResult.asset_id
        };
      } catch (uploadErr) {
        return { status: 'failed', error: 'AIHORDE_SUCCESS_CLOUDINARY_UPLOAD_FAILED: Cloudinary upload failed after generation.' };
      }
    }

    return { status: 'processing', queuePosition: checkData.queue_position };
  } catch (err) {
    return { status: 'processing', error: err.message };
  }
};

const generateImage = async () => { throw new Error('Deprecated'); };
module.exports = { generateImage, submitHordeJob, checkHordeJob };
