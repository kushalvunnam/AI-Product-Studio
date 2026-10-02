const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

const dashboardJsx = `
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Layers, Image as ImageIcon, TrendingUp, ArrowRight, Wand2, Plus } from 'lucide-react';
import { getCampaigns } from '../services/campaignService';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, completed: 0, variations: 0 });

  useEffect(() => {
    getCampaigns().then(campaigns => {
      if (campaigns) {
        setStats({
          total: campaigns.length,
          completed: campaigns.filter(c => c.status === 'completed' || c.status === 'review').length,
          variations: campaigns.reduce((acc, c) => acc + (c.variations?.length || 0), 0)
        });
      }
    }).catch(console.error);
  }, []);

  const successRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <div className="relative glass-panel p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 mt-4">
        {/* Decorative Spheres */}
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#00d2ff]/20 to-[#3a7bd5]/20 blur-3xl -z-10 animate-pulse-glow" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#8a2be2]/15 to-[#ff69b4]/15 blur-3xl -z-10 animate-pulse-glow" style={{ animationDelay: '2s' }} />

        <div className="w-full md:w-1/2 space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#00d2ff]/10 to-[#3a7bd5]/10 border border-[#00d2ff]/20 text-[#3a7bd5] font-medium text-sm shadow-sm animate-float">
            <Sparkles className="w-4 h-4 text-[#00d2ff]" /> Premium Creative Workspace
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-[1.15] tracking-tight">
            Transform Your Product Into <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] via-[#3a7bd5] to-[#8a2be2]">
              AI-Powered Marketing Campaigns
            </span>
          </h1>
          <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
            Generate photorealistic variations, lifestyle composites, and full marketing kits instantly using advanced AI vision models.
          </p>
          <div className="pt-4 flex gap-4">
            <Link to="/create" className="btn-primary py-3 px-8 text-base shadow-[0_10px_30px_rgba(0,210,255,0.3)]">
              <Plus className="w-5 h-5" /> Start New Campaign
            </Link>
          </div>
        </div>

        <div className="w-full md:w-1/2 relative h-[350px] perspective-1000 z-10 hidden sm:block">
          <div className="absolute inset-0 preserve-3d animate-float-slow">
            
            {/* Center Product Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white p-2 z-20 card-3d">
              <div className="w-full h-full bg-slate-50 rounded-xl overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400" alt="Product" className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white font-bold text-sm">Base Product</div>
              </div>
            </div>

            {/* Sparkle Floating Card */}
            <div className="absolute top-10 right-10 w-32 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.06)] border border-white z-30 card-3d" style={{ transform: 'translateZ(60px) rotate(15deg)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8a2be2] to-[#ff69b4] flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-700">AI Enhanced</div>
              </div>
            </div>

            {/* Variation Preview Card */}
            <div className="absolute bottom-10 left-4 w-40 h-28 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.06)] border border-white p-1.5 z-30 card-3d" style={{ transform: 'translateZ(40px) rotate(-10deg)' }}>
              <div className="w-full h-full rounded-xl bg-slate-100 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&q=80&w=400" alt="Variation" className="w-full h-full object-cover opacity-80" />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-md text-[10px] text-white font-medium">Variant A</div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="absolute bottom-16 right-4 w-36 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.06)] border border-white z-30 card-3d flex flex-col gap-1" style={{ transform: 'translateZ(50px) rotate(5deg)' }}>
               <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Success Rate</div>
               <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5]">98.5%</div>
               <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5] w-[98%]"></div>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex flex-col hover:-translate-y-1 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
            <Layers className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-sm font-semibold text-slate-400 tracking-wide uppercase">Total Campaigns</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-800">{stats.total}</h3>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12%</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col hover:-translate-y-1 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
            <ImageIcon className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-sm font-semibold text-slate-400 tracking-wide uppercase">Generated Assets</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-800">{stats.variations}</h3>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +8%</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col hover:-translate-y-1 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-sm font-semibold text-slate-400 tracking-wide uppercase">Success Rate</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-800">{stats.total ? successRate + '%' : '-'}</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md flex items-center gap-1">Stable</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col hover:-translate-y-1 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
            <Wand2 className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-sm font-semibold text-slate-400 tracking-wide uppercase">Templates Used</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-800">4</h3>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +2</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
`;

fs.writeFileSync(path.join(srcDir, 'pages', 'Dashboard.jsx'), dashboardJsx);

console.log('Finished updating Dashboard');
