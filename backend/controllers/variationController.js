const { generateVariations } = require('../services/variationService');
const { getConfiguredModels } = require('../services/generationProviderService');
const Campaign = require('../models/Campaign');

const generateCampaignVariations = async (req, res) => {
  try {
    const { campaignId, sourceImage, analysis, creativeBrief, model, variationCount } = req.body;

    if (!sourceImage || !sourceImage.publicId) {
      return res.status(400).json({ success: false, message: 'Source image publicId is required.' });
    }

    const count = parseInt(variationCount, 10) || 4;
    
    // Synchronous validation of model availability
    const resolvedModelId = model?.id || 'auto';
    const availableModels = getConfiguredModels();
    const modelConfig = availableModels.find(m => m.id === resolvedModelId) || availableModels.find(m => m.id === 'auto');
    
    if (!modelConfig || !modelConfig.available) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_API_KEY',
          provider: modelConfig?.provider || 'unknown'
        },
        message: `${modelConfig?.provider ? modelConfig.provider.charAt(0).toUpperCase() + modelConfig.provider.slice(1) : 'Requested'} generation is not configured on this server.`
      });
    }

    if (campaignId) {
      // Async background generation
      
      // We set status to 'generating' initially so frontend knows it started
      await Campaign.findByIdAndUpdate(campaignId, { status: 'generating', errorMessage: '' });

      generateVariations({
        sourceImage,
        analysis,
        creativeBrief,
        model: model || { mode: 'auto', preference: 'balanced' },
        count,
        onProgress: async (progressInfo) => {
          // Update DB with partial variations to reflect progress
          await Campaign.findByIdAndUpdate(campaignId, {
            variations: progressInfo.variations
          });
        }
      }).then(async (result) => {
        if (result.variations.length > 0) {
          // Complete with partial or full success
          await Campaign.findByIdAndUpdate(campaignId, { variations: result.variations, status: 'review' });
        } else {
          // Complete failure
          const errMsg = result.failed && result.failed.length > 0 ? result.failed[0].error : 'All variations failed to generate.';
          await Campaign.findByIdAndUpdate(campaignId, { status: 'failed', errorMessage: errMsg });
        }
      }).catch(async (err) => {
        console.error('Async generation failed:', err);
        await Campaign.findByIdAndUpdate(campaignId, { status: 'failed', errorMessage: err.message || 'Generation failed on the server.' });
      });

      return res.status(202).json({
        success: true,
        message: 'Generation started asynchronously.',
        isAsync: true,
        jobId: campaignId
      });
    }

    // Fallback synchronous generation
    const { variations, failed } = await generateVariations({
      sourceImage,
      analysis,
      creativeBrief,
      model: model || { mode: 'auto', preference: 'balanced' },
      count
    });

    if (variations.length === 0) {
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

    // A variation request typically expects 4 by default or what we configured. 
    // We assume 4 here for the frontend calculation, or use the generated array length + pending.
    // However, the frontend just needs completed & total. We don't save total variations target in DB right now explicitly as a count.
    // We'll estimate total = 4.
    const total = 4;
    const completedVariations = campaign.variations ? campaign.variations.length : 0;
    
    let status = 'processing';
    if (campaign.status === 'review') status = 'completed';
    if (campaign.status === 'failed') status = 'failed';
    if (campaign.status === 'completed') status = 'completed';
    if (status === 'completed' && completedVariations < total) status = 'partial'; // Actually 'review' is standard successful status
    
    return res.status(200).json({
      success: true,
      status: campaign.status, // We map draft/analyzing/generating/review/failed to processing/completed/failed in the controller response
      mappedStatus: status, 
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