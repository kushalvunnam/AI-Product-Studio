const fs = require('fs');

const createDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
createDir('frontend/src/pages');

// 1. Campaign History
const campaignsJsx = `import React, { useState, useEffect } from 'react';
import { getCampaigns } from '../services/campaignService';
import { Search, Filter, ArrowUpDown, Loader2, PlayCircle, Eye, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getCampaigns();
        setCampaigns(data || []);
      } catch (err) {
        setError('Failed to load campaigns.');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || 
                          c.analysis?.productName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const colors = {
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      failed: 'bg-red-500/10 text-red-400 border-red-500/20',
      generating: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      analyzing: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };
    return \`px-3 py-1 rounded-full text-xs font-medium border \${colors[status] || colors.draft}\`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Campaign History</h1>
          <p className="text-slate-400 mt-1">Manage and track all your AI marketing campaigns</p>
        </div>
        <Link to="/create" className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-primary-500/20 transition-all hover:scale-105">
          New Campaign
        </Link>
      </div>

      <div className="bg-surface border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="generating">Generating</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary-500" />
            <p>Loading campaigns...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-red-400">
            <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
            <p>{error}</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-lg font-medium text-white mb-2">No campaigns found</p>
            <p className="text-sm text-slate-500">Try adjusting your filters or create a new campaign.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 text-sm font-medium border-b border-slate-800">
                  <th className="p-4 pl-6 font-medium">Campaign Name</th>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Variations</th>
                  <th className="p-4 font-medium">Date Created</th>
                  <th className="p-4 pr-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredCampaigns.map(campaign => (
                  <tr key={campaign._id} className="hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => navigate(\`/campaigns/\${campaign._id}\`)}>
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                          {campaign.sourceImage?.secureUrl ? (
                            <img src={campaign.sourceImage.secureUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <PlayCircle className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200 group-hover:text-primary-400 transition-colors">{campaign.name || 'Untitled Campaign'}</p>
                          <p className="text-xs text-slate-500">ID: {campaign._id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{campaign.analysis?.productName || '-'}</td>
                    <td className="p-4">
                      <span className={getStatusBadge(campaign.status)}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      {campaign.variations?.length || 0} generated
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(\`/campaigns/\${campaign._id}\`); }}
                        className="text-slate-400 hover:text-primary-400 p-2 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
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

export default Campaigns;
`;
fs.writeFileSync('frontend/src/pages/Campaigns.jsx', campaignsJsx);

// 2. Templates
const templatesJsx = `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, PlusCircle, MonitorSmartphone, Share2, ShoppingBag } from 'lucide-react';

const Templates = () => {
  const navigate = useNavigate();

  const templates = [
    { id: 1, name: 'Product Launch', desc: 'High-impact visuals for new product announcements.', icon: <MonitorSmartphone className="w-6 h-6 text-blue-400"/>, platform: 'Multi-platform' },
    { id: 2, name: 'Social Media Ad', desc: 'Optimized engaging ads for Facebook & Instagram.', icon: <Share2 className="w-6 h-6 text-pink-400"/>, platform: 'Social Media' },
    { id: 3, name: 'E-commerce Listing', desc: 'Clean, professional white-background product cards.', icon: <ShoppingBag className="w-6 h-6 text-emerald-400"/>, platform: 'E-commerce' },
    { id: 4, name: 'Festival Promotion', desc: 'Themed vibrant backgrounds for seasonal sales.', icon: <LayoutTemplate className="w-6 h-6 text-amber-400"/>, platform: 'Promotional' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Marketing Templates</h1>
        <p className="text-slate-400 mt-1">Jumpstart your campaign with pre-configured creative setups</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(t => (
          <div key={t.id} className="bg-surface border border-slate-800 rounded-xl p-6 hover:border-primary-500/50 transition-colors group flex flex-col">
            <div className="w-12 h-12 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {t.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">{t.name}</h3>
            <p className="text-sm text-slate-400 mb-4 flex-grow">{t.desc}</p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.platform}</span>
              <button 
                onClick={() => navigate('/create')}
                className="flex items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;
`;
fs.writeFileSync('frontend/src/pages/Templates.jsx', templatesJsx);

