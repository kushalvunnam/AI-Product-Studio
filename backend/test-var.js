require('dotenv').config();
const { generateImage } = require('./services/cloudinaryGenerationService');

(async () => {
  try {
    const res = await generateImage({
      prompt: "make it cyber punk",
      referenceAsset: { secureUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/shoe.jpg", publicId: "test1234" },
      model: { id: "auto" },
      settings: {}
    });
    console.log(res);
  } catch (e) {
    console.error("ACTUAL ERROR:", e.message);
  }
})();
