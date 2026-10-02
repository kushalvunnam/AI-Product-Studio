const fs = require('fs');

function unescape(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    content = content.replace(/\\`/g, '`');
    content = content.replace(/\\\$/g, '$');
    fs.writeFileSync(filepath, content);
}

unescape('frontend/src/pages/Dashboard.jsx');
unescape('frontend/src/components/Sidebar.jsx');
unescape('frontend/src/components/Navbar.jsx');
unescape('frontend/src/pages/Analytics.jsx');

let camp = fs.readFileSync('frontend/src/pages/Campaigns.jsx', 'utf8');
camp = camp.replace(/\\`/g, '`');
camp = camp.replace(/\\\$/g, '$');
// Let's ensure the function is closed properly
// The return we replaced earlier:
// return `px-3 py-1 rounded-full text-xs font-bold border ${colors[status] || colors.draft}`;
// };
camp = camp.replace(
`    return \`px-3 py-1 rounded-full text-xs font-bold border \${colors[status] || colors.draft}\`;
  };`,
`    return \`px-3 py-1 rounded-full text-xs font-bold border \${colors[status] || colors.draft}\`;
  };`
);
fs.writeFileSync('frontend/src/pages/Campaigns.jsx', camp);
console.log('Fixed backticks.');
