import { useState, useRef, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Layers, Sliders, CheckCircle2, AlertCircle, X, Check, Activity, Download, Settings2, ImagePlus, LayoutTemplate, SplitSquareHorizontal } from 'lucide-react';
import { uploadProductImage, analyzeProductImage, generateCampaignVariations, API_BASE_URL } from '../services/api';
import { createCampaign, updateCampaign, getCampaignById } from '../services/campaignService';
import { useNavigate } from 'react-router-dom';

export const transformAssets = async (data) => {
  const response = await fetch(`${API_BASE_URL}/api/assets/transform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Transformation failed');
  if (!result.success || !result.assets) throw new Error('Invalid response from server');
  return result;
};

const generationModels = [
  { id: "auto", name: "Auto — Recommended", description: "Cloudinary automatically selects the best model" },
  { id: "nano-banana-2", name: "Nano Banana 2", description: "Fast, creative generations" },
  { id: "flux-2-pro", name: "FLUX 2 Pro", description: "Photorealistic product imagery" },
  { id: "gpt-image-2", name: "GPT Image 2", description: "High-quality general purpose" },
  { id: "ideogram-v4-base", name: "Ideogram v4 Base", description: "Excellent layout and text rendering" },
  { id: "recraft-v4", name: "Recraft v4", description: "Clean vector and illustration styles" }
];

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  const [campaignId, setCampaignId] = useState(null);
  const [sourceImage, setSourceImage] = useState(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const [creativeBrief, setCreativeBrief] = useState({
    campaignName: 'Summer Promo',
    objective: 'Social Media',
    visualStyle: 'Premium',
    mood: 'Energetic',
    background: 'Studio',
    targetAudience: 'Millennials',
    marketingMessage: 'Elevate your style.'
  });
  
  const [modelSettings, setModelSettings] = useState({ mode: 'auto', preference: 'balanced', id: 'auto' });
  const [variationCount, setVariationCount] = useState(4);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState({ instagram: true, story: true, website: true, advertisement: true, productCard: true });
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationError, setTransformationError] = useState(null);
  const [transformationResult, setTransformationResult] = useState(null);

  const fileInputRef = useRef(null);

  const steps = [
    { num: 1, label: 'Upload Product', icon: UploadCloud },
    { num: 2, label: 'AI Vision', icon: Sparkles },
    { num: 3, label: 'Creative Brief', icon: Sliders },
    { num: 4, label: 'Variations', icon: Layers },
    { num: 5, label: 'Marketing Kit', icon: LayoutTemplate },
  ];

  const handleUpload = async (file) => {
    setIsUploading(true); setUploadError(null);
    try {
      const asset = await uploadProductImage(file);
      const newSourceImage = {
        publicId: asset.publicId, secureUrl: asset.secureUrl, assetId: asset.assetId, format: asset.format,
        width: asset.width, height: asset.height, bytes: asset.bytes, originalFilename: asset.originalFilename,
      };
      setSourceImage(newSourceImage);
      
      // Auto-save phase 1
      const camp = await createCampaign({ name: creativeBrief.campaignName, sourceImage: newSourceImage, status: 'draft' });
      setCampaignId(camp._id);
    } catch (err) {
      setUploadError(err.message || 'Upload failed.');
    } finally { setIsUploading(false); }
  };

  const startAnalysis = async () => {
    if (!sourceImage) return;
    setStep(2); setIsAnalyzing(true); setAnalysisError(null); setAnalysisProgress(1);
    try {
      if (campaignId) await updateCampaign(campaignId, { status: 'analyzing' });
      const p1 = setTimeout(() => setAnalysisProgress(2), 1500);
      const result = await analyzeProductImage(sourceImage.secureUrl);
      clearTimeout(p1); setAnalysisProgress(3);
      
      setAnalysis(result);
      setCreativeBrief(prev => ({ ...prev, targetAudience: result.targetAudience !== 'unknown' ? result.targetAudience : prev.targetAudience, visualStyle: result.visualStyle !== 'unknown' ? result.visualStyle : prev.visualStyle }));
      
      // Auto-save phase 2
      if (campaignId) await updateCampaign(campaignId, { analysis: result, status: 'draft' });
      
      setIsAnalyzing(false);
    } catch (err) {
      setAnalysisError(err.message || 'Analysis failed.');
      setIsAnalyzing(false);
    }
  };

  const startGeneration = async () => {
    if (!sourceImage || !analysis) return;
    setStep(4); setIsGenerating(true); setGenerationError(null); setGenerationProgress(1);
    try {
      // Auto-save brief
      if (campaignId) await updateCampaign(campaignId, { creativeBrief, model: modelSettings, status: 'generating', name: creativeBrief.campaignName });
      
      const p1 = setTimeout(() => setGenerationProgress(2), 2000);
      const result = await generateCampaignVariations({ campaignId, sourceImage, analysis, creativeBrief, model: modelSettings, variationCount });
      clearTimeout(p1); setGenerationProgress(4);
      
        if (result.isAsync && campaignId) {
          // Poll for completion
          let isDone = false;
          let finalResult = null;
          while (!isDone) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            const camp = await getCampaignById(campaignId);
            if (camp.status === 'review' && camp.variations && camp.variations.length > 0) {
              isDone = true;
              finalResult = { success: true, variations: camp.variations };
            } else if (camp.status === 'failed') {
              throw new Error('Generation failed on the server. Please try again.');
            }
          }
          setGeneratedResult(finalResult);
          
          if (finalResult && finalResult.variations && finalResult.variations.length > 0) {
            const firstVariant = finalResult.variations[0];
            setSelectedVariant(firstVariant);
            await updateCampaign(campaignId, { selectedVariation: firstVariant });
            setStep(5);
          }
        } else {
          setGeneratedResult(result);
          if (campaignId) await updateCampaign(campaignId, { variations: result.variations, status: 'review' });
          if (result && result.variations && result.variations.length > 0) {
            const firstVariant = result.variations[0];
            setSelectedVariant(firstVariant);
            if (campaignId) await updateCampaign(campaignId, { selectedVariation: firstVariant });
            setStep(5);
          }
        }
        setIsGenerating(false);
    } catch (err) {
      setGenerationError(err.message || 'Generation failed.');
      if (campaignId) { try { await updateCampaign(campaignId, { status: 'failed' }); } catch(e) {} }
      setIsGenerating(false);
    }
  };

  const selectVariant = async (variant) => { 
    setSelectedVariant(variant); 
    if (campaignId) await updateCampaign(campaignId, { selectedVariation: variant });
    setStep(5); 
  };

  const togglePlatform = (key) => { setSelectedPlatforms(prev => ({ ...prev, [key]: !prev[key] })); };

  const startTransformation = async () => {
    if (!selectedVariant) return;
    const platformsToTransform = Object.keys(selectedPlatforms).filter(key => selectedPlatforms[key]);
    if (platformsToTransform.length === 0) return;

    setIsTransforming(true); setTransformationError(null);
    try {
      if (campaignId) await updateCampaign(campaignId, { status: 'transforming' });
      
      const result = await transformAssets({ publicId: selectedVariant.publicId, platforms: platformsToTransform });
      setTransformationResult(result);
      
      // Auto-save completed campaign
      if (campaignId) await updateCampaign(campaignId, { marketingAssets: result.assets, status: 'completed' });
      
      setIsTransforming(false);
    } catch (err) {
      setTransformationError(err.message || 'Failed to generate assets.');
      setIsTransforming(false);
    }
  };

  const onDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const onDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) { handleUpload(e.dataTransfer.files[0]); e.dataTransfer.clearData(); }
  }, []);
  const handleFileSelect = (e) => { if (e.target.files && e.target.files.length > 0) handleUpload(e.target.files[0]); };
  
  const handleBriefChange = (e) => {
    const { name, value } = e.target;
    setCreativeBrief(prev => ({ ...prev, [name]: value }));
  };

  const platformLabels = { instagram: "Instagram Post (1080x1080)", story: "Instagram Story (1080x1920)", website: "Website Banner (1920x1080)", advertisement: "Advertisement (1200x628)", productCard: "Product Card (800x800)" };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Create New Campaign</h1>
        <p className="text-slate-400">Transform a single product image into a complete marketing campaign using Cloudinary AI.</p>
      </div>

      <div className="glass-panel p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-500" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}></div>
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = s.num === step;
            const isCompleted = s.num < step;
            return (
              <div key={s.num} className="flex flex-col items-center gap-2 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-primary text-white ring-4 ring-primary-500/20' : isCompleted ? 'bg-primary text-slate-950 shadow-neon' : 'bg-surfaceHighlight text-slate-400 border border-white/10'}`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${isActive || isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel p-6 md:p-8 max-w-5xl mx-auto">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Upload Your Product</h2>
            {!sourceImage ? (
              <div 
                className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${isDragging ? 'border-primary-500 bg-primary/10' : uploadError ? 'border-red-500 bg-red-500/5' : isUploading ? 'border-primary/50 shadow-neon bg-surfaceHighlight/30 cursor-wait' : 'border-white/10 hover:border-primary/50 shadow-neon hover:bg-surfaceHighlight/30'}`}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} accept="image/jpeg, image/jpg, image/png, image/webp" disabled={isUploading} />
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 text-primary shadow-lg border border-primary/30 shadow-neon animate-pulse"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>
                    <h3 className="text-lg font-semibold text-white mb-2">Uploading to Cloudinary...</h3>
                  </div>
                ) : (
                  <>
                    <div className={`w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 shadow-lg ${uploadError ? 'text-red-400' : 'text-primary'}`}><UploadCloud className="w-8 h-8" /></div>
                    <h3 className="text-lg font-semibold text-white mb-2">{isDragging ? 'Drop image here' : 'Drop your product image here'}</h3>
                    {uploadError && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-4 py-2 rounded-lg flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{uploadError}</span></div>}
                  </>
                )}
              </div>
            ) : (
              <div className="border border-white/10 rounded-xl p-6 bg-surfaceHighlight/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> ✓ Uploaded to Cloudinary</h3>
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3 bg-white/5 rounded-lg overflow-hidden border border-white/10 aspect-square flex items-center justify-center">
                    <img src={sourceImage.secureUrl} alt="Uploaded product" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button onClick={startAnalysis} className="bg-primary-600 hover:bg-primary text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Analyze Product with AI</button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (isAnalyzing || analysisError) && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> AI Vision Analysis
            </h2>
            
            {isAnalyzing && (
              <div className="glass-panel p-8 max-w-md mx-auto my-12 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                  <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }}></div>
                </div>
                <div className="flex items-center justify-center flex-col text-center">
                  <Activity className="w-10 h-10 text-primary mb-4 animate-spin" />
                  <h3 className="text-lg font-bold text-white mb-2">Analyzing Product Image</h3>
                  <p className="text-slate-400 text-sm">Gemini AI is examining your product to extract visual context, materials, and marketing keywords...</p>
                </div>
              </div>
            )}

            {analysisError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md mx-auto text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-red-400 mb-2">Analysis Failed</h3>
                <p className="text-slate-300 text-sm mb-6">{analysisError}</p>
                <button onClick={startAnalysis} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors font-medium">
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && analysis && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> AI Vision Analysis</h2>
              <button onClick={() => setStep(3)} className="bg-primary-600 hover:bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">Continue to Brief</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white/5 rounded-xl overflow-hidden border border-white/10 aspect-square flex items-center justify-center">
                <img src={sourceImage.secureUrl} alt="Uploaded product" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-surface p-4 rounded-xl border border-white/10">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Product</p>
                  <p className="text-lg font-bold text-white">{analysis.productName}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && analysis && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Sliders className="w-5 h-5 text-primary" /> Creative Brief</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Campaign Name</label>
                  <input type="text" name="campaignName" value={creativeBrief.campaignName} onChange={handleBriefChange} className="w-full bg-white/5 border border-white/10 text-sm rounded-lg block p-2.5 text-white" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-surfaceHighlight/30 p-5 rounded-xl border border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Settings2 className="w-4 h-4 text-primary" /> Cloudinary AI Settings</h3>
                  <div className="space-y-5">
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">Generation Model</label>
                      <div className="space-y-2">
                        {generationModels.map(model => (
                          <label key={model.id} className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${modelSettings.id === model.id ? 'bg-primary/10 border-primary/50 shadow-neon' : 'bg-white/5 border-white/10 hover:border-slate-500'}`}>
                            <input type="radio" name="model" value={model.id} checked={modelSettings.id === model.id} onChange={() => setModelSettings(prev => ({...prev, id: model.id, mode: model.id === 'auto' ? 'auto' : 'specific'}))} className="mt-0.5 w-4 h-4 text-primary-600 focus:ring-primary-500 bg-slate-800 border-white/10" />
                            <div className="ml-3 flex flex-col">
                              <span className={`text-sm font-bold ${modelSettings.id === model.id ? 'text-primary' : 'text-slate-200'}`}>{model.name}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <button onClick={startGeneration} className="bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-primary-500/25 flex items-center gap-2 transition-all hover:scale-105">
                <Layers className="w-5 h-5" /> Generate {variationCount} Variations
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Layers className="w-5 h-5 text-primary" /> Cloudinary AI Generation</h2>
            
            {generationError && (<div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-red-500 mb-8">{generationError}</div>)}
              {isGenerating && (
              <div className="glass-panel p-8 max-w-md mx-auto my-12 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-800"><div className="h-full bg-primary animate-pulse" style={{ width: '100%' }}></div></div>
                <div className="flex items-center gap-3 mb-6"><ImagePlus className="w-6 h-6 text-primary animate-pulse" /><h3 className="text-lg font-bold text-white tracking-widest uppercase">Generation Pipeline</h3></div>
                <ul className="space-y-4 font-mono text-sm">
                  <li className="flex items-center gap-3 text-emerald-400"><CheckCircle2 className="w-4 h-4" /> Generating on Cloudinary...</li>
                </ul>
              </div>
            )}

            {generatedResult && !isGenerating && (
              <div className="space-y-6 max-w-none">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Select Approved Creative</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-[calc(100vw-3rem)] max-w-full -mx-4 md:mx-0 px-4 md:px-0">
                  {generatedResult.variations.map((variant) => (
                    <div key={variant.id} className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 shadow-neon transition-colors flex flex-col h-full group relative">
                      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10/50 flex items-center gap-2 z-10">
                        <span className="text-xs font-bold text-primary">{variant.modelUsed || modelSettings.id}</span>
                      </div>
                      <div className="relative aspect-square flex items-center justify-center bg-black/50 p-4">
                        <img src={variant.secureUrl} alt={variant.variationName} className="max-w-full max-h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" />
                      </div>
                      <div className="p-4 bg-surface flex flex-col flex-grow justify-between gap-4 border-t border-white/5">
                        <button onClick={() => selectVariant(variant)} className="w-full bg-primary-600 hover:bg-primary text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Select for Campaign</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 5 && selectedVariant && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><LayoutTemplate className="w-6 h-6 text-primary" /> Create Marketing Assets</h2>
              </div>
            </div>

            {!transformationResult ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/5 rounded-xl overflow-hidden border border-primary/30 shadow-neon relative">
                  <img src={selectedVariant.secureUrl} alt="Selected Variant" className="w-full aspect-square object-contain" />
                </div>
                <div className="glass-panel p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Choose Platforms</h3>
                  <div className="space-y-3 mb-8">
                    {Object.entries(platformLabels).map(([key, label]) => (
                      <label key={key} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedPlatforms[key] ? 'bg-primary/10 border-primary/50 shadow-neon' : 'bg-white/5 border-white/10 hover:border-slate-500'}`}>
                        <input type="checkbox" checked={selectedPlatforms[key]} onChange={() => togglePlatform(key)} className="w-5 h-5 rounded border-white/10 text-primary-600 bg-slate-800" />
                        <span className={`ml-3 text-sm font-medium ${selectedPlatforms[key] ? 'text-primary' : 'text-slate-300'}`}>{label}</span>
                      </label>
                    ))}
                  </div>
                  {isTransforming ? (
                     <button disabled className="w-full bg-slate-800 text-slate-400 py-3 rounded-lg font-bold flex items-center justify-center gap-2"><Activity className="w-5 h-5 animate-spin" /> Processing Cloudinary Assets...</button>
                  ) : (
                    <button onClick={startTransformation} disabled={Object.values(selectedPlatforms).every(v => !v)} className="w-full btn-primary text-slate-950 py-3 rounded-lg font-bold shadow-lg">Generate Marketing Assets</button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> CAMPAIGN COMPLETE</h3>
                    <p className="text-slate-300 mt-1">1 Source Product • {variationCount} AI Variations • 1 Selected Creative • {transformationResult.assets.length} Marketing Assets</p>
                  </div>
                  <button onClick={() => navigate(`/campaigns/${campaignId}`)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                    View Campaign Details
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {transformationResult.assets.map((asset) => (
                    <div key={asset.id} className="bg-white/5 rounded-xl overflow-hidden border border-white/10 flex flex-col group">
                      <div className="bg-surface border-b border-white/5 p-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-white">{asset.platformName}</p>
                        </div>
                      </div>
                      <div className="relative flex-grow flex items-center justify-center bg-black/50 p-6 min-h-[250px]">
                        <img src={asset.secureUrl} alt={asset.platformName} className="max-w-full max-h-full shadow-2xl transition-transform duration-500 group-hover:scale-[1.03]" style={{ maxHeight: '300px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCampaign;
