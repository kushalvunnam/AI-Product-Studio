const generationModels = [
  { id: "auto", name: "Auto (Recommended)", description: "Cloudinary automatically selects the best model for your prompt.", useCase: "General purpose" },
  { id: "nano-banana-2", name: "Nano Banana 2", description: "Fast, creative generations.", useCase: "Creative variations" },
  { id: "flux-2-pro", name: "FLUX 2 Pro", description: "Photorealistic product imagery.", useCase: "Product photography" },
  { id: "gpt-image-2", name: "GPT Image 2", description: "High-quality general purpose model.", useCase: "General purpose" },
  { id: "ideogram-v4-base", name: "Ideogram v4 Base", description: "Excellent layout and text rendering.", useCase: "Typography & Layouts" },
  { id: "recraft-v4", name: "Recraft v4", description: "Clean vector and illustration styles.", useCase: "Illustration" }
];

module.exports = generationModels;
