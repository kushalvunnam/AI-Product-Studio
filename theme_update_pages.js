const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src', 'pages');
const files = ['Analytics.jsx', 'CampaignHistory.jsx', 'MyAssets.jsx', 'Templates.jsx', 'Settings.jsx'];

const replacements = [
  { from: /text-white/g, to: 'text-slate-800' },
  { from: /text-slate-300/g, to: 'text-slate-600' },
  { from: /text-slate-400/g, to: 'text-slate-500' },
  { from: /text-slate-200/g, to: 'text-slate-700' },
  { from: /bg-white\/5/g, to: 'bg-white shadow-sm' },
  { from: /bg-white\/10/g, to: 'bg-slate-50' },
  { from: /border-white\/10/g, to: 'border-slate-200' },
  { from: /border-white\/20/g, to: 'border-slate-300' },
  { from: /border-white\/5/g, to: 'border-slate-100' },
  { from: /bg-slate-800/g, to: 'bg-slate-100' },
  { from: /bg-slate-900\/50/g, to: 'bg-slate-50/50' },
  { from: /bg-surfaceSolid/g, to: 'bg-white' },
  { from: /bg-surface/g, to: 'bg-slate-50' },
  { from: /bg-black\/50/g, to: 'bg-slate-100' },
  { from: /bg-black\/80/g, to: 'bg-white/90' },
  { from: /glass-panel/g, to: 'glass-card' },
  { from: /shadow-neon/g, to: 'shadow-md' },
];

files.forEach(file => {
  const fPath = path.join(srcDir, file);
  if (fs.existsSync(fPath)) {
    let content = fs.readFileSync(fPath, 'utf8');
    
    replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });

    // Specific chart color overrides for Recharts in Analytics
    if (file === 'Analytics.jsx') {
      content = content.replace(/fill="rgba\(255,255,255,0\.1\)"/g, 'fill="rgba(0,0,0,0.05)"');
      content = content.replace(/stroke="rgba\(255,255,255,0\.1\)"/g, 'stroke="rgba(0,0,0,0.1)"');
      content = content.replace(/fill="#94a3b8"/g, 'fill="#64748b"'); // text-slate-400 to text-slate-500 for charts
    }
    
    fs.writeFileSync(fPath, content);
  }
});

console.log('Fixed Light Theme for remaining pages');
