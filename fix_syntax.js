const fs = require('fs');

function unescape(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    content = content.replace(/\\\$/g, '$');
    fs.writeFileSync(filepath, content);
}

unescape('frontend/src/pages/Dashboard.jsx');
unescape('frontend/src/components/Sidebar.jsx');
unescape('frontend/src/components/Navbar.jsx');
unescape('frontend/src/pages/Analytics.jsx');
unescape('frontend/src/pages/Campaigns.jsx');

// Fix Campaigns.jsx syntax error
let camp = fs.readFileSync('frontend/src/pages/Campaigns.jsx', 'utf8');
camp = camp.replace(
`    return \`px-3 py-1 rounded-full text-xs font-bold border \${colors[status] || colors.draft}\`;
  };
  return \`px-3 py-1 rounded-full text-xs font-medium border \${colors[status] || colors.draft}\`;
    };`,
`    return \`px-3 py-1 rounded-full text-xs font-bold border \${colors[status] || colors.draft}\`;
  };`
);
// Make sure we didn't miss another bad replacement
camp = camp.replace(
`    return \`px-3 py-1 rounded-full text-xs font-bold border \${colors[status] || colors.draft}\`;
  };
  return \`px-3 py-1 rounded-full text-xs font-medium border \${colors[status] || colors.draft}\`;`,
`    return \`px-3 py-1 rounded-full text-xs font-bold border \${colors[status] || colors.draft}\`;
  };`
);

fs.writeFileSync('frontend/src/pages/Campaigns.jsx', camp);
console.log('Fixed syntax errors.');
