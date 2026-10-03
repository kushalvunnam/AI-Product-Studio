const { routeGeneration } = require('./generationProviderService');
const { buildVariationPrompt, variationStrategies } = require('./promptBuilder');

// Simple chunking for concurrency limit
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const generateVariations = async ({ sourceImage, analysis, creativeBrief, model, count, onProgress }) => {
  const selectedStrategies = variationStrategies.slice(0, count);
  const variations = [];
  const failed = [];

  // Concurrency limit of 2
  const CONCURRENCY_LIMIT = 2;
  const chunks = chunkArray(selectedStrategies, CONCURRENCY_LIMIT);

  let completedCount = 0;

  for (const chunk of chunks) {
    const promises = chunk.map(async (strategy) => {
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
          secureUrl: asset.secureUrl,
          publicId: asset.publicId,
          assetId: asset.assetId || `gen_${Date.now()}`,
          width: asset.width || sourceImage.width,
          height: asset.height || sourceImage.height,
          format: asset.format || sourceImage.format,
          status: 'success'
        };
        variations.push(variation);
      } catch (error) {
        console.error(`Failed to generate variation ${strategy.name}:`, error);
        failed.push({
          variationType: strategy.id,
          variationName: strategy.name,
          error: error.message
        });
      } finally {
        completedCount++;
        if (onProgress) {
          await onProgress({
            completed: completedCount,
            total: selectedStrategies.length,
            variations,
            failed
          });
        }
      }
    });

    await Promise.all(promises);
  }

  return { variations, failed };
};

module.exports = {
  generateVariations
};
