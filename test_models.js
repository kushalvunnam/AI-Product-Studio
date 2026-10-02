const fetch = global.fetch;

async function testModels() {
  const models = [
    { name: 'Auto', id: 'auto', mode: 'auto' },
    { name: 'Nano Banana 2', id: 'nano-banana-2-edit' },
    { name: 'FLUX 2 Pro', id: 'flux-2-pro-edit' },
    { name: 'GPT Image 2', id: 'gpt-image-2-edit' }
  ];

  const payloadBase = {
    sourceImage: { secureUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg", publicId: 'sample' },
    analysis: { productType: "sample" },
    creativeBrief: { campaignName: "Test Campaign", visualStyle: "Minimal" },
    variationCount: 1
  };

  for (const m of models) {
    console.log(`\nTesting Model: ${m.name} (${m.id})`);
    
    const response = await fetch('http://localhost:5000/api/generation/variations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payloadBase, model: m })
    });
    
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch(e) {
        console.error('Invalid JSON response:', text);
        continue;
    }

    console.log(`Status: ${response.status}`);
    
    if (response.ok && data.success) {
      console.log(`Success! URL: ${data.variations[0]?.secureUrl}`);
    } else {
      console.log(`Failed! Error: ${data.message || data.failed?.[0]?.error}`);
    }
  }
}

testModels();
