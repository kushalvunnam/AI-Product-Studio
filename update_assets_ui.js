const fs = require('fs');

let assets = fs.readFileSync('frontend/src/pages/Assets.jsx', 'utf8');

// Replace standard non-glass classes
assets = assets.replace(
  /className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 focus:ring-primary-500 focus:border-primary-500 outline-none"/g,
  'className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-1.5 focus:ring-primary-DEFAULT focus:border-primary-DEFAULT outline-none"'
);
assets = assets.replace(
  /className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:ring-primary-500 focus:border-primary-500 outline-none"/g,
  'className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:ring-primary-DEFAULT focus:border-primary-DEFAULT outline-none"'
);
assets = assets.replace(
  /className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 group hover:border-primary-500\/50 transition-colors flex flex-col h-full"/g,
  'className="glass-card flex flex-col h-full group"'
);
assets = assets.replace(
  /className="p-3 bg-surface border-t border-slate-800 flex flex-col flex-grow justify-between gap-2"/g,
  'className="p-3 bg-white/5 border-t border-white/5 flex flex-col flex-grow justify-between gap-2"'
);
assets = assets.replace(
  /className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-500"/g,
  'className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-500 shadow-inner"'
);

fs.writeFileSync('frontend/src/pages/Assets.jsx', assets);
console.log('Fixed Assets.jsx UI');
