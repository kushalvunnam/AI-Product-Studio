const { generateVariations } = require('../services/variationService');
const { getConfiguredModels } = require('../services/generationProviderService');
const Campaign = require('../models/Campaign');
const { checkHordeJob } = require('../services/providers/aiHordeProvider');

const generateCampaignVariations = async (req, res) => {
  try {
    let { campaignId, sourceImage, analysis, creativeBrief, model, variationCount } = req.body;
    
    console.log('[API /variations] received source image reference:', sourceImage ? 'Yes' : 'No');

    if (campaignId) {
      const campaign = await Campaign.findById(campaignId);
      if (campaign && campaign.sourceImage) {
         sourceImage = campaign.sourceImage;
      }
    }

    if (!sourceImage || !sourceImage.publicId || (!sourceImage.secure_url && !sourceImage.secureUrl && !sourceImage.url)) {
      return res.status(400).json({ 
        success: false, 
        code: 'SOURCE_IMAGE_MISSING',
        message: 'Source image is missing. Please return to Upload Product and upload the image again.' 
      });
    }

    if (sourceImage.mask) {
      if (!sourceImage.mask.publicId || (!sourceImage.mask.secure_url && !sourceImage.mask.secureUrl && !sourceImage.mask.url)) {
        console.warn('[MASK] Invalid mask object found attached to sourceImage');
      } else {
        console.log('[GENERATE] mask reference validated', sourceImage.mask.publicId);
      }
    }

    const count = parseInt(variationCount, 10) || 4;
    
    // Synchronous validation of model availability
    const resolvedModelId = model?.id || 'auto';
    const availableModels = await getConfiguredModels();
    const modelConfig = availableModels.find(m => m.id === resolvedModelId) || availableModels.find(m => m.id === 'auto');
    
    if (!modelConfig || !modelConfig.available) {
      return res.status(400).json({
        success: false,
        error: {
          code: !modelConfig?.configured ? 'MISSING_API_KEY' : 'MODEL_NOT_AVAILABLE',
          provider: modelConfig?.provider || 'unknown'
        },
        message: modelConfig?.reason || `${modelConfig?.provider ? modelConfig.provider.charAt(0).toUpperCase() + modelConfig.provider.slice(1) : 'Requested'} generation is not configured on this server.`
      });
    }

    // Synchronous generation start (stateless, so we await submitting to Horde)
    const { variations, failed } = await generateVariations({
      sourceImage,
      analysis,
      creativeBrief,
      model: model || { mode: 'auto', preference: 'balanced' },
      count
    });

    const hasProcessing = variations.some(v => v.status === 'processing');
    const hasCompleted = variations.some(v => v.status === 'completed');
    const allFailed = variations.length === 0 && failed.length > 0;
    
    if (campaignId) {
      let nextStatus = 'generating';
      let errorMessage = '';
      
      if (allFailed) {
        nextStatus = 'failed';
        errorMessage = failed[0].error || 'All variations failed to submit.';
      } else if (!hasProcessing && hasCompleted) {
        nextStatus = 'review';
      }
      
      // If variations already exist (e.g. retry), we append the new ones or replace?
      // Typically, missing variations are requested and appended. We'll append them.
      const campaign = await Campaign.findById(campaignId);
      const newVariations = [...(campaign.variations || []), ...variations];

      await Campaign.findByIdAndUpdate(campaignId, { 
        status: nextStatus,
        errorMessage,
        variations: newVariations
      });

      if (hasProcessing) {
        return res.status(202).json({
          success: true,
          message: 'Generation submitted to queue asynchronously.',
          isAsync: true,
          jobId: campaignId
        });
      }
    }

    if (allFailed) {
      return res.status(500).json({ 
        success: false, 
        message: 'All variations failed to generate. Please try again.',
        failed
      });
    }

    return res.status(200).json({
      success: true,
      variations,
      failed
    });

  } catch (error) {
    console.error('Variation Controller Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Variation generation failed.' 
    });
  }
};

const getVariationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const campaign = await Campaign.findById(jobId);
    
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Job/Campaign not found' });
    }

    let hasUpdates = false;
    let anyProcessing = false;

    // Check statuses statelessly
    if (campaign.variations && campaign.variations.length > 0) {
      for (let i = 0; i < campaign.variations.length; i++) {
        const v = campaign.variations[i];
        if (v.status === 'processing' && v.providerJobId && v.provider === 'aihorde') {
          // Check timestamp for 10 min timeout (600,000ms)
          const ageMs = Date.now() - new Date(v.createdAt).getTime();
          if (ageMs > 600000) {
             v.status = 'timeout';
             v.error = 'Job timed out after 10 minutes.';
             v.updatedAt = new Date();
             hasUpdates = true;
             continue;
          }

          const statusRes = await checkHordeJob(v.providerJobId);
          if (statusRes.status !== 'processing' || statusRes.secureUrl) {
            v.status = statusRes.status;
            v.error = statusRes.error;
            v.updatedAt = new Date();
            
            if (statusRes.secureUrl) {
              v.secureUrl = statusRes.secureUrl;
              v.publicId = statusRes.publicId;
              v.assetId = statusRes.assetId;
            }
            if (v.status === 'completed' || v.status === 'failed') {
               v.completedAt = new Date();
            }
            hasUpdates = true;
          } else {
             anyProcessing = true;
          }
        }
      }
      
      if (hasUpdates) {
        const hasCompleted = campaign.variations.some(v => v.status === 'completed');
        if (!anyProcessing) {
           campaign.status = hasCompleted ? 'review' : 'failed';
        }
        await campaign.save();
      }
    }

    const total = 4; // Expected limit in UI
    const completedVariations = campaign.variations ? campaign.variations.filter(v => v.status === 'completed').length : 0;
    
    let mappedStatus = campaign.status;
    if (campaign.status === 'review') mappedStatus = 'completed';
    if (mappedStatus === 'completed' && completedVariations < total) mappedStatus = 'partial'; 
    
    return res.status(200).json({
      success: true,
      status: campaign.status, 
      mappedStatus, 
      completed: completedVariations,
      total: total,
      variations: campaign.variations || [],
      error: campaign.errorMessage || null
    });
    
  } catch (error) {
    console.error('Status fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch status' });
  }
};

module.exports = {
  generateCampaignVariations,
  getVariationStatus
};