const fs = require('fs');
const path = require('path');

function replaceColors(content) {
  let c = content;
  // Backgrounds and borders
  c = c.replace(/bg-slate-900/g, 'bg-[#FFFFFF]');
  c = c.replace(/bg-slate-800\/30/g, 'hover:bg-[#F7FAFC]');
  c = c.replace(/bg-slate-800/g, 'bg-[#F7FAFC]');
  c = c.replace(/bg-white\/5/g, 'bg-[#FFFFFF]');
  c = c.replace(/bg-white\/10/g, 'bg-[#F7FAFC]');
  c = c.replace(/border-slate-700/g, 'border-[#E4E7EC]');
  c = c.replace(/border-slate-800\/50/g, 'border-[#E4E7EC]');
  c = c.replace(/border-slate-800/g, 'border-[#E4E7EC]');
  c = c.replace(/border-white\/5/g, 'border-[#E4E7EC]');
  c = c.replace(/border-white\/10/g, 'border-[#E4E7EC]');
  c = c.replace(/divide-slate-800/g, 'divide-[#E4E7EC]');
  
  // Text
  c = c.replace(/text-slate-200/g, 'text-[#172033]');
  c = c.replace(/text-slate-300/g, 'text-[#344054]');
  c = c.replace(/text-slate-400/g, 'text-[#6B7A90]');
  c = c.replace(/text-white/g, 'text-[#172033]');
  
  // Specific fix for inputs
  c = c.replace(/className="w-full bg-transparent border-none outline-none text-sm text-\[\#172033\] pl-10 pr-4 py-2 placeholder:text-\[\#6B7A90\]"/g, 'className="w-full bg-[#FFFFFF] border border-[#D0D5DD] rounded-lg focus:border-[#3B82F6] outline-none text-sm text-[#172033] pl-10 pr-4 py-2 placeholder:text-[#667085]"');
  c = c.replace(/className="w-full bg-white\/5 border border-white\/10 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer"/g, 'className="w-full bg-[#FFFFFF] border border-[#D0D5DD] rounded-lg pl-10 pr-4 py-2 text-sm text-[#172033] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none appearance-none cursor-pointer"');
  
  // Specific fix for badges in Campaigns.jsx and Assets.jsx
  c = c.replace(/const getStatusBadge = \\(status\\) => {\\s*switch \\(status\\) {[\\s\\S]*?default:.*?}\\s*};/g, 
    "const getStatusBadge = (status) => {\\n" +
    "  switch (status) {\\n" +
    "    case 'completed': return 'px-2.5 py-1 text-[11px] font-bold rounded-md bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]';\\n" +
    "    case 'failed': return 'px-2.5 py-1 text-[11px] font-bold rounded-md bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]';\\n" +
    "    case 'generating': return 'px-2.5 py-1 text-[11px] font-bold rounded-md bg-[#F0F9FF] text-[#026AA2] border border-[#B9E6FE]';\\n" +
    "    case 'review': return 'px-2.5 py-1 text-[11px] font-bold rounded-md bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]';\\n" +
    "    default: return 'px-2.5 py-1 text-[11px] font-bold rounded-md bg-[#F8F9FC] text-[#344054] border border-[#D0D5DD]';\\n" +
    "  }\\n" +
    "};");
    
  return c;
}

const filesToProcess = [
  'frontend/src/pages/Campaigns.jsx',
  'frontend/src/pages/Assets.jsx',
  'frontend/src/pages/CampaignDetails.jsx'
];

filesToProcess.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = replaceColors(content);
    fs.writeFileSync(p, content);
    console.log('Fixed ' + f);
  }
});
