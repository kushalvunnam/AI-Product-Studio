import React, { useState, useEffect } from 'react';
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
    return `px-3 py-1 rounded-full text-xs font-medium border ${colors[status] || colors.draft}`;
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
                  <tr key={campaign._id} className="hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => navigate(`/campaigns/${campaign._id}`)}>
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
                        onClick={(e) => { e.stopPropagation(); navigate(`/campaigns/${campaign._id}`); }}
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
