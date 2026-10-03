const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');

// 1. DYNAMIC GENERATION HEADER
const searchHeader = /<div className="flex flex-col"><h2 className="text-xl font-bold text-\[#101828\] flex items-center gap-2"><Layers className="w-5 h-5 text-primary" \/> AI Image Generation<\/h2>[\s\S]*?<\/div>/;
const replaceHeader = `<div className="flex flex-col">
                <h2 className="text-xl font-bold text-[#101828] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" /> 
                  {modelSettings.id === 'auto' ? 'Cloudinary AI Generation' : 'AI Image Generation'}
                </h2>
                <span className="text-sm text-slate-500 mt-1">
                  Powered by {modelSettings.id === 'auto' ? 'Cloudinary AI' : (availableModels.find(m => m.id === modelSettings.id)?.name || 'AI Provider')}
                </span>
              </div>`;
c = c.replace(searchHeader, replaceHeader);


// 2. MODEL CARDS
const searchCards = /<label className="block text-sm font-medium text-\[#52627A\] mb-3">Generation Model<\/label>\s*<div className="space-y-2">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">[\s\S]*?<button onClick={startGeneration}[\s\S]*?<\/button>\s*<\/div>/;

const replaceCards = `<label className="block text-sm font-medium text-[#52627A] mb-3">Generation Model</label>
                        <div className="flex flex-col space-y-3 w-full">
                          {availableModels.map(model => {
                            const isSelected = modelSettings.id === model.id;
                            const isAvailable = model.available;
                            
                            // Dynamic Classes
                            let cardClasses = "relative flex items-start p-4 rounded-xl border transition-all duration-300 w-full text-left ";
                            
                            if (isSelected && isAvailable) {
                              cardClasses += "bg-gradient-to-br from-[#f8fbff] to-[#eef7ff] border-blue-300 shadow-md transform -translate-y-[2px] ring-1 ring-blue-200/50";
                            } else if (isAvailable) {
                              cardClasses += "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-[2px] cursor-pointer";
                            } else {
                              cardClasses += "bg-slate-50 border-slate-200 opacity-90 cursor-not-allowed";
                            }

                            return (
                              <label key={model.id} className={cardClasses}>
                                <input 
                                  type="radio" 
                                  name="model" 
                                  value={model.id} 
                                  checked={isSelected} 
                                  onChange={() => setModelSettings(prev => ({...prev, id: model.id, mode: model.id === 'auto' ? 'auto' : 'specific'}))} 
                                  disabled={!isAvailable} 
                                  className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 bg-slate-100 border-slate-300 cursor-pointer disabled:cursor-not-allowed" 
                                />
                                <div className="ml-3 flex flex-col w-full overflow-hidden">
                                  <div className="flex flex-wrap items-center gap-2 mb-1 w-full">
                                    <span className={\`text-sm font-bold \${isSelected ? 'text-blue-700' : 'text-[#1e293b]'}\`}>
                                      {model.name || model.label}
                                    </span>
                                    {!isAvailable && <span className="text-[10px] bg-slate-100 text-[#475569] border border-slate-200 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">🔒 Not Available</span>}
                                    {isAvailable && model.freeTier && <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold whitespace-nowrap tracking-wide">🟢 FREE TIER</span>}
                                    {isAvailable && !model.freeTier && model.requiresApiKey && <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">🔑 API Key Required</span>}
                                    {isAvailable && !model.freeTier && !model.requiresApiKey && <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold whitespace-nowrap tracking-wide">🟢 Available</span>}
                                  </div>
                                  <span className="text-xs text-[#64748b] leading-relaxed break-words">
                                    {!isAvailable && model.reason ? (
                                      <span className="text-orange-700/80 font-medium">{model.reason}</span>
                                    ) : (
                                      model.description
                                    )}
                                  </span>
                                </div>
                                {isSelected && isAvailable && (
                                  <div className="absolute top-0 right-0 p-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                  </div>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end w-full">
                <button 
                  onClick={startGeneration} 
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-8 py-3 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2 text-[15px]">
                    Generate {variationCount} Variations <ArrowRight className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium opacity-90 tracking-wide uppercase">
                    Powered by {modelSettings.id === 'auto' ? 'Cloudinary AI' : (availableModels.find(m => m.id === modelSettings.id)?.name || 'AI Provider')}
                  </span>
                </button>
              </div>`;

c = c.replace(searchCards, replaceCards);

fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', c);
