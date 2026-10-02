const express = require('express');
const router = express.Router();
const { generateCampaignImage } = require('../controllers/generationController');
const { generateCampaignVariations, getVariationStatus } = require('../controllers/variationController');

router.post('/generate', generateCampaignImage);
router.post('/variations', generateCampaignVariations);
router.get('/status/:jobId', getVariationStatus);

module.exports = router;
