const fetch = global.fetch || require('node-fetch');

const generateOpenAIImage = async ({ prompt, referenceAsset }) => {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
    },
    body: JSON.stringify({
      prompt,
      model: 'gpt-image-2',
      response_format: 'url'
    })
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || 'GPT Image API Error');
  }
  
  const result = await response.json();
  if (result.data && result.data.length > 0) {
    return { secureUrl: result.data[0].url };
  }
  
  throw new Error('No image returned from GPT');
};

module.exports = { generateOpenAIImage };
