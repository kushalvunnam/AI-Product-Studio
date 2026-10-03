const express = require('express');
const router = express.Router();
const { generateCampaignImage, getModels, getDiagnostics } = require('../controllers/generationController');
const { generateCampaignVariations, getVariationStatus } = require('../controllers/variationController');

router.get('/models', getModels);
router.get('/diagnostics', getDiagnostics);
router.post('/generate', generateCampaignImage);
router.post('/variations', generateCampaignVariations);
router.get('/status/:jobId', getVariationStatus);

module.exports = router;
