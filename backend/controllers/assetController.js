const { transformImage } = require('../services/cloudinaryService');

const transformCampaignAssets = async (req, res) => {
  try {
    const { publicId, platforms } = req.body;

    if (!publicId) {
      return res.status(400).json({ success: false, message: 'Source asset publicId is required.' });
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one platform must be specified.' });
    }

    const promises = platforms.map(platform => transformImage({ publicId, platform }));
    const results = await Promise.allSettled(promises);

    const transformedAssets = [];
    const failed = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        transformedAssets.push({
          id: `trans_${platforms[index]}_${Date.now()}`,
          sourcePublicId: publicId,
          platform: result.value.platform,
          platformName: result.value.platformName,
          secureUrl: result.value.secureUrl,
          width: result.value.width,
          height: result.value.height,
          format: result.value.format,
          createdAt: new Date().toISOString()
        });
      } else {
        failed.push({
          platform: platforms[index],
          error: result.reason.message
        });
      }
    });

    if (transformedAssets.length === 0) {
      return res.status(500).json({ 
        success: false, 
        message: 'All transformations failed.',
        failed
      });
    }

    return res.status(200).json({
      success: true,
      assets: transformedAssets,
      failed
    });

  } catch (error) {
    console.error('Asset Controller Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Asset transformation failed.' 
    });
  }
};

module.exports = {
  transformCampaignAssets
};
