const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');

const regex = /<label className="block text-sm font-medium text-\[#52627A\] mb-3">Generation Model<\/label>([\s\S]*?)<\/div>\s*<\/div>/;

const replacement = `<label className="block text-sm font-medium text-[#52627A] mb-3">Generation Model</label>
                        <div className="space-y-2">
                          {availableModels.map(model => (
                            <label key={model.id} className={\`flex items-start p-3 rounded-lg border transition-colors \${!model.available ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer'} \${modelSettings.id === model.id ? 'bg-primary/10 border-primary/50 shadow-md' : (!model.available ? 'border-slate-200' : 'bg-white shadow-sm border-slate-200 hover:border-slate-500')}\`}>
                              <input type="radio" name="model" value={model.id} checked={modelSettings.id === model.id} onChange={() => setModelSettings(prev => ({...prev, id: model.id, mode: model.id === 'auto' ? 'auto' : 'specific'}))} disabled={!model.available} className="mt-0.5 w-4 h-4 text-primary-600 focus:ring-primary-500 bg-slate-100 border-slate-200" />
                              <div className="ml-3 flex flex-col w-full">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={\`text-sm font-bold \${modelSettings.id === model.id ? 'text-primary' : 'text-[#172033]'}\`}>
                                    {model.name || model.label}
                                  </span>
                                  {!model.available && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">🔒 Not Available</span>}
                                  {model.available && model.freeTier && <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">🟢 FREE TIER</span>}
                                  {model.available && !model.freeTier && model.requiresApiKey && <span className="text-[10px] bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">🔑 API Key Required</span>}
                                  {model.available && !model.freeTier && !model.requiresApiKey && <span className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">🟢 Available</span>}
                                </div>
                                <span className="text-xs text-[#6B7A90] mt-1">{!model.available && model.reason ? <span className="text-red-500 font-medium">{model.reason}</span> : (model.description)}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>`;

c = c.replace(regex, replacement);
fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', c);
