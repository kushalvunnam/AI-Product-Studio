const Campaign = require('../models/Campaign');

// Create a new campaign
const createCampaign = async (req, res) => {
  try {
    const campaign = new Campaign(req.body);
    await campaign.save();
    return res.status(201).json({ success: true, campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ success: false, message: 'Failed to create campaign' });
  }
};

// Update an existing campaign
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    
    return res.status(200).json({ success: true, campaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return res.status(500).json({ success: false, message: 'Failed to update campaign' });
  }
};

// Get all campaigns
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch campaigns' });
  }
};

// Get campaign by ID
const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    
    return res.status(200).json({ success: true, campaign });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch campaign details' });
  }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByIdAndDelete(id);
    
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    
    return res.status(200).json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete campaign' });
  }
};

module.exports = {
  createCampaign,
  updateCampaign,
  getCampaigns,
  getCampaignById,
  deleteCampaign
};
