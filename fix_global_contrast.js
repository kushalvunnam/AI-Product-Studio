const fs = require('fs');
const path = require('path');

function processFile(f) {
  let content = fs.readFileSync(f, 'utf8');
  
  // Replace low-opacity / faint text
  content = content.replace(/text-slate-400/g, 'text-[#6B7A90]'); // Muted text
  content = content.replace(/placeholder:text-slate-400/g, 'placeholder:text-[#667085]');
  content = content.replace(/text-slate-500/g, 'text-[#52627A]'); // Secondary text
  content = content.replace(/text-slate-600/g, 'text-[#52627A]');
  content = content.replace(/text-slate-300/g, 'text-[#6B7A90]'); // Leftover dark mode
  content = content.replace(/text-slate-200/g, 'text-[#172033]');
  content = content.replace(/text-slate-700/g, 'text-[#344054]');
  content = content.replace(/text-slate-800/g, 'text-[#101828]'); // Heading text
  
  // Clean up any remaining white texts that aren't button text
  // Since btn-primary manages its own text color via CSS, replacing text-white in JSX is safe mostly.
  content = content.replace(/text-white/g, 'text-[#172033]');
  
  // Restore specific text-white that actually NEED to be white because they are on top of colored badges
  // 1. "Campaign Generated" badge in Dashboard
  content = content.replace(/text-\[\#172033\] font-black text-lg leading-tight">Pro Audio Series/g, 'text-white font-black text-lg leading-tight">Pro Audio Series');
  content = content.replace(/text-\[\#172033\]\/80 font-medium text-xs mt-0\.5">Lifestyle Composition/g, 'text-white/80 font-medium text-xs mt-0.5">Lifestyle Composition');
  content = content.replace(/text-\[\#172033\] border border-white\/30">\\s*<Wand2 className="w-4 h-4" \/>/g, 'text-white border border-white/30">\\n                    <Wand2 className="w-4 h-4" />');
  content = content.replace(/text-\[\#172033\] font-bold tracking-wide">\\s*Campaign Generated/g, 'text-white font-bold tracking-wide">\\n                  Campaign Generated');
  content = content.replace(/text-\[\#172033\] shadow-inner shrink-0">\\s*<Sparkles className="w-4 h-4" \/>/g, 'text-white shadow-inner shrink-0">\\n                <Sparkles className="w-4 h-4" />');
  content = content.replace(/text-\[\#172033\] font-bold text-sm">\\s*JD/g, 'text-white font-bold text-sm">\\n              JD');
  
  // Also check CreateCampaign progress nodes: isCompleted text is white on gradient
  content = content.replace(/bg-gradient-to-r from-\[\#00d2ff\] to-\[\#3a7bd5\] text-\[\#172033\] shadow/g, 'bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5] text-white shadow');
  
  // Search inputs
  // Make sure they have border #D0D5DD
  content = content.replace(/border-slate-200 rounded-\[14px\]/g, 'border-[#D0D5DD] rounded-[14px]');
  
  fs.writeFileSync(f, content);
  console.log('Processed ' + f);
}

const filesToProcess = [
  'frontend/src/pages/Dashboard.jsx',
  'frontend/src/pages/CreateCampaign.jsx',
  'frontend/src/pages/Analytics.jsx',
  'frontend/src/pages/Settings.jsx',
  'frontend/src/pages/Templates.jsx',
  'frontend/src/components/Header.jsx',
  'frontend/src/components/Sidebar.jsx',
  'frontend/src/components/Layout.jsx'
];

filesToProcess.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    processFile(p);
  }
});
