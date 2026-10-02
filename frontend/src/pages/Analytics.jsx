import React, { useState, useEffect, useMemo } from 'react';
import { getCampaigns } from '../services/campaignService';
import { BarChart3, TrendingUp, Image as ImageIcon, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from 'recharts';

const Analytics = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCampaigns();
      if (data) {
        setCampaigns(data);
      }
    } catch (err) {
      console.error("Analytics fetch failed", err);
      setError("Unable to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = useMemo(() => {
    if (!campaigns) return null;
    const total = campaigns.length;
    const completed = campaigns.filter(c => c.status === 'completed').length;
    const failed = campaigns.filter(c => c.status === 'failed').length;
    const processing = campaigns.filter(c => !['completed', 'failed', 'draft'].includes(c.status)).length;
    
    let totalVariations = 0;
    let successfulVariations = 0;
    let failedVariations = 0;
    
    campaigns.forEach(c => {
      if (c.variations && c.variations.length > 0) {
        totalVariations += c.variations.length;
        successfulVariations += c.variations.filter(v => v.status === 'success' || !v.status).length;
        failedVariations += c.variations.filter(v => v.status === 'failed').length;
      }
    });

    const pendingVariations = Math.max(0, (processing * 4) - successfulVariations - failedVariations); 
    const finalTotalVariations = totalVariations + pendingVariations;

    // Daily activity
    const activityMap = {};
    campaigns.forEach(c => {
      const date = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!activityMap[date]) activityMap[date] = 0;
      activityMap[date]++;
    });
    
    const activity = Object.keys(activityMap).map(date => ({
      date,
      campaigns: activityMap[date]
    })).reverse(); // chronological

    return {
      total, completed, failed, processing,
      totalVariations: finalTotalVariations,
      successfulVariations, failedVariations, pendingVariations,
      activity
    };
  }, [campaigns]);

  const StatCard = ({ title, value, icon, color }) => (
    <div className="glass-card p-6 flex items-center gap-4 group hover:-translate-y-1 transition-transform">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-200 group-hover:border-${color.split("-")[1]}-500/30 ${color} shadow-sm group-hover:shadow-md transition-all`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">
          {loading ? <div className="h-8 w-16 bg-slate-50 animate-pulse rounded mt-1"></div> : value}
        </p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{error}</h2>
        <button onClick={fetchStats} className="mt-4 px-6 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (!loading && stats && stats.total === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-white shadow-sm rounded-full flex items-center justify-center mb-6">
          <BarChart3 className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No campaign data yet</h2>
        <p className="text-slate-500 mb-8 max-w-md">Create your first campaign to start seeing analytics.</p>
        <Link to="/create" className="px-6 py-3 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg shadow-md transition-all">
          + Create Campaign
        </Link>
      </div>
    );
  }

  const COLORS = {
    completed: '#10b981', // emerald-500
    processing: '#f59e0b', // amber-500
    failed: '#ef4444', // red-500
    primary: '#00FFA3', // neon green
    slate: '#94a3b8' // slate-400
  };

  const campaignStatusData = stats ? [
    { name: 'Completed', value: stats.completed, color: COLORS.completed },
    { name: 'Processing', value: stats.processing, color: COLORS.processing },
    { name: 'Failed', value: stats.failed, color: COLORS.failed },
  ].filter(d => d.value > 0) : [];

  const variationData = stats ? [
    { name: 'Successful', value: stats.successfulVariations, color: COLORS.completed },
    { name: 'Pending', value: stats.pendingVariations, color: COLORS.processing },
    { name: 'Failed', value: stats.failedVariations, color: COLORS.failed },
  ].filter(d => d.value > 0) : [];

  const barData = stats ? [
    { name: 'Campaigns', Total: stats.total, Completed: stats.completed, Failed: stats.failed }
  ] : [];

  const successRate = stats && stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const strokeDasharray = 283; // 2 * pi * r (r=45)
  const strokeDashoffset = strokeDasharray - (strokeDasharray * successRate) / 100;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-200 p-3 rounded-lg shadow-xl">
          <p className="text-slate-800 font-medium">{payload[0].name || payload[0].payload.name || payload[0].payload.date}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-bold">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Performance Analytics</h1>
        <p className="text-slate-500 mt-1">Overview of your marketing campaign generations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <StatCard title="Total Campaigns" value={stats?.total || 0} icon={<BarChart3 className="w-6 h-6" />} color="text-blue-400" />
        <StatCard title="Total Variations" value={stats?.totalVariations || 0} icon={<ImageIcon className="w-6 h-6" />} color="text-indigo-400" />
        <StatCard title="Completed" value={stats?.completed || 0} icon={<CheckCircle2 className="w-6 h-6" />} color="text-emerald-400" />
        <StatCard title="Currently Processing" value={stats?.processing || 0} icon={<Clock className="w-6 h-6" />} color="text-amber-400" />
        <StatCard title="Failed Generations" value={stats?.failed || 0} icon={<XCircle className="w-6 h-6" />} color="text-red-400" />
        <StatCard title="Success Rate" value={stats && stats.total ? `${successRate}%` : 'No data yet'} icon={<TrendingUp className="w-6 h-6" />} color="text-primary" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 h-[400px] animate-pulse"></div>
          <div className="glass-card p-6 h-[400px] animate-pulse"></div>
          <div className="glass-card p-6 h-[400px] animate-pulse"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Campaign Status */}
            <div className="glass-card p-6 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Campaign Status</h3>
              <div className="flex-1 min-h-[250px] relative">
                {campaignStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={campaignStatusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {campaignStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500">No Data</div>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm text-slate-500">Total</span>
                  <span className="text-2xl font-bold text-slate-800">{stats.total}</span>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-4 text-sm text-slate-600 flex-wrap">
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Completed</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Processing</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Failed</div>
              </div>
            </div>

            {/* Variation Generation */}
            <div className="glass-card p-6 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Variation Generation</h3>
              <div className="flex-1 min-h-[250px] relative">
                {variationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={variationData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {variationData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500">No Data</div>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm text-slate-500">Total</span>
                  <span className="text-2xl font-bold text-slate-800">{stats.totalVariations}</span>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-4 text-sm text-slate-600 flex-wrap">
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Successful</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Pending</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Failed</div>
              </div>
            </div>

            {/* Success Rate Progress */}
            <div className="glass-card p-6 flex flex-col items-center justify-center">
              <h3 className="text-lg font-bold text-slate-800 mb-6 self-start w-full">Success Rate</h3>
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800/5" />
                  <circle 
                    cx="96" cy="96" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    className="text-primary transition-all duration-1000 ease-out" 
                    strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-slate-800">{successRate}%</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider mt-1">Success Rate</span>
                </div>
              </div>
            </div>
            
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Performance Bar Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Campaign Performance</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#ffffff05'}} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    <Bar dataKey="Completed" fill={COLORS.completed} radius={[4, 4, 0, 0]} maxBarSize={50} />
                    <Bar dataKey="Failed" fill={COLORS.failed} radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Generation Activity */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Generation Activity</h3>
              <div className="h-[300px] w-full">
                {stats.activity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.activity} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="campaigns" name="Campaigns" stroke={COLORS.primary} strokeWidth={3} dot={{r: 4, fill: COLORS.primary, strokeWidth: 0}} activeDot={{r: 6, fill: '#fff', stroke: COLORS.primary, strokeWidth: 2}} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                    <TrendingUp className="w-12 h-12 mb-3 opacity-20" />
                    <p>No historical data available yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Generations Table */}
          <div className="glass-card p-0 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Recent Generations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white shadow-sm">
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Variations</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {campaigns.slice(0, 5).map(c => (
                    <tr key={c._id} className="hover:bg-white shadow-sm transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{c.name}</div>
                        <div className="text-xs text-slate-500">{c._id.substring(0, 8)}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          c.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          c.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {c.variations?.length || 0}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {campaigns.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-500">No recent generations found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
