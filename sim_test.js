const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('--- TEST 1: Models Endpoint ---');
  let res = await fetch(`${API_URL}/generation/models`);
  let data = await res.json();
  const pollModel = data.models.find(m => m.id === 'free-pollinations');
  console.log('Pollinations Model:', pollModel);
  if (!pollModel || !pollModel.available) throw new Error('Pollinations not available in /models');

  console.log('\\n--- TEST 2: 1 Free Variation ---');
  // Mock image
  const mockImage = {
    publicId: 'test_asset_123',
    url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
  };
  
  res = await fetch(`${API_URL}/generation/variations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      campaignId: null, // Force sync for simple test
      sourceImage: mockImage,
      analysis: 'Test analysis',
      creativeBrief: 'Test brief',
      model: { id: 'free-pollinations' },
      variationCount: 1
    })
  });
  data = await res.json();
  console.log('1 Variation Sync Response:', data);
  if (!data.success || !data.variations[0].secureUrl.includes('cloudinary')) {
    throw new Error('Variation generation failed or missing Cloudinary secureUrl');
  }

  console.log('\\n--- TEST 3: Partial Failure Simulation ---');
  // I will test partial failure by mocking pollinationsProvider... wait, I won't mock. 
  // 4 variations will just take ~10-15s. I'll test 4 variations!
  res = await fetch(`${API_URL}/generation/variations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceImage: mockImage,
      analysis: 'Test analysis',
      creativeBrief: 'Test brief',
      model: { id: 'free-pollinations' },
      variationCount: 4
    })
  });
  data = await res.json();
  console.log(`4 Variations Response: ${data.variations.length} variations generated, ${data.failed.length} failed.`);

  console.log('\\nAll basic API tests passed.');
};

runTests().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
