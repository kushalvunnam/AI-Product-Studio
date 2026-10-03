const fs = require('fs');
let content = fs.readFileSync('backend/services/providers/aiHordeProvider.js', 'utf8');

// 1. Resize limit to 512x512
content = content.replace(
  "'/upload/c_limit,w_1024,h_1024/'",
  "'/upload/c_limit,w_512,h_512/'"
);

// 2. Remove zero-worker models, use the active ones discovered via API
content = content.replace(
  'const models = ["Deliberate Inpainting", "Realistic Vision Inpainting", "DreamShaper Inpainting", "Anything Diffusion Inpainting", "stable_diffusion_inpainting"];',
  'const models = ["Realistic Vision Inpainting", "DreamShaper Inpainting", "Anything Diffusion Inpainting", "Deliberate Inpainting"];'
);

// 3. Add HORDE request ID log
content = content.replace(
  "const jobId = submitData.id;",
  "const jobId = submitData.id;\n    console.log('[HORDE] request ID:', jobId);"
);

// 4. Add HORDE status log
content = content.replace(
  "return { status: 'processing', queuePosition: checkData.queue_position };",
  "console.log('[HORDE] status:', 'processing', '| queue_position:', checkData.queue_position);\n    return { status: 'processing', queuePosition: checkData.queue_position };"
);

// 5. Add HORDE generation completed & Cloudinary log
content = content.replace(
  "const generatedBase64 = statusData.generations[0].img;",
  "console.log('[HORDE] generation completed:', statusData.generations[0].id);\n      const generatedBase64 = statusData.generations[0].img;"
);

content = content.replace(
  "folder: 'studio/variations'\n        });",
  "folder: 'studio/variations'\n        });\n        console.log('[CLOUDINARY] secure_url:', uploadResult.secure_url);"
);

fs.writeFileSync('backend/services/providers/aiHordeProvider.js', content);
