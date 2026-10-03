const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/CampaignDetails.jsx', 'utf8');

const target = '<img src={variant.secureUrl} alt={variant.variationName} className="max-w-full max-h-full object-contain" />';

const replacement = `{(variant.status === 'processing' || variant.status === 'pending') && (!variant.secureUrl && !variant.url && !variant.imageUrl) ? (
  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
    <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-xs font-medium">Generating...</span>
  </div>
) : (variant.status === 'failed' || variant.status === 'timeout') && (!variant.secureUrl && !variant.url && !variant.imageUrl) ? (
  <div className="flex flex-col items-center justify-center text-red-400 gap-2">
    <span className="text-xs font-medium">Generation Failed</span>
  </div>
) : (
  <img 
    src={variant.secureUrl || variant.imageUrl || variant.url} 
    alt={variant.variationName} 
    className="max-w-full max-h-full object-contain" 
    onError={(e) => {
      console.error('[VARIATION IMAGE ERROR]', { src: e.currentTarget.src, variant });
      e.currentTarget.style.display = 'none';
    }}
  />
)}`;

content = content.replace(target, replacement);
fs.writeFileSync('frontend/src/pages/CampaignDetails.jsx', content);
