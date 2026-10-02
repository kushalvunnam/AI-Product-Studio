const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/CreateCampaign.jsx', 'utf8');

// 1. Add import
if (!content.includes('getGenerationStatus')) {
  content = content.replace(
    /import \{ uploadProductImage, analyzeProductImage, generateCampaignVariations, API_BASE_URL \} from '\.\.\/services\/api';/,
    "import { uploadProductImage, analyzeProductImage, generateCampaignVariations, getGenerationStatus, API_BASE_URL } from '../services/api';"
  );
}

// 2. Add new states
if (!content.includes('const [generationStatus, setGenerationStatus] =')) {
  content = content.replace(
    /const \[generationProgress, setGenerationProgress\] = useState\(0\);/,
    `const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState({ message: 'Preparing generation', completed: 0, total: 4 });
  const pollingRef = useRef(null);`
  );
}

// 3. Replace startGeneration
const startGenerationMatch = content.match(/const startGeneration = async \(\) => \{[\s\S]*?const selectVariant =/);
if (startGenerationMatch) {
  const newStartGeneration = `const startGeneration = async () => {
    if (!sourceImage || !analysis || isGenerating) return;
    setStep(4); 
    setIsGenerating(true); 
    setGenerationError(null); 
    setGenerationStatus({ message: 'Starting AI generation service...', completed: 0, total: variationCount });
    
    try {
      if (campaignId) {
        await updateCampaign(campaignId, { 
          creativeBrief, 
          model: modelSettings, 
          status: 'generating', 
          name: creativeBrief.campaignName 
        });
      }
      
      const result = await generateCampaignVariations({ 
        campaignId, 
        sourceImage, 
        analysis, 
        creativeBrief, 
        model: modelSettings, 
        variationCount 
      });
      
      if (result.isAsync && result.jobId) {
        setGenerationStatus(prev => ({ ...prev, message: 'AI generation started' }));
        
        let pollCount = 0;
        const maxPolls = 45; // 45 * 2s = 90 seconds timeout
        
        if (pollingRef.current) clearInterval(pollingRef.current);
        
        pollingRef.current = setInterval(async () => {
          try {
            pollCount++;
            if (pollCount > maxPolls) {
              clearInterval(pollingRef.current);
              setGenerationError('Generation is taking longer than expected.');
              setIsGenerating(false);
              return;
            }
            
            const statusData = await getGenerationStatus(result.jobId);
            const { status, mappedStatus, completed, total, variations, error } = statusData;
            
            setGenerationStatus({ 
              message: \`Generating variations... \${completed} / \${total} completed\`,
              completed, 
              total 
            });
            
            // Check for early partial success
            const validVariations = variations ? variations.filter(v => v.secureUrl && v.status !== 'failed') : [];
            const hasFailed = variations && variations.some(v => v.status === 'failed' || v.error);
            
            if (mappedStatus === 'completed' || mappedStatus === 'partial' || mappedStatus === 'failed') {
              clearInterval(pollingRef.current);
              
              if (validVariations.length > 0) {
                setGeneratedResult({ success: true, variations: validVariations, hasFailed });
                const firstVariant = validVariations[0];
                setSelectedVariant(firstVariant);
                if (campaignId) await updateCampaign(campaignId, { selectedVariation: firstVariant });
                setIsGenerating(false);
                setStep(5);
              } else if (mappedStatus === 'failed' || error || (variations && variations.length > 0)) {
                setGenerationError(error || 'Failed to generate valid variations.');
                setIsGenerating(false);
              } else {
                setGenerationError('Generation failed on the server. Please try again.');
                setIsGenerating(false);
              }
            }
          } catch (pollErr) {
            console.error('Polling error:', pollErr);
            // Don't kill polling on a transient network error, just let it loop until timeout
          }
        }, 2000);
      } else {
        // Sync response
        if (result && result.variations && result.variations.length > 0) {
          setGeneratedResult(result);
          if (campaignId) await updateCampaign(campaignId, { variations: result.variations, status: 'review' });
          const firstVariant = result.variations[0];
          setSelectedVariant(firstVariant);
          if (campaignId) await updateCampaign(campaignId, { selectedVariation: firstVariant });
          setIsGenerating(false);
          setStep(5);
        } else {
          throw new Error('No variations generated');
        }
      }
    } catch (err) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      setGenerationError(err.message || 'Generation failed.');
      if (campaignId) { try { await updateCampaign(campaignId, { status: 'failed' }); } catch(e) {} }
      setIsGenerating(false);
    }
  };

  // Cleanup on unmount
  import { useEffect } from 'react'; // ensure useEffect is imported
  // wait we already have imports. I'll just use React.useEffect if needed, but CreateCampaign doesn't use unmount cleanup for interval.
  
  const selectVariant =`;
  
  content = content.replace(startGenerationMatch[0], newStartGeneration);
}

// 4. Replace generation UI
const generatingUIMatch = content.match(/\{isGenerating && \([\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)\}/);
if (generatingUIMatch) {
  const newGeneratingUI = `{isGenerating && (
    <div className="glass-panel p-8 max-w-md mx-auto my-12 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: \`\${Math.max(5, (generationStatus.completed / generationStatus.total) * 100)}%\` }}></div>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <ImagePlus className="w-6 h-6 text-primary animate-pulse" />
        <h3 className="text-lg font-bold text-white tracking-widest uppercase">Generation Pipeline</h3>
      </div>
      <ul className="space-y-4 font-mono text-sm">
        <li className="flex items-center gap-3 text-emerald-400">
          <Activity className="w-4 h-4 animate-spin" /> 
          {generationStatus.message}
        </li>
      </ul>
    </div>
  )}`;
  content = content.replace(generatingUIMatch[0], newGeneratingUI);
}

// 5. Replace disabled check on button
content = content.replace(/disabled=\{isGenerating\}/g, 'disabled={isGenerating}');

// Make sure to add Activity icon if missing, actually Activity is already in lucide-react imports
// Also add useEffect to imports
if (!content.includes('useEffect')) {
  content = content.replace(/import \{ useState, useRef, useCallback \} from 'react';/, "import { useState, useRef, useCallback, useEffect } from 'react';");
}

// Add cleanup hook
if (!content.includes('useEffect(() => { return () => { if (pollingRef.current)')) {
  content = content.replace(
    /const \[generationProgress, setGenerationProgress\] = useState\(0\);/g,
    `const [generationProgress, setGenerationProgress] = useState(0);
  useEffect(() => { return () => { if (pollingRef?.current) clearInterval(pollingRef.current); } }, []);`
  );
}

fs.writeFileSync('frontend/src/pages/CreateCampaign.jsx', content);
console.log('Fixed CreateCampaign.jsx');
