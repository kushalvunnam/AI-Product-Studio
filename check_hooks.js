const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('frontend/src');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const hooks = ['useEffect', 'useState', 'useRef', 'useCallback', 'useMemo', 'useContext'];
  hooks.forEach(hook => {
    // Check if hook is used (e.g. hook( or hook< )
    if (content.includes(hook + '(') || content.includes(hook + '<')) {
      // Check if it's imported from 'react'
      // E.g., import { useState, useEffect } from 'react'
      // Or import React, { useEffect } from 'react'
      const importRegex = new RegExp(\`import\\\\s+{[^}]*\\\\b\${hook}\\\\b[^}]*}\\\\s+from\\\\s+['"]react['"]\`);
      const importReactRegex = new RegExp(\`import\\\\s+React\\\\s+from\\\\s+['"]react['"]\`); // if they use React.useEffect
      
      if (!importRegex.test(content) && !content.includes(\`React.\${hook}\`)) {
          // If they didn't explicitly import the hook, AND they aren't using React.hook
          // wait, Dashboard.jsx has `import React, { useState, useEffect } from 'react';`
          const exactImport = content.includes(hook); // basic string check for import
          const isImported = content.split('\\n').some(line => line.startsWith('import') && line.includes(hook) && line.includes('react'));
          if (!isImported) {
              console.log('Missing ' + hook + ' in ' + f);
          }
      }
    }
  });
});
