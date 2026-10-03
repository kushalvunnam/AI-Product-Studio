const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');
c = c.replace(
  "const [modelSettings, setModelSettings] = useState({ mode: 'auto', preference: 'balanced', id: 'auto' });",
  "const [modelSettings, setModelSettings] = useState({ mode: 'auto', preference: 'balanced', id: 'auto' });\n    const [availableModels, setAvailableModels] = useState([]);"
);
fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', c);
