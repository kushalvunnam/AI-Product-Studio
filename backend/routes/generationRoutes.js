const express = require('express');
const router = express.Router();
const { generateCampaignImage } = require('../controllers/generationController');
const { generateCampaignVariations } = require('../controllers/variationController');

router.post('/generate', generateCampaignImage);
router.post('/variations', generateCampaignVariations);

module.exports = router;
