require('dotenv').config({ path: '.env' });
const { submitHordeJob, checkHordeJob } = require('./services/providers/aiHordeProvider.js');
async function run() {
  try {
    console.log('Starting AI Horde End-to-End Test (with Cloudinary)...');
    const job = await submitHordeJob({
      prompt: 'A blue square product, photorealistic',
      referenceAsset: {
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        mask: { secureUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' }
      },
      count: 1
    });
    console.log('Request ID:', job.providerJobId);
    let done = false;
    let checks = 0;
    let finalState = null;
    while(!done && checks < 10) { 
      await new Promise(r => setTimeout(r, 10000));
      checks++;
      const res = await checkHordeJob(job.providerJobId);
      console.log(`[Check ${checks}] Status:`, res.status, res.queuePosition || res.error || '');
      if (res.status === 'completed' || res.status === 'failed') {
        done = true;
        finalState = res;
      }
    }
    console.log('FINAL RESULT:', JSON.stringify(finalState, null, 2));
  } catch (err) {
    console.error('Test failed with error:', err);
  }
}
run();
