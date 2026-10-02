const fs = require('fs');

// 1. Campaigns.jsx
let campaigns = fs.readFileSync('frontend/src/pages/Campaigns.jsx', 'utf8');
// Add btn-primary to New Campaign button
campaigns = campaigns.replace(
  'className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-primary-500/20 transition-all hover:scale-105"',
  'className="btn-primary"'
);
// Make the container glass
campaigns = campaigns.replace(
  'className="bg-surface border border-slate-800 rounded-xl overflow-hidden shadow-xl"',
  'className="glass-panel overflow-hidden"'
);
// Status badges update
campaigns = campaigns.replace(
  /const getStatusBadge = .*?\};\s*return/s,
  `const getStatusBadge = (status) => {
    const colors = {
      completed: 'bg-primary-DEFAULT/10 text-primary-DEFAULT border-primary-DEFAULT/20 shadow-neon',
      failed: 'bg-red-500/10 text-red-400 border-red-500/20',
      generating: 'bg-secondary-cyan/10 text-secondary-cyan border-secondary-cyan/20 shadow-neon-cyan',
      review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      draft: 'bg-white/5 text-slate-300 border-white/10',
      analyzing: 'bg-secondary-cyan/10 text-secondary-cyan border-secondary-cyan/20'
    };
    return \`px-3 py-1 rounded-full text-xs font-bold border \${colors[status] || colors.draft}\`;
  };
  return`
);
// Table header
campaigns = campaigns.replace(
  'className="bg-slate-900/80 text-slate-400 text-sm font-medium border-b border-slate-800"',
  'className="bg-white/5 text-slate-300 text-sm font-bold border-b border-white/5 uppercase tracking-wider text-xs"'
);
// Inputs
campaigns = campaigns.replace(
  /className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"/g,
  'className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-primary-DEFAULT focus:ring-1 focus:ring-primary-DEFAULT outline-none transition-all"'
);
campaigns = campaigns.replace(
  /className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none appearance-none cursor-pointer"/g,
  'className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-primary-DEFAULT focus:ring-1 focus:ring-primary-DEFAULT outline-none appearance-none cursor-pointer"'
);
campaigns = campaigns.replace(
  'className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/50"',
  'className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5"'
);
fs.writeFileSync('frontend/src/pages/Campaigns.jsx', campaigns);

// 2. Templates.jsx
let templates = fs.readFileSync('frontend/src/pages/Templates.jsx', 'utf8');
templates = templates.replace(
  /className="bg-surface border border-slate-800 rounded-xl p-6 hover:border-primary-500\/50 transition-colors group flex flex-col"/g,
  'className="glass-card p-6 group flex flex-col cursor-pointer"'
);
templates = templates.replace(
  /className="w-12 h-12 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"/g,
  'className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-primary-DEFAULT/30 group-hover:shadow-neon transition-all"'
);
fs.writeFileSync('frontend/src/pages/Templates.jsx', templates);

// 3. Analytics.jsx
let analytics = fs.readFileSync('frontend/src/pages/Analytics.jsx', 'utf8');
analytics = analytics.replace(
  /className="bg-surface border border-slate-800 rounded-xl p-6 flex items-center gap-4"/g,
  'className="glass-card p-6 flex items-center gap-4 group hover:-translate-y-1"'
);
analytics = analytics.replace(
  /className={`w-12 h-12 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800 \${color}`}/g,
  'className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-${color.replace("text-", "")}/30 ${color} shadow-sm group-hover:shadow-neon transition-all`}'
);
analytics = analytics.replace(
  'className="bg-surface border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]"',
  'className="glass-panel p-8 flex flex-col items-center justify-center min-h-[300px]"'
);
fs.writeFileSync('frontend/src/pages/Analytics.jsx', analytics);

// 4. Settings.jsx
let settings = fs.readFileSync('frontend/src/pages/Settings.jsx', 'utf8');
settings = settings.replace(
  /className="bg-surface border border-slate-800 rounded-xl overflow-hidden shadow-xl mb-8"/g,
  'className="glass-panel overflow-hidden mb-8"'
);
settings = settings.replace(
  /className="bg-surface border border-slate-800 rounded-xl overflow-hidden shadow-xl"/g,
  'className="glass-panel overflow-hidden"'
);
settings = settings.replace(
  /className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"/g,
  'className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary-DEFAULT focus:ring-1 focus:ring-primary-DEFAULT outline-none shadow-inner"'
);
settings = settings.replace(
  /className="w-full bg-slate-900\/50 border border-slate-800 rounded-lg px-4 py-2 text-slate-200"/g,
  'className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-slate-200"'
);
settings = settings.replace(
  /className="w-full bg-slate-900\/50 border border-slate-800 rounded-lg px-4 py-2 text-slate-500 flex items-center gap-2 cursor-not-allowed"/g,
  'className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-slate-500 flex items-center gap-2 cursor-not-allowed"'
);
settings = settings.replace(
  /className="p-4 border-t border-slate-800 bg-slate-900\/50 flex justify-end gap-4"/g,
  'className="p-4 border-t border-white/5 bg-white/5 flex justify-end gap-4"'
);
settings = settings.replace(
  /className="p-6 border-b border-slate-800"/g,
  'className="p-6 border-b border-white/5 bg-white/5"'
);
settings = settings.replace(
  /className="w-20 h-20 rounded-full bg-slate-800 border-2 border-primary-500\/30 flex items-center justify-center text-2xl font-bold text-primary-400 uppercase"/g,
  'className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-DEFAULT to-secondary-cyan flex items-center justify-center text-3xl font-bold text-slate-950 uppercase shadow-neon"'
);
settings = settings.replace(
  'className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"',
  'className="btn-primary py-2 flex items-center gap-2"'
);
settings = settings.replace(
  'className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"',
  'className="btn-secondary py-2"'
);
fs.writeFileSync('frontend/src/pages/Settings.jsx', settings);

console.log('Processed pages UI');
