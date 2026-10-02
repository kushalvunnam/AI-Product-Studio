const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');
const ccPath = path.join(srcDir, 'pages', 'CreateCampaign.jsx');
let content = fs.readFileSync(ccPath, 'utf8');

const oldModelsMatch = content.match(/const generationModels = \[[\s\S]*?\];/);
if (oldModelsMatch) {
  const newModels = `const IMAGE_EDIT_MODELS = {
  auto: {
    id: "auto",
    name: "Auto — Recommended",
    description: "Cloudinary automatically selects the best model",
    mode: "auto"
  },
  nanoBanana2: {
    id: "nano-banana-2-edit",
    name: "Nano Banana 2",
    description: "Fast, creative generations"
  },
  flux2Pro: {
    id: "flux-2-pro-edit",
    name: "FLUX 2 Pro",
    description: "Photorealistic product imagery"
  },
  gptImage2: {
    id: "gpt-image-2-edit",
    name: "GPT Image 2",
    description: "High-quality general purpose"
  },
  recraftV4: {
    id: "recraft-v4",
    name: "Recraft v4",
    description: "Clean vector and illustration styles",
    disabled: true,
    tooltip: "Not available for reference-image generation"
  }
};
const generationModels = Object.values(IMAGE_EDIT_MODELS);`;
  
  content = content.replace(oldModelsMatch[0], newModels);
}

// Update the rendering of the models in step 3
// We need to find the map: generationModels.map((m) => ( ... ))
const mapMatch = content.match(/\{generationModels\.map\(\(m\) => \([\s\S]*?\}\)\}\s*<\/div>/);
if (mapMatch) {
  // It renders a button or div that sets modelSettings.
  const newMap = `{generationModels.map((m) => {
                  const isSelected = modelSettings.id === m.id;
                  return (
                    <button
                      key={m.id}
                      disabled={m.disabled}
                      onClick={() => !m.disabled && setModelSettings({ id: m.id, mode: m.mode || 'manual', name: m.name })}
                      title={m.tooltip || ''}
                      className={\`text-left p-4 rounded-xl border transition-all duration-300 \${
                        m.disabled 
                          ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200' 
                          : isSelected 
                            ? 'bg-gradient-to-r from-[#00d2ff]/10 to-[#3a7bd5]/10 border-[#00d2ff]/30 shadow-md ring-2 ring-[#00d2ff]/20' 
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }\`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={\`font-bold \${isSelected ? 'text-[#3a7bd5]' : 'text-slate-800'}\`}>
                          {m.name}
                        </span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-[#3a7bd5]" />}
                      </div>
                      <p className="text-xs text-slate-500">{m.description}</p>
                      {m.tooltip && <p className="text-[10px] text-red-500 mt-2 font-medium">{m.tooltip}</p>}
                    </button>
                  );
                })}
              </div>`;
  content = content.replace(mapMatch[0], newMap);
}

fs.writeFileSync(ccPath, content);
console.log('Fixed model selection mapping and UI');
