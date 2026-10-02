const fs = require('fs');

function fixButtons(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/className="px-6 py-2/g, 'className="min-h-[44px] px-6 py-2');
    content = content.replace(/className="bg-slate-100/g, 'className="min-h-[44px] bg-slate-100');
    content = content.replace(/className="btn-primary/g, 'className="btn-primary min-h-[44px]');
    content = content.replace(/className="w-full bg-primary-600/g, 'className="w-full min-h-[44px] bg-primary-600');
    // Ensure all inputs are min-h-[44px]
    content = content.replace(/className="w-full bg-white shadow-sm/g, 'className="w-full min-h-[44px] bg-white shadow-sm');
    fs.writeFileSync(filePath, content);
}

fixButtons('frontend/src/pages/CreateCampaign.jsx');
fixButtons('frontend/src/pages/Dashboard.jsx');
fixButtons('frontend/src/pages/Campaigns.jsx');
fixButtons('frontend/src/pages/Templates.jsx');
fixButtons('frontend/src/pages/Settings.jsx');

console.log('Fixed buttons');
