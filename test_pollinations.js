require('dotenv').config({ path: 'backend/.env' });
const { generateImage } = require('./backend/services/providers/pollinationsProvider');

const test = async () => {
  try {
    const res = await generateImage({
      prompt: 'A red apple on a wooden table',
      referenceAsset: null,
      model: 'free-pollinations'
    });
    console.log('SUCCESS:', res);
  } catch (err) {
    console.error('FAILED:', err);
  }
};
test();
