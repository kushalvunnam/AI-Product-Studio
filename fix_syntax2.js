const fs = require('fs');

// 1. Fix Campaigns.jsx
let camp = fs.readFileSync('frontend/src/pages/Campaigns.jsx', 'utf8');
camp = camp.replace(
`  };
  };

  return (`,
`  };

  return (`
);
fs.writeFileSync('frontend/src/pages/Campaigns.jsx', camp);

// 2. Fix index.css
let css = fs.readFileSync('frontend/src/index.css', 'utf8');
css = css.replace(' selection:bg-primary-DEFAULT/30 selection:text-white', '');
fs.writeFileSync('frontend/src/index.css', css);

console.log('Fixed double brace and CSS.');
