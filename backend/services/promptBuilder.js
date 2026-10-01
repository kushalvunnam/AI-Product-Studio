const variationStrategies = [
  { id: "studio", name: "Premium Studio", description: "Clean commercial product photography in a professional studio" },
  { id: "lifestyle", name: "Lifestyle", description: "Product shown in a realistic lifestyle environment" },
  { id: "dramatic", name: "Dramatic", description: "High-impact commercial lighting with dramatic shadows" },
  { id: "minimal", name: "Minimal", description: "Clean modern minimal composition with ample whitespace" },
  { id: "nature", name: "Nature", description: "Natural outdoor environment with organic elements" },
  { id: "urban", name: "Urban", description: "Edgy urban city environment" },
  { id: "luxury", name: "Luxury Interior", description: "High-end luxury interior setting" },
  { id: "futuristic", name: "Futuristic", description: "Sleek futuristic sci-fi environment" }
];

/**
 * Builds a comprehensive image generation prompt using AI Vision analysis and the user's creative brief.
 */
const buildGenerationPrompt = ({ analysis, creativeBrief }) => {
  const { dominantColors, materials } = analysis || {};
  const { objective, visualStyle: briefStyle, mood, background, targetAudience } = creativeBrief || {};

  const colorsStr = dominantColors && dominantColors.length > 0 ? `incorporating colors like ${dominantColors.join(', ')}` : '';
  const materialsStr = materials && materials.length > 0 ? `highlighting ${materials.join(', ')} textures` : '';
  
  const promptParts = [
    background !== 'Custom' ? `A high-quality professional ${background?.toLowerCase()} background setting` : 'A professional studio environment',
    `with a ${mood?.toLowerCase()} and ${briefStyle?.toLowerCase()} mood`,
    objective ? `perfect for a ${objective?.toLowerCase()} marketing campaign` : '',
    targetAudience ? `appealing to ${targetAudience}` : '',
    colorsStr,
    materialsStr,
    `commercial product photography lighting, photorealistic`
  ];

  const prompt = promptParts.filter(part => part && part.trim() !== '').join(', ');
  return prompt.substring(0, 1000); 
};

/**
 * Builds a specific prompt for a variation type.
 */
const buildVariationPrompt = ({ analysis, creativeBrief, variationType }) => {
  const strategy = variationStrategies.find(s => s.id === variationType) || variationStrategies[0];
  
  const { dominantColors, materials } = analysis || {};
  const { objective, targetAudience, visualStyle } = creativeBrief || {};

  const colorsStr = dominantColors && dominantColors.length > 0 ? `using colors like ${dominantColors.join(', ')}` : '';
  
  const promptParts = [
    strategy.description,
    `with a ${visualStyle?.toLowerCase()} aesthetic`,
    objective ? `designed for ${objective?.toLowerCase()}` : '',
    colorsStr,
    `8k resolution, highly detailed`
  ];

  const prompt = promptParts.filter(part => part && part.trim() !== '').join(', ');
  return prompt.substring(0, 1000);
};

module.exports = {
  buildGenerationPrompt,
  buildVariationPrompt,
  variationStrategies
};
