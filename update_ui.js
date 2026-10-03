const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');

// Replace badge
c = c.replace(
  `{!model.available && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium" title={model.description}>🔒 Not Configured</span>}`,
  `{!model.available ? <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium" title={model.description}>🔒 Not configured</span> : (model.freeTier && model.id !== 'auto' ? <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold">FREE Available</span> : null)}`
);

// Replace header
c = c.replace(
  `<h2 className="text-xl font-bold text-[#101828] flex items-center gap-2"><Layers className="w-5 h-5 text-primary" /> Cloudinary AI Generation</h2>`,
  `<div className="flex flex-col"><h2 className="text-xl font-bold text-[#101828] flex items-center gap-2"><Layers className="w-5 h-5 text-primary" /> AI Image Generation</h2><span className="text-sm text-slate-500 mt-1">Powered by {modelSettings.id === 'auto' ? 'Cloudinary' : (availableModels.find(m => m.id === modelSettings.id)?.provider === 'pollinations' ? 'Pollinations.ai (Free Open AI)' : (availableModels.find(m => m.id === modelSettings.id)?.provider || 'AI'))}</span></div>`
);

fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', c);
