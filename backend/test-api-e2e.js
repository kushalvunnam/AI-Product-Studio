require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const Campaign = require('./models/Campaign');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // 1. Create a mock campaign
  const campaign = await Campaign.create({
    name: 'E2E Test Campaign',
    status: 'draft',
    sourceImage: {
      publicId: 'test_product',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      mask: {
        publicId: 'test_mask',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
      }
    }
  });
  console.log('Created Campaign:', campaign._id);

  // 2. Hit the local backend API directly
  console.log('Sending generation request...');
  const res = await fetch('http://localhost:5000/api/generation/variations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      campaignId: campaign._id,
      analysis: { description: 'test' },
      creativeBrief: { campaignName: 'test' },
      model: { id: 'aihorde', mode: 'auto' },
      variationCount: 1
    })
  });
  
  const data = await res.json();
  console.log('Generation Response:', JSON.stringify(data, null, 2));
  
  if (!data.success || !data.isAsync) {
    console.error('Failed to submit!');
    process.exit(1);
  }

  // 3. Poll status
  let done = false;
  let checks = 0;
  while (!done && checks < 30) {
    await new Promise(r => setTimeout(r, 10000));
    checks++;
    const statusRes = await fetch(`http://localhost:5000/api/generation/status/${campaign._id}`);
    const statusData = await statusRes.json();
    console.log(`[Poll ${checks}] Status:`, statusData.status, statusData.mappedStatus);
    
    if (statusData.status === 'completed' || statusData.status === 'failed') {
      console.log('FINAL CAMPAIGN DATA:', JSON.stringify(statusData, null, 2));
      done = true;
    }
  }

  mongoose.disconnect();
}
run();
