require('dotenv').config();
const { generateImage } = require('./cloudinaryGenerationService');

async function runTest() {
  try {
    const res = await generateImage({
      prompt: "A beautiful product in a cyberpunk setting",
      referenceAsset: {
        secureUrl: "https://res.cloudinary.com/eljwnjkq/image/upload/v1727878342/productstudio/cibnsw0ok7k35t6v1kty.jpg"
      },
      model: { mode: "auto", preference: "balanced" },
      settings: {}
    });
    console.log("Success:", res);
  } catch(e) {
    console.error("Test failed:", e);
  }
}

runTest();
