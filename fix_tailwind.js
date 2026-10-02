const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
            if (fullPath.includes('tailwind.config.js')) continue;
            let content = fs.readFileSync(fullPath, 'utf8');
            content = content.replace(/-DEFAULT/g, '');
            fs.writeFileSync(fullPath, content);
        }
    }
}

replaceInDir('frontend/src');
console.log('Fixed DEFAULT classes.');
