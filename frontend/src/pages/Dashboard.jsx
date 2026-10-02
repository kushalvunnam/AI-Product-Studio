import React, { useState, useEffect } from 'react';
import { Layers, Sparkles, LayoutTemplate, CheckCircle2, TrendingUp, AlertCircle, ArrowRight, Image as ImageIcon, Clock, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getCampaigns } from '../services/campaignService';

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getCampaigns();
        setCampaigns(data || []);
      } catch (err) {
        setError('Failed to load campaigns.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalCampaigns = campaigns.length;
  const totalVariations = campaigns.reduce((acc, c) => acc + (c.variations?.length || 0), 0);
  const totalMarketingAssets = campaigns.reduce((acc, c) => acc + (c.marketingAssets?.length || 0), 0);
  const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;
  const successRate = totalCampaigns > 0 ? Math.round((completedCampaigns / totalCampaigns) * 100) : 0;

  const stats = [
    { label: 'Total Campaigns', value: totalCampaigns.toString(), icon: Layers, change: '+12%', trend: 'up' },
    { label: 'Generated Assets', value: (totalVariations + totalMarketingAssets).toString(), icon: Sparkles, change: '+28%', trend: 'up' },
    { label: 'Success Rate', value: `${successRate}%`, icon: CheckCircle2, change: '+5%', trend: 'up' },
    { label: 'Templates Used', value: totalMarketingAssets.toString(), icon: LayoutTemplate, change: '+45%', trend: 'up' },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="glass-card p-12 h-64 animate-pulse flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative z-10">
      
      {/* Hero Section */}
      <div className="glass-card overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary-cyan/5 opacity-50"></div>
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-all duration-700"></div>
        
        <div className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium shadow-neon">
              <Sparkles className="w-4 h-4" /> AI-Powered Studio
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
              Transform Your Product into <br/>
              <span className="text-gradient-primary">Stunning Marketing Campaigns</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl">
              Upload a product image, get AI-powered insights, generate variations and create a complete marketing kit in seconds.
            </p>
            <div className="pt-4 flex items-center gap-4">
              <Link to="/create" className="btn-primary text-lg px-8 py-3.5">
                <PlusSquare className="w-5 h-5" /> Create Campaign
              </Link>
              <button className="btn-secondary px-6 py-3.5" onClick={() => navigate('/templates')}>
                Browse Templates
              </button>
            </div>
          </div>
          
          {/* 3D Visual Representation */}
          <div className="hidden lg:flex w-80 h-80 relative items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary-cyan/20 to-primary/20 rounded-full blur-2xl animate-pulse-slow"></div>
            
            {/* Center object */}
            <div className="w-40 h-40 bg-surfaceSolid border border-white/10 rounded-2xl shadow-glass flex items-center justify-center relative z-20 animate-float">
               <ImageIcon className="w-16 h-16 text-slate-600" />
               <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(0,255,163,0.2)] pointer-events-none"></div>
            </div>
            
            {/* Orbiting cards */}
            <div className="absolute top-10 -left-10 w-24 h-24 bg-surface backdrop-blur-md border border-white/10 rounded-xl shadow-glass rotate-[-15deg] flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
              <LayoutTemplate className="w-8 h-8 text-primary" />
            </div>
            <div className="absolute bottom-10 -right-5 w-28 h-28 bg-surface backdrop-blur-md border border-white/10 rounded-xl shadow-glass rotate-[10deg] flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
               <Sparkles className="w-10 h-10 text-secondary-cyan" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="glass-card p-6 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 border border-white/5 group-hover:border-primary/30 group-hover:text-primary transition-all shadow-sm group-hover:shadow-neon">
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-white/5 ${stat.trend === 'up' ? 'text-primary' : 'text-red-400'}`}>
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:scale-[1.02] transition-transform origin-left">{stat.value}</h3>
              <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
              {/* Tiny chart line visualization */}
              <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-primary/20 to-primary rounded-full w-[70%]"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Campaigns Section */}
      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-primary" /> Recent Campaigns
          </h2>
          <Link to="/campaigns" className="text-sm text-primary hover:text-white font-medium flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {campaigns.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-slate-500 shadow-inner">
              <Layers className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No campaigns yet</h3>
            <p className="text-slate-400 mb-8 max-w-md">Create your first AI marketing campaign to start generating stunning assets.</p>
            <Link to="/create" className="btn-primary">
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {campaigns.slice(0, 6).map((campaign) => (
              <div 
                key={campaign._id} 
                onClick={() => navigate(`/campaigns/${campaign._id}`)}
                className="glass-card p-5 cursor-pointer group hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 shrink-0 rounded-xl bg-surfaceSolid overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors relative">
                    {campaign.sourceImage?.secureUrl ? (
                      <img src={campaign.sourceImage.secureUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-600" /></div>
                    )}
                    {/* Hover overlay play button */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white" fill="white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-lg truncate group-hover:text-primary transition-colors">{campaign.name || 'Untitled Campaign'}</h4>
                    <p className="text-xs text-slate-400 mb-2 truncate">{campaign.analysis?.productName || 'Pending analysis...'}</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border
                      ${campaign.status === 'completed' ? 'bg-primary/10 text-primary border-primary/30 shadow-neon' : 
                        campaign.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        'bg-secondary-cyan/10 text-secondary-cyan border-secondary-cyan/30 shadow-neon-cyan'}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                   <div>
                     <p className="text-xs text-slate-500 mb-1">Generated</p>
                     <p className="text-sm font-semibold text-slate-200">{campaign.variations?.length || 0} Assets</p>
                   </div>
                   <div>
                     <p className="text-xs text-slate-500 mb-1">Date</p>
                     <p className="text-sm font-semibold text-slate-200">{new Date(campaign.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
import { PlusSquare, History } from 'lucide-react';
export default Dashboard;
