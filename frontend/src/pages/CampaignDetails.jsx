import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, LayoutTemplate, Sparkles, Layers, Image as ImageIcon, Trash2 } from 'lucide-react';
import { getCampaignById, deleteCampaign } from '../services/campaignService';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await getCampaignById(id);
        setCampaign(data);
      } catch (err) {
        setError('Campaign not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    setIsDeleting(true);
    try {
      await deleteCampaign(id);
      navigate('/');
    } catch (err) {
      alert('Failed to delete campaign.');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="h-8 w-1/4 bg-[#F7FAFC] rounded animate-pulse"></div>
        <div className="h-64 w-full bg-[#F7FAFC]/50 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 mb-4 opacity-80" />
        <h2 className="text-xl font-bold mb-2">Campaign Not Found</h2>
        <p className="mb-6">{error}</p>
        <Link to="/" className="bg-surfaceHighlight hover:bg-slate-700 text-[#172033] px-4 py-2 rounded-lg border border-[#E4E7EC]">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link to="/" className="text-sm text-[#6B7A90] hover:text-[#172033] flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-3xl font-bold text-[#172033]">{campaign.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${campaign.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-primary-500/10 text-primary-400 border-primary-500/20'}`}>
              {campaign.status.toUpperCase()}
            </span>
            <span className="text-[#6B7A90]">Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <button 
          onClick={handleDelete} 
          disabled={isDeleting}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" /> Delete Campaign
        </button>
      </div>

      {/* PIPELINE UI */}
      <div className="space-y-12">
        
        {/* Source Image & Brief */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-[#172033] flex items-center gap-2 mb-4"><ImageIcon className="w-5 h-5 text-blue-400" /> Source Product</h3>
            {campaign.sourceImage?.secureUrl ? (
              <div className="bg-[#FFFFFF] rounded-lg overflow-hidden border border-[#E4E7EC] flex justify-center items-center h-64">
                <img src={campaign.sourceImage.secureUrl} alt="Source" className="max-w-full max-h-full object-contain" />
              </div>
            ) : <p className="text-slate-500">No source image available.</p>}
          </div>
          
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-[#172033] flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-purple-400" /> Creative Brief</h3>
            {campaign.creativeBrief ? (
              <div className="space-y-4">
                <div><p className="text-xs text-[#6B7A90] uppercase">Objective</p><p className="text-sm font-medium text-[#172033]">{campaign.creativeBrief.objective}</p></div>
                <div><p className="text-xs text-[#6B7A90] uppercase">Background</p><p className="text-sm font-medium text-[#172033]">{campaign.creativeBrief.background}</p></div>
                <div><p className="text-xs text-[#6B7A90] uppercase">Style & Mood</p><p className="text-sm font-medium text-[#172033]">{campaign.creativeBrief.visualStyle} • {campaign.creativeBrief.mood}</p></div>
                <div><p className="text-xs text-[#6B7A90] uppercase">AI Model Requested</p><p className="text-sm font-medium text-primary-400">{campaign.model?.id || 'Auto'}</p></div>
              </div>
            ) : <p className="text-slate-500">No brief available.</p>}
          </div>
        </div>

        {/* AI Variations */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-[#172033] flex items-center gap-2 mb-6"><Layers className="w-5 h-5 text-amber-400" /> Generated Variations</h3>
          {campaign.variations && campaign.variations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {campaign.variations.map((variant) => (
                <div key={variant._id || variant.id} className={`bg-[#FFFFFF] rounded-xl overflow-hidden border transition-colors ${campaign.selectedVariation?.id === (variant._id || variant.id) ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-[#E4E7EC]'}`}>
                  {campaign.selectedVariation?.id === (variant._id || variant.id) && (
                    <div className="bg-emerald-500 text-[#172033] text-xs font-bold text-center py-1 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Selected Creative
                    </div>
                  )}
                  <div className="relative aspect-square flex items-center justify-center bg-black/50 p-2">
                    {(variant.status === 'processing' || variant.status === 'pending') && (!variant.secureUrl && !variant.url && !variant.imageUrl) ? (
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
)}
                  </div>
                  <div className="p-3 bg-surface border-t border-[#E4E7EC]">
                    <p className="text-xs font-medium text-[#344054] truncate">Model: {variant.modelUsed}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-500">No variations generated.</p>}
        </div>

        {/* Marketing Kit */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-[#172033] flex items-center gap-2 mb-6"><LayoutTemplate className="w-5 h-5 text-emerald-400" /> Marketing Kit</h3>
          {campaign.marketingAssets && campaign.marketingAssets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {campaign.marketingAssets.map((asset) => (
                <div key={asset._id || asset.id} className="bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#E4E7EC] flex flex-col group">
                  <div className="bg-surface border-b border-[#E4E7EC] p-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-[#172033]">{asset.platformName}</p>
                      <p className="text-xs text-[#6B7A90]">{asset.width} × {asset.height}</p>
                    </div>
                  </div>
                  <div className="relative flex-grow flex items-center justify-center bg-black/50 p-6 min-h-[200px]">
                    <img src={asset.secureUrl} alt={asset.platformName} className="max-w-full max-h-full shadow-lg" style={{ maxHeight: '200px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-500">No marketing assets generated.</p>}
        </div>

      </div>
    </div>
  );
};

export default CampaignDetails;
