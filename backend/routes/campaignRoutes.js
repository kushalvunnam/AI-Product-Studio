const express = require('express');
const router = express.Router();
const {
  createCampaign,
  updateCampaign,
  getCampaigns,
  getCampaignById,
  deleteCampaign
} = require('../controllers/campaignController');

router.post('/', createCampaign);
router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

module.exports = router;