// 3. Analytics
const analyticsJsx = `import React, { useState, useEffect } from 'react';
import { getCampaigns } from '../services/campaignService';
import { BarChart3, TrendingUp, Image as ImageIcon, CheckCircle2, XCircle, Clock } from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState({ total: 0, completed: 0, failed: 0, generating: 0, variations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const campaigns = await getCampaigns();
        if (campaigns) {
          const total = campaigns.length;
          const completed = campaigns.filter(c => c.status === 'completed').length;
          const failed = campaigns.filter(c => c.status === 'failed').length;
          const generating = campaigns.filter(c => c.status === 'generating' || c.status === 'review').length;
          const variations = campaigns.reduce((acc, c) => acc + (c.variations?.length || 0), 0);
          setStats({ total, completed, failed, generating, variations });
        }
      } catch (err) {
        console.error("Analytics fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-surface border border-slate-800 rounded-xl p-6 flex items-center gap-4">
      <div className={\`w-12 h-12 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800 \${color}\`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-white">{loading ? '-' : value}</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Performance Analytics</h1>
        <p className="text-slate-400 mt-1">Overview of your marketing campaign generations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Campaigns" value={stats.total} icon={<BarChart3 className="w-6 h-6" />} color="text-blue-400" />
        <StatCard title="Total Variations" value={stats.variations} icon={<ImageIcon className="w-6 h-6" />} color="text-indigo-400" />
        <StatCard title="Completed" value={stats.completed} icon={<CheckCircle2 className="w-6 h-6" />} color="text-emerald-400" />
        <StatCard title="Currently Processing" value={stats.generating} icon={<Clock className="w-6 h-6" />} color="text-amber-400" />
        <StatCard title="Failed Generations" value={stats.failed} icon={<XCircle className="w-6 h-6" />} color="text-red-400" />
        <StatCard title="Success Rate" value={stats.total ? Math.round((stats.completed / stats.total) * 100) + '%' : '0%'} icon={<TrendingUp className="w-6 h-6" />} color="text-primary-400" />
      </div>

      <div className="bg-surface border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
         <BarChart3 className="w-16 h-16 text-slate-700 mb-4" />
         <h3 className="text-xl font-bold text-slate-300">Detailed Charts Coming Soon</h3>
         <p className="text-slate-500 text-center max-w-md mt-2">More historical data is required to generate meaningful cohort analysis and conversion charts.</p>
      </div>
    </div>
  );
};

export default Analytics;
`;
fs.writeFileSync('frontend/src/pages/Analytics.jsx', analyticsJsx);

// 4. Settings
const settingsJsx = `import React, { useState } from 'react';
import { User, Mail, Shield, CheckCircle2, XCircle } from 'lucide-react';

const Settings = () => {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ name: 'ProductStudio User', email: 'user@productstudio.ai', plan: 'Pro Tier' });
  const [tempProfile, setTempProfile] = useState({ ...profile });
  const [status, setStatus] = useState(null); // 'saving', 'success', 'error'

  const handleSave = () => {
    setStatus('saving');
    setTimeout(() => {
      setProfile(tempProfile);
      setEditing(false);
      setStatus('success');
      setTimeout(() => setStatus(null), 3000);
    }, 800);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-slate-400 mt-1">Manage your profile and platform preferences</p>
      </div>

      {status === 'success' && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" /> Profile updated successfully.
        </div>
      )}

      <div className="bg-surface border border-slate-800 rounded-xl overflow-hidden shadow-xl mb-8">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2"><User className="w-5 h-5 text-primary-400"/> Profile Information</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-primary-500/30 flex items-center justify-center text-2xl font-bold text-primary-400 uppercase">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{profile.name}</h3>
              <p className="text-slate-400">{profile.plan}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
              {editing ? (
                <input type="text" value={tempProfile.name} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
              ) : (
                <div className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2 text-slate-200">{profile.name}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
              <div className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2 text-slate-500 flex items-center gap-2 cursor-not-allowed">
                <Mail className="w-4 h-4" /> {profile.email}
              </div>
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-4">
          {editing ? (
            <>
              <button onClick={() => {setEditing(false); setTempProfile(profile);}} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={status==='saving'} className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Shield className="w-5 h-5 text-amber-400"/> Security & Integrations</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-400 mb-4">Groq Vision API: <span className="text-emerald-400 font-medium">Connected</span></p>
          <p className="text-slate-400 mb-6">Cloudinary API: <span className="text-emerald-400 font-medium">Connected</span></p>
          <button className="text-red-400 hover:text-red-300 font-medium px-4 py-2 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
import { Loader2 } from 'lucide-react';
export default Settings;
`;
fs.writeFileSync('frontend/src/pages/Settings.jsx', settingsJsx);

// Update App.jsx routing
let appJsx = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// Add imports
if (!appJsx.includes('import Campaigns')) {
  appJsx = appJsx.replace("import CampaignDetails from './pages/CampaignDetails';", "import CampaignDetails from './pages/CampaignDetails';\nimport Campaigns from './pages/Campaigns';\nimport Templates from './pages/Templates';\nimport Analytics from './pages/Analytics';\nimport Settings from './pages/Settings';");
}

// Replace coming soon div routes
appJsx = appJsx.replace(/<Route path="campaigns" element=\{<div.*?<\/div>\} \/>/g, '<Route path="campaigns" element={<Campaigns />} />');
appJsx = appJsx.replace(/<Route path="templates" element=\{<div.*?<\/div>\} \/>/g, '<Route path="templates" element={<Templates />} />');
appJsx = appJsx.replace(/<Route path="analytics" element=\{<div.*?<\/div>\} \/>/g, '<Route path="analytics" element={<Analytics />} />');
appJsx = appJsx.replace(/<Route path="settings" element=\{<div.*?<\/div>\} \/>/g, '<Route path="settings" element={<Settings />} />');

fs.writeFileSync('frontend/src/App.jsx', appJsx);
console.log('Finished scaffolding pages and updating App.jsx');
