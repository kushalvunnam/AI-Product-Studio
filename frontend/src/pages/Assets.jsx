import { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Filter, 
  Search,
  Download,
  Link as LinkIcon,
  CheckCircle2,
  Sparkles,
  LayoutTemplate
} from 'lucide-react';
import { getCampaigns } from '../services/campaignService';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const campaigns = await getCampaigns();
        
        let allAssets = [];
        
        campaigns.forEach(campaign => {
          // Add source image
          if (campaign.sourceImage?.secureUrl) {
            allAssets.push({
              id: `src_${campaign._id}`,
              type: 'original',
              url: campaign.sourceImage.secureUrl,
              campaignName: campaign.name,
              createdAt: campaign.createdAt,
              dimensions: `${campaign.sourceImage.width}x${campaign.sourceImage.height}`,
              format: campaign.sourceImage.format,
              platform: null
            });
          }
          
          // Add variations
          if (campaign.variations) {
            campaign.variations.forEach(v => {
              allAssets.push({
                id: v._id || v.id,
                type: 'ai-generated',
                url: v.secureUrl,
                campaignName: campaign.name,
                createdAt: v.createdAt || campaign.createdAt,
                dimensions: null,
                modelUsed: v.modelUsed,
                platform: null
              });
            });
          }
          
          // Add marketing assets
          if (campaign.marketingAssets) {
            campaign.marketingAssets.forEach(m => {
              allAssets.push({
                id: m._id || m.id,
                type: 'marketing',
                url: m.secureUrl,
                campaignName: campaign.name,
                createdAt: m.createdAt || campaign.createdAt,
                dimensions: `${m.width}x${m.height}`,
                format: m.format,
                platform: m.platformName || m.platform
              });
            });
          }
        });
        
        setAssets(allAssets.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        console.error('Error fetching assets:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssets();
  }, []);

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    // Could add a toast notification here
  };

  const filteredAssets = assets.filter(asset => {
    if (filterType !== 'all' && asset.type !== filterType) return false;
    
    if (filterPlatform !== 'all') {
      if (asset.type !== 'marketing') return false; // Non-marketing assets don't have platforms
      if (asset.platform?.toLowerCase() !== filterPlatform.toLowerCase() && 
          !asset.platform?.toLowerCase().includes(filterPlatform.toLowerCase())) return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!asset.campaignName?.toLowerCase().includes(query) && 
          !asset.platform?.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div><h1 className="text-3xl font-bold text-white mb-2">Asset Library</h1><p className="text-slate-400">Loading your assets...</p></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="aspect-square bg-slate-800/50 rounded-xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Asset Library</h1>
          <p className="text-slate-400">Manage all your source products, AI variations, and final marketing assets.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 focus:ring-primary-500 focus:border-primary-500 outline-none">
              <option value="all">All Asset Types</option>
              <option value="original">Original Products</option>
              <option value="ai-generated">AI Generated Variations</option>
              <option value="marketing">Marketing Assets</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <LayoutTemplate className="w-4 h-4 text-slate-400" />
            <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 focus:ring-primary-500 focus:border-primary-500 outline-none">
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="story">Story</option>
              <option value="website">Website</option>
              <option value="advertisement">Advertisement</option>
              <option value="product card">Product Card</option>
            </select>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search campaigns..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="glass-panel p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-500">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No assets found</h3>
          <p className="text-slate-400 max-w-md">Try adjusting your filters or generate some new marketing assets in a campaign.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 group hover:border-primary-500/50 transition-colors flex flex-col h-full">
              
              <div className="relative aspect-square flex items-center justify-center bg-black/50 p-2 overflow-hidden">
                <div className="absolute top-2 left-2 z-10 flex gap-1">
                  {asset.type === 'original' && <span className="bg-blue-500/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Source</span>}
                  {asset.type === 'ai-generated' && <span className="bg-purple-500/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Variant</span>}
                  {asset.type === 'marketing' && <span className="bg-emerald-500/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"><LayoutTemplate className="w-3 h-3" /> {asset.platform}</span>}
                </div>
                
                <img src={asset.url} alt={asset.campaignName} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button onClick={() => window.open(asset.url, '_blank')} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                    Preview Full
                  </button>
                  <button onClick={() => handleCopyLink(asset.url)} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" /> Copy URL
                  </button>
                </div>
              </div>

              <div className="p-3 bg-surface border-t border-slate-800 flex flex-col flex-grow justify-between gap-2">
                <p className="text-sm font-semibold text-white truncate" title={asset.campaignName}>{asset.campaignName}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  {asset.dimensions ? <span>{asset.dimensions}</span> : <span>{asset.modelUsed}</span>}
                  <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assets;
