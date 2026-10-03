const express = require('express');
const router = express.Router();
const { generateCampaignImage, getModels } = require('../controllers/generationController');
const { generateCampaignVariations, getVariationStatus } = require('../controllers/variationController');

router.get('/models', getModels);
router.post('/generate', generateCampaignImage);
router.post('/variations', generateCampaignVariations);
router.get('/status/:jobId', getVariationStatus);

module.exports = router;
