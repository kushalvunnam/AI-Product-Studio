const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');
const ccPath = path.join(srcDir, 'pages', 'CreateCampaign.jsx');
let content = fs.readFileSync(ccPath, 'utf8');

// Replace dark classes with light classes
const replacements = [
  { from: /text-white/g, to: 'text-slate-800' },
  { from: /text-slate-300/g, to: 'text-slate-600' },
  { from: /text-slate-400/g, to: 'text-slate-500' },
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

replacements.forEach(r => {
  content = content.replace(r.from, r.to);
});

// Update Progress Bar to floating nodes
const oldProgressBarMatch = content.match(/<div className="flex justify-between relative z-10">[\s\S]*?<\/div>\s*<\/div>/);
if (oldProgressBarMatch) {
  const newProgressNodes = `
  <div className="relative z-10 flex justify-between">
    {[1, 2, 3, 4, 5].map((s, index) => {
      const isCompleted = step > s;
      const isCurrent = step === s;
      return (
        <div key={s} className="flex flex-col items-center relative z-20">
          <div className={\`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 \${
            isCompleted 
              ? 'bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5] text-white shadow-[0_4px_15px_rgba(0,210,255,0.4)] scale-100' 
              : isCurrent 
                ? 'bg-white border-2 border-[#00d2ff] text-[#3a7bd5] shadow-[0_0_20px_rgba(0,210,255,0.3)] scale-110' 
                : 'bg-white border border-slate-200 text-slate-400 scale-95'
          }\`}>
            {isCompleted ? <Check className="w-5 h-5" /> : s}
          </div>
          <span className={\`absolute top-14 text-xs font-semibold whitespace-nowrap \${
            isCurrent ? 'text-[#3a7bd5]' : isCompleted ? 'text-slate-700' : 'text-slate-400'
          }\`}>
            {['Upload', 'AI Vision', 'Brief', 'Variations', 'Assets'][index]}
          </span>
        </div>
      );
    })}
  </div>
  `;
  // We need to also replace the line background
  content = content.replace(
    /<div className="absolute top-1\/2 left-0 w-full h-1 bg-white\/10 -translate-y-1\/2 rounded-full">[\s\S]*?<\/div>/,
    `<div className="absolute top-6 left-0 w-full h-1 bg-slate-200 rounded-full">
      <div className="h-full bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5] transition-all duration-700 ease-out rounded-full" style={{ width: \`\${(step - 1) * 25}%\` }}></div>
    </div>`
  );
  content = content.replace(oldProgressBarMatch[0], newProgressNodes);
}

// Update Generation UI Step 4
const generatingUIMatch = content.match(/\{isGenerating && \([\s\S]*?<\/div>\s*\)\}/);
if (generatingUIMatch) {
  const newGenUI = `{isGenerating && (
    <div className="glass-card p-10 max-w-lg mx-auto my-12 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative overflow-hidden flex flex-col items-center">
      <div className="absolute inset-0 bg-glow-primary opacity-20"></div>
      <div className="relative w-32 h-32 mb-8 perspective-1000">
        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-[#00d2ff] border-r-[#3a7bd5] rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
        <div className="absolute inset-2 bg-gradient-to-br from-[#00d2ff]/10 to-[#3a7bd5]/10 rounded-full flex items-center justify-center animate-pulse-glow">
          <Sparkles className="w-10 h-10 text-[#3a7bd5]" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">AI Generation Studio</h3>
      <p className="text-slate-500 font-medium mb-6 animate-pulse">{generationStatus.message}</p>
      
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5] transition-all duration-500" style={{ width: \`\${Math.max(5, (generationStatus.completed / generationStatus.total) * 100)}%\` }}></div>
      </div>
      
      <div className="w-full mt-6 space-y-3 text-sm font-medium">
        {[...Array(generationStatus.total)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 text-slate-600">
            {i < generationStatus.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : i === generationStatus.completed ? (
              <Activity className="w-5 h-5 text-[#00d2ff] animate-spin" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>
            )}
            <span>Variation {i + 1} {i < generationStatus.completed ? 'complete' : i === generationStatus.completed ? 'generating...' : 'waiting'}</span>
          </div>
        ))}
      </div>
    </div>
  )}`;
  content = content.replace(generatingUIMatch[0], newGenUI);
}

fs.writeFileSync(ccPath, content);
console.log('Fixed CreateCampaign Light Theme');
