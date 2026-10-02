import React, { useState, useEffect } from 'react';
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
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800 ${color}`}>
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
