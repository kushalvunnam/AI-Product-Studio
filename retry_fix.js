const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');

const searchGrid = `{generatedResult.variations.map((variant) => (
                      <div key={variant.id} className="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200 hover:border-primary/50 shadow-md transition-colors flex flex-col h-full group relative">
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/50 flex items-center gap-2 z-10">
                          <span className="text-xs font-bold text-primary">{variant.modelUsed || modelSettings.id}</span>
                        </div>
                        <div className="relative aspect-square flex items-center justify-center bg-slate-100 p-4">
                          <img src={variant.secureUrl} alt={variant.variationName} className="max-w-full max-h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" />
                        </div>
                        <div className="p-4 bg-slate-50 flex flex-col flex-grow justify-between gap-4 border-t border-slate-100">
                          <button onClick={() => selectVariant(variant)} className="w-full min-h-[44px] bg-primary-600 hover:bg-primary text-[#101828] py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Select for Campaign</button>
                        </div>
                      </div>
                    ))}`;

const retryFunction = `
  const retryFailedVariations = async () => {
    if (!generatedResult || !generatedResult.variations) return;
    const missingCount = variationCount - generatedResult.variations.length;
    if (missingCount <= 0) return;
    
    setIsGenerating(true);
    setStep(4);
    setGenerationError(null);
    setGenerationStatus({ message: 'Retrying failed variations...', completed: 0, total: missingCount });
    
    try {
      const result = await generateCampaignVariations({ 
        campaignId, 
        sourceImage, 
        analysis, 
        creativeBrief, 
        model: modelSettings, 
        variationCount: missingCount 
      });
      
      if (result.isAsync) {
        let attempts = 0;
        pollingRef.current = setInterval(async () => {
          try {
            attempts++;
            if (attempts > 30) {
              clearInterval(pollingRef.current);
              setGenerationError('Generation timed out. Please try again.');
              setIsGenerating(false);
              return;
            }
            
            const statusData = await getGenerationStatus(result.jobId);
            const { mappedStatus, completed, total, variations, error } = statusData;
            
            setGenerationStatus({ 
              message: \`Retrying \${missingCount} variations...\`, 
              completed, 
              total 
            });
            
            const validVariations = variations ? variations.filter(v => v.secureUrl && v.status !== 'failed') : [];
            const hasFailed = variations && variations.some(v => v.status === 'failed' || v.error);
            
            if (mappedStatus === 'completed' || mappedStatus === 'partial' || mappedStatus === 'failed') {
              clearInterval(pollingRef.current);
              
              if (validVariations.length > 0) {
                // Merge the new valid variations with the old ones
                const allVariations = [...generatedResult.variations, ...validVariations];
                setGeneratedResult({ success: true, variations: allVariations, hasFailed: allVariations.length < variationCount });
                setIsGenerating(false);
                setStep(5);
              } else if (mappedStatus === 'failed' || error) {
                setGenerationError(error || 'Failed to retry variations.');
                setIsGenerating(false);
              } else {
                setGenerationError('Generation failed on the server. Please try again.');
                setIsGenerating(false);
              }
            }
          } catch (pollErr) {
            console.error('Polling error:', pollErr);
          }
        }, 2000);
      }
    } catch (err) {
      setGenerationError(err.message || 'Generation failed.');
      setIsGenerating(false);
    }
  };
`;

const replaceGrid = `{generatedResult.variations.map((variant) => (
                      <div key={variant.id} className="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200 hover:border-primary/50 shadow-md transition-colors flex flex-col h-full group relative">
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/50 flex items-center gap-2 z-10">
                          <span className="text-xs font-bold text-primary">{variant.modelUsed || modelSettings.id}</span>
                        </div>
                        <div className="relative aspect-square flex items-center justify-center bg-slate-100 p-4">
                          <img src={variant.secureUrl} alt={variant.variationName} className="max-w-full max-h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" />
                        </div>
                        <div className="p-4 bg-slate-50 flex flex-col flex-grow justify-between gap-4 border-t border-slate-100">
                          <button onClick={() => selectVariant(variant)} className="w-full min-h-[44px] bg-primary-600 hover:bg-primary text-[#101828] py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Select for Campaign</button>
                        </div>
                      </div>
                    ))}
                    
                    {generatedResult.hasFailed && generatedResult.variations.length < variationCount && (
                      <div className="bg-red-50 border border-red-200 shadow-sm rounded-xl overflow-hidden flex flex-col h-full items-center justify-center p-6 text-center">
                        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                        <h4 className="text-red-700 font-bold mb-1">{variationCount - generatedResult.variations.length} Failed Variations</h4>
                        <p className="text-sm text-red-600 mb-4">Some image generations failed due to provider errors.</p>
                        <button onClick={retryFailedVariations} className="bg-white hover:bg-slate-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                          Retry Missing Variations
                        </button>
                      </div>
                    )}`;

// inject retryFunction before startGeneration
c = c.replace('const startGeneration = async () => {', retryFunction + '\n  const startGeneration = async () => {');

// inject grid
c = c.replace(searchGrid, replaceGrid);

// Update valid variations filter to be accurate
c = c.replace(/const validVariations = variations \? variations\.filter\(v => v\.secureUrl && v\.status !== 'failed'\) : \[\];/g, "const validVariations = variations ? variations.filter(v => v.secureUrl && v.status !== 'failed') : [];");
c = c.replace(/const hasFailed = variations && variations\.some\(v => v\.status === 'failed' \|\| v\.error\);/g, "const hasFailed = (variations && variations.some(v => v.status === 'failed' || v.error)) || (validVariations.length < variationCount);");


fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', c);
