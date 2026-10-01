const express = require('express');
const router = express.Router();
const { transformCampaignAssets } = require('../controllers/assetController');

// Accept an array of platforms to transform at once
router.post('/transform', transformCampaignAssets);

module.exports = router;
