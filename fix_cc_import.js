const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');

content = content.replace(/import \{ useEffect \} from 'react';/g, '');

fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', content);
console.log('Fixed CreateCampaign.jsx inline import');
