const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');

// Replace imports
c = c.replace(
  "import { uploadProductImage, analyzeProductImage, generateCampaignVariations, getGenerationStatus } from '../services/api';",
  "import { uploadProductImage, analyzeProductImage, generateCampaignVariations, getGenerationStatus, getConfiguredModels } from '../services/api';"
);

// Remove IMAGE_EDIT_MODELS
c = c.replace(/const IMAGE_EDIT_MODELS = \{[\s\S]*?\};\nconst generationModels = Object\.values\(IMAGE_EDIT_MODELS\);/, '');

// Add availableModels state
c = c.replace(
  "const [modelSettings, setModelSettings] = useState({ id: 'auto', mode: 'auto', preference: 'balanced' });",
  "const [modelSettings, setModelSettings] = useState({ id: 'auto', mode: 'auto', preference: 'balanced' });\n  const [availableModels, setAvailableModels] = useState([]);"
);

// Fetch models on mount
c = c.replace(
  "const togglePlatform = (key) => {",
  `useEffect(() => {
    getConfiguredModels().then(models => {
      if (models && models.length > 0) setAvailableModels(models);
      else setAvailableModels([{ id: 'auto', label: 'Auto — Recommended', provider: 'cloudinary', description: 'Recommended for most campaigns', available: true }]);
    });
  }, []);

  const togglePlatform = (key) => {`
);

// Update model rendering loop
c = c.replace(
  "generationModels.map(model => (",
  "availableModels.map(model => ("
);

// Add disabled class and badge to rendered models
c = c.replace(
  `onChange={() => setModelSettings(prev => ({...prev, id: model.id, mode: model.id === 'auto' ? 'auto' : 'specific'}))} className="mt-0.5 w-4 h-4 text-primary-600 focus:ring-primary-500 bg-slate-100 border-slate-200" />`,
  `onChange={() => setModelSettings(prev => ({...prev, id: model.id, mode: model.id === 'auto' ? 'auto' : 'specific'}))} disabled={!model.available} className="mt-0.5 w-4 h-4 text-primary-600 focus:ring-primary-500 bg-slate-100 border-slate-200" />`
);

c = c.replace(
  `<span className={\`text-sm font-bold \${modelSettings.id === model.id ? 'text-primary' : 'text-[#172033]'}\`}>{model.name}</span>`,
  `<div className="flex items-center gap-2"><span className={\`text-sm font-bold \${modelSettings.id === model.id ? 'text-primary' : 'text-[#172033]'}\`}>{model.label}</span>{!model.available && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium" title={model.description}>🔒 Not Configured</span>}</div><span className="text-xs text-[#6B7A90] mt-0.5">{model.description}</span>`
);

c = c.replace(
  `className={\`flex items-start p-3 rounded-lg border cursor-pointer transition-colors \${modelSettings.id === model.id ? 'bg-primary/10 border-primary/50 shadow-md' : 'bg-white shadow-sm border-slate-200 hover:border-slate-500'}\`}`,
  `className={\`flex items-start p-3 rounded-lg border transition-colors \${!model.available ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer'} \${modelSettings.id === model.id ? 'bg-primary/10 border-primary/50 shadow-md' : (!model.available ? 'border-slate-200' : 'bg-white shadow-sm border-slate-200 hover:border-slate-500')}\`}`
);

fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', c);
