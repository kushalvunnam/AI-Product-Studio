const { routeGeneration } = require('./generationProviderService');
const { buildVariationPrompt, variationStrategies } = require('./promptBuilder');

const generateVariations = async ({ sourceImage, analysis, creativeBrief, model, count, onProgress }) => {
  const selectedStrategies = variationStrategies.slice(0, count);
  const variations = [];
  const failed = [];

  // Drop chunking for AI Horde since it natively queues jobs and we need stateless polling.
  const promises = selectedStrategies.map(async (strategy) => {
    try {
      const prompt = buildVariationPrompt({ analysis, creativeBrief, variationType: strategy.id });
      
      const asset = await routeGeneration({
        prompt,
        referenceAsset: sourceImage,
        model,
        settings: {}
      });

      const variation = {
        id: `var_${strategy.id}_${Date.now()}`,
        variationType: strategy.id,
        variationName: strategy.name,
        promptUsed: prompt,
        modelUsed: model?.id,
        status: asset.isAsyncJob ? 'processing' : 'completed',
        providerJobId: asset.providerJobId,
        provider: asset.provider,
        secureUrl: asset.secureUrl,
        publicId: asset.publicId,
        assetId: asset.assetId || `gen_${Date.now()}`,
        width: asset.width || sourceImage.width,
        height: asset.height || sourceImage.height,
        format: asset.format || sourceImage.format,
        createdAt: new Date()
      };
      
      variations.push(variation);
    } catch (error) {
      console.error(`Failed to generate variation ${strategy.name}:`, error);
      failed.push({
        variationType: strategy.id,
        variationName: strategy.name,
        error: error.message
      });
    }
  });

  await Promise.all(promises);

  return { variations, failed };
};

module.exports = {
  generateVariations
};
