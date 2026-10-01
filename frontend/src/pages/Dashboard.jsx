import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Layers, 
  LayoutTemplate,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCampaigns } from '../services/campaignService';

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getCampaigns();
        setCampaigns(data || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load campaigns.');
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // Calculate Metrics
  const totalCampaigns = campaigns.length;
  const totalVariations = campaigns.reduce((acc, c) => acc + (c.variations?.length || 0), 0);
  const totalMarketingAssets = campaigns.reduce((acc, c) => acc + (c.marketingAssets?.length || 0), 0);
  const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;

  const stats = [
    { label: 'Total Campaigns', value: totalCampaigns.toString(), icon: Layers, change: '+12%', trend: 'up' },
    { label: 'AI Variations', value: totalVariations.toString(), icon: Sparkles, change: '+28%', trend: 'up' },
    { label: 'Marketing Assets', value: totalMarketingAssets.toString(), icon: LayoutTemplate, change: '+45%', trend: 'up' },
    { label: 'Completed', value: completedCampaigns.toString(), icon: CheckCircle2, change: '+8%', trend: 'up' },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Loading your campaign metrics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="glass-panel p-6 h-32 animate-pulse bg-slate-800/50"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome back. Here's what's happening with your products today.</p>
        </div>
        <Link 
          to="/create" 
          className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> New Campaign
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="glass-panel p-6 hover-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-surfaceHighlight flex items-center justify-center text-primary-400 border border-slate-700">
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Campaigns Section */}
      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recent Campaigns</h2>
          <Link to="/campaigns" className="text-sm text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {campaigns.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-500">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No campaigns yet</h3>
            <p className="text-slate-400 mb-6">Create your first AI marketing campaign to see it here.</p>
            <Link to="/create" className="bg-surfaceHighlight hover:bg-slate-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors border border-slate-700">
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50">
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-800">Campaign</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-800">Status</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-800">Variations</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-800">Assets</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-800">Created</th>
                  <th className="p-4 border-b border-slate-800"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {campaigns.slice(0, 5).map((campaign) => (
                  <tr key={campaign._id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-slate-800 overflow-hidden border border-slate-700">
                          {campaign.sourceImage?.secureUrl ? (
                            <img src={campaign.sourceImage.secureUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-full h-full p-2 text-slate-600" />
                          )}
                        </div>
                        <span className="font-semibold text-slate-200">{campaign.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                        ${campaign.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          campaign.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-primary-500/10 text-primary-400 border-primary-500/20'}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{campaign.variations?.length || 0}</td>
                    <td className="p-4 text-slate-300">{campaign.marketingAssets?.length || 0}</td>
                    <td className="p-4 text-slate-400 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Link to={`/campaigns/${campaign._id}`} className="opacity-0 group-hover:opacity-100 text-sm font-medium text-primary-400 hover:text-primary-300 transition-all mr-2">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
