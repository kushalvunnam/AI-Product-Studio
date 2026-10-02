const fs = require('fs');

let cc = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');

// Container Panels
cc = cc.replace(
  /className="bg-surface border border-slate-800 rounded-xl/g,
  'className="glass-panel'
);
cc = cc.replace(
  /className="bg-surface p-6 rounded-xl border border-slate-700/g,
  'className="glass-panel p-6'
);
cc = cc.replace(
  /className="bg-surface p-6 rounded-xl border border-slate-800/g,
  'className="glass-panel p-6'
);
cc = cc.replace(
  /className="bg-surface border border-slate-700 rounded-xl/g,
  'className="glass-panel'
);

// Inner Cards / Elements
cc = cc.replace(
  /bg-slate-900/g,
  'bg-white/5'
);
cc = cc.replace(
  /border-slate-700/g,
  'border-white/10'
);
cc = cc.replace(
  /border-slate-800/g,
  'border-white/5'
);
cc = cc.replace(
  /border-primary-500\/50/g,
  'border-primary-DEFAULT/50 shadow-neon'
);
cc = cc.replace(
  /border-primary-500\/30/g,
  'border-primary-DEFAULT/30 shadow-neon'
);
cc = cc.replace(
  /bg-primary-500\/10/g,
  'bg-primary-DEFAULT/10'
);
cc = cc.replace(
  /bg-primary-500/g,
  'bg-primary-DEFAULT'
);
cc = cc.replace(
  /text-primary-500/g,
  'text-primary-DEFAULT'
);
cc = cc.replace(
  /text-primary-400/g,
  'text-primary-DEFAULT'
);
cc = cc.replace(
  /text-primary-300/g,
  'text-primary-DEFAULT'
);
cc = cc.replace(
  /bg-primary-600 hover:bg-primary-500 text-white/g,
  'btn-primary text-slate-950'
);
cc = cc.replace(
  /bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 text-white/g,
  'btn-primary text-slate-950'
);

// Progress Bar
cc = cc.replace(
  /bg-primary-600 text-white/g,
  'bg-primary-DEFAULT text-slate-950 shadow-neon'
);

fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', cc);

console.log('Fixed CreateCampaign UI');
