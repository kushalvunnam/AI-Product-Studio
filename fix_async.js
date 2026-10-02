const fs = require('fs');

let backendContent = `const { generateVariations } = require('../services/variationService');
const Campaign = require('../models/Campaign');

const generateCampaignVariations = async (req, res) => {
  try {
    const { campaignId, sourceImage, analysis, creativeBrief, model, variationCount } = req.body;

    if (!sourceImage || !sourceImage.publicId) {
      return res.status(400).json({ success: false, message: 'Source image publicId is required.' });
    }

    const count = parseInt(variationCount, 10) || 4;
    
    if (campaignId) {
      // Async background generation
      generateVariations({
        sourceImage,
        analysis,
        creativeBrief,
        model: model || { mode: 'auto', preference: 'balanced' },
        count
      }).then(async (result) => {
        if (result.variations.length > 0) {
          await Campaign.findByIdAndUpdate(campaignId, { variations: result.variations, status: 'review' });
        } else {
          await Campaign.findByIdAndUpdate(campaignId, { status: 'failed' });
        }
      }).catch(async (err) => {
        console.error('Async generation failed:', err);
        await Campaign.findByIdAndUpdate(campaignId, { status: 'failed' });
      });

      return res.status(202).json({
        success: true,
        message: 'Generation started asynchronously.',
        isAsync: true
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

module.exports = {
  generateCampaignVariations
};`;

fs.writeFileSync('backend/controllers/variationController.js', backendContent);

// Also modify CreateCampaign.jsx to poll
let frontendContent = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');

frontendContent = frontendContent.replace(
  "const result = await generateCampaignVariations({ sourceImage, analysis, creativeBrief, model: modelSettings, variationCount });",
  "const result = await generateCampaignVariations({ campaignId, sourceImage, analysis, creativeBrief, model: modelSettings, variationCount });"
);

// Add getCampaignById to imports
if (!frontendContent.includes("getCampaignById")) {
  frontendContent = frontendContent.replace(
    "import { createCampaign, updateCampaign } from '../services/campaignService';",
    "import { createCampaign, updateCampaign, getCampaignById } from '../services/campaignService';"
  );
}

// Modify the startGeneration logic to poll if isAsync is true
const oldLogic = `      setGeneratedResult(result);
      
      // Auto-save variations
      if (campaignId) await updateCampaign(campaignId, { variations: result.variations, status: 'review' });
      
      setIsGenerating(false);`;

const newLogic = `      if (result.isAsync && campaignId) {
        // Poll for completion
        let isDone = false;
        let finalResult = null;
        while (!isDone) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          const camp = await getCampaignById(campaignId);
          if (camp.status === 'review' && camp.variations && camp.variations.length > 0) {
            isDone = true;
            finalResult = { success: true, variations: camp.variations };
          } else if (camp.status === 'failed') {
            throw new Error('Generation failed on the server. Please try again.');
          }
        }
        setGeneratedResult(finalResult);
      } else {
        setGeneratedResult(result);
        if (campaignId) await updateCampaign(campaignId, { variations: result.variations, status: 'review' });
      }
      setIsGenerating(false);`;

frontendContent = frontendContent.replace(oldLogic, newLogic);
fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', frontendContent);

