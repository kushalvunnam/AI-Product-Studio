require('dotenv').config();

(async () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  const endpoint = `https://api.cloudinary.com/v2/generate/${cloudName}/image_to_image`;

  const typesToTest = ["url", "image_url", "managed_asset", "public_id", "image_id"];

  for (const type of typesToTest) {
    let payload = {
      prompt: "cyber punk",
      reference_images: [{ source: { source_type: type } }]
    };

    if (type === "url" || type === "image_url") {
      payload.reference_images[0].source.url = "https://res.cloudinary.com/demo/image/upload/v1312461204/shoe.jpg";
    } else if (type === "managed_asset" || type === "image_id") {
      payload.reference_images[0].source.asset_id = "test1234";
    } else if (type === "public_id") {
      payload.reference_images[0].source.public_id = "test1234";
    }

    console.log("Testing:", type);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    if (!response.ok) {
      console.log("Error for", type, ":", data.error?.message || data);
    } else {
      console.log("Success for", type, "!");
      break;
    }
  }
})();
