const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Untitled Campaign'
  },
  status: {
    type: String,
    enum: ['draft', 'analyzing', 'generating', 'review', 'transforming', 'completed', 'failed'],
    default: 'draft'
  },
  errorMessage: {
    type: String
  },
  sourceImage: {
    assetId: String,
    publicId: String,
    secureUrl: String,
    format: String,
    width: Number,
    height: Number,
    bytes: Number,
    originalFilename: String
  },
  analysis: {
    productName: String,
    category: String,
    description: String,
    dominantColors: [String],
    materials: [String],
    visualStyle: String,
    targetAudience: String,
    marketingKeywords: [String],
    composition: String
  },
  creativeBrief: {
    campaignName: String,
    objective: String,
    visualStyle: String,
    mood: String,
    background: String,
    targetAudience: String,
    marketingMessage: String
  },
  model: {
    mode: String,
    preference: String,
    id: String
  },
  variations: [{
    id: String,
    variationType: String,
    variationName: String,
    secureUrl: String,
    assetId: String,
    publicId: String,
    modelUsed: String,
    promptUsed: String,
    status: {
      type: String,
      default: 'success'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  selectedVariation: {
    id: String,
    assetId: String,
    secureUrl: String,
    publicId: String
  },
  marketingAssets: [{
    id: String,
    platform: String,
    platformName: String,
    secureUrl: String,
    publicId: String,
    sourcePublicId: String,
    width: Number,
    height: Number,
    format: String,
    status: {
      type: String,
      default: 'ready'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', CampaignSchema);
