const generateOpenAIImage = async ({ prompt, referenceAsset }) => {
  throw new Error('PROVIDER_UNSUPPORTED_WORKFLOW: OpenAI DALL-E 2 edits require strict square PNGs under 4MB, which is incompatible with arbitrary product uploads. DALL-E 3 lacks inpainting completely.');
};

module.exports = { generateOpenAIImage };
