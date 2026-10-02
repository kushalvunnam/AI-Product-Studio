const fs = require('fs');

let cc = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');

cc = cc.replace(
`              } else if (camp.status === 'failed') {
                throw new Error('Generation failed on the server. Please try again.');
              }`,
`              } else if (camp.status === 'failed') {
                throw new Error(camp.errorMessage || 'Generation failed on the server. Please try again.');
              }`
);

fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', cc);
console.log('Fixed CreateCampaign.jsx error message');
