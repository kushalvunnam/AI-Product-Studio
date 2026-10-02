const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'frontend', 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/body {[\s\S]*?}/, "body {\\n    background-color: #F7FAFC;\\n    @apply text-[#172033] font-sans antialiased min-h-screen overflow-x-hidden;\\n  }");
css = css.replace(/\.glass-card {[\s\S]*?}/, ".glass-card {\\n    @apply bg-[#FFFFFF] backdrop-blur-lg border border-[#E4E7EC] rounded-2xl shadow-[0_4px_20px_rgba(16,24,40,0.06)] hover:shadow-[0_8px_30px_rgba(16,24,40,0.1)] transition-all duration-300 relative overflow-hidden;\\n  }");
css = css.replace(/\.glass-panel {[\s\S]*?}/, ".glass-panel {\\n    @apply bg-[#FFFFFF] backdrop-blur-xl border border-[#E4E7EC] rounded-[20px] shadow-[0_4px_20px_rgba(16,24,40,0.06)];\\n  }");
  
fs.writeFileSync(cssPath, css);
console.log('Updated index.css');
