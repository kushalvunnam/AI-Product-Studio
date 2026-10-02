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
      completed: 'bg-primary/10 text-primary border-primary/20 shadow-neon',
      failed: 'bg-red-500/10 text-red-400 border-red-500/20',
      generating: 'bg-secondary-cyan/10 text-secondary-cyan border-secondary-cyan/20 shadow-neon-cyan',
      review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      draft: 'bg-[#FFFFFF] text-[#344054] border-[#E4E7EC]',
      analyzing: 'bg-secondary-cyan/10 text-secondary-cyan border-secondary-cyan/20'
    };
    return `px-3 py-1 rounded-full text-xs font-bold border ${colors[status] || colors.draft}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#172033] tracking-tight">Campaign History</h1>
          <p className="text-[#6B7A90] mt-1">Manage and track all your AI marketing campaigns</p>
        </div>
        <Link to="/create" className="btn-primary min-h-[44px]">
          New Campaign
        </Link>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-[#E4E7EC] flex flex-col md:flex-row gap-4 items-center justify-between bg-[#FFFFFF]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg pl-10 pr-4 py-2 text-sm text-[#172033] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg pl-10 pr-4 py-2 text-sm text-[#172033] focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer"
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
          <div className="p-12 flex flex-col items-center justify-center text-[#6B7A90]">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary-500" />
            <p>Loading campaigns...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-red-400">
            <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
            <p>{error}</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-[#6B7A90]">
            <div className="w-16 h-16 bg-[#F7FAFC] rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-lg font-medium text-[#172033] mb-2">No campaigns found</p>
            <p className="text-sm text-slate-500">Try adjusting your filters or create a new campaign.</p>
          </div>
        ) : (
<div className="w-full">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FFFFFF] text-[#344054] text-sm font-bold border-b border-[#E4E7EC] uppercase tracking-wider text-xs">
                    <th className="p-4 pl-6 font-medium">Campaign Name</th>
                    <th className="p-4 font-medium">Product</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Variations</th>
                    <th className="p-4 font-medium">Date Created</th>
                    <th className="p-4 pr-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC]">
                  {filteredCampaigns.map(campaign => (
                    <tr key={campaign._id} className="hover:hover:bg-[#F7FAFC] transition-colors group cursor-pointer" onClick={() => navigate(`/campaigns/${campaign._id}`)}>
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-lg bg-[#F7FAFC] flex items-center justify-center overflow-hidden border border-[#E4E7EC]">
                            {campaign.sourceImage?.secureUrl ? (
                              <img src={campaign.sourceImage.secureUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <PlayCircle className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#172033] group-hover:text-primary-400 transition-colors truncate">{campaign.name || 'Untitled Campaign'}</p>
                            <p className="text-xs text-slate-500 truncate">ID: {campaign._id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[#344054] truncate max-w-[120px]">{campaign.analysis?.productName || '-'}</td>
                      <td className="p-4">
                        <span className={getStatusBadge(campaign.status)}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[#344054]">
                        {campaign.variations?.length || 0} generated
                      </td>
                      <td className="p-4 text-sm text-[#6B7A90]">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/campaigns/${campaign._id}`); }}
                          className="text-[#6B7A90] hover:text-primary-400 p-2 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y divide-[#E4E7EC]">
              {filteredCampaigns.map(campaign => (
                <div key={campaign._id} className="p-4 flex flex-col gap-3 hover:hover:bg-[#F7FAFC] transition-colors active:bg-[#F7FAFC]" onClick={() => navigate(`/campaigns/${campaign._id}`)}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 shrink-0 rounded-lg bg-[#F7FAFC] flex items-center justify-center overflow-hidden border border-[#E4E7EC]">
                      {campaign.sourceImage?.secureUrl ? (
                        <img src={campaign.sourceImage.secureUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <PlayCircle className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#172033] truncate">{campaign.name || 'Untitled Campaign'}</p>
                      <p className="text-xs text-slate-500 mb-1 truncate">{campaign.analysis?.productName || 'No product name'}</p>
                      <span className={getStatusBadge(campaign.status)}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E4E7EC]">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500">Variations</span>
                      <span className="text-sm text-[#344054] font-medium">{campaign.variations?.length || 0}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500">Date</span>
                      <span className="text-sm text-[#344054] font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/campaigns/${campaign._id}`); }}
                      className="text-primary-400 hover:text-primary-300 transition-colors p-2"
                      aria-label="View campaign"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaigns;
