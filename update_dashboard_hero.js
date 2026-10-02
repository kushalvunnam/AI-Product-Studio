const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'frontend', 'src', 'pages', 'Dashboard.jsx');

const newDashboard = `import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Layers, Image as ImageIcon, TrendingUp, ArrowRight, Wand2, Plus, CheckCircle2, LayoutTemplate, Activity, BarChart3, Star, Zap } from 'lucide-react';
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
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-16 animate-in fade-in duration-700 pb-20">
      
      {/* Hero Section */}
      <div className="relative p-4 md:p-8 overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-12 mt-4 min-h-[600px]">
        {/* Decorative Spheres */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#00d2ff]/15 to-[#3a7bd5]/15 blur-[80px] -z-10 animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#8a2be2]/10 to-[#ff69b4]/10 blur-[80px] -z-10 animate-pulse-glow" style={{ animationDelay: '2s' }} />

        {/* Left Copy */}
        <div className="w-full xl:w-5/12 space-y-8 z-10 pt-10 xl:pt-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#00d2ff]/10 to-[#3a7bd5]/10 border border-[#00d2ff]/20 text-[#3a7bd5] font-semibold text-sm shadow-sm animate-float">
            <Sparkles className="w-4 h-4 text-[#00d2ff]" /> Premium AI Workspace
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800 leading-[1.1] tracking-tight">
            Transform Your Product Into <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] via-[#3a7bd5] to-[#8a2be2]">
              AI-Powered Marketing Campaigns
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-xl leading-relaxed font-medium">
            Create stunning product variations, lifestyle compositions, and complete marketing kits instantly using advanced AI vision and generative models.
          </p>
          
          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <Link to="/create" className="btn-primary py-3.5 px-8 text-base shadow-[0_10px_30px_rgba(0,210,255,0.3)]">
              <Plus className="w-5 h-5" /> Create Campaign
            </Link>
            <Link to="/templates" className="btn-secondary py-3.5 px-8 text-base bg-white/80">
              <LayoutTemplate className="w-5 h-5" /> Explore Templates
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap gap-4 md:gap-6 text-sm font-semibold text-slate-500">
            <div className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500"/> 5× Faster Creation</div>
            <div className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-purple-500"/> AI-Powered</div>
            <div className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-blue-500"/> Multi-Model Generation</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Ready for Social Media</div>
          </div>
        </div>

        {/* Right 3D Floating Composition */}
        <div className="w-full xl:w-7/12 relative h-[500px] md:h-[600px] perspective-[1200px] z-10 hidden md:block">
          <div className="absolute inset-0 preserve-3d">
            
            {/* Background Layer (Z: -80px to -40px) */}
            <div className="absolute top-10 left-10 w-40 h-48 glass-card border border-white/50 p-1.5 z-0 animate-float" style={{ transform: 'translateZ(-60px) rotate(-12deg)', animationDelay: '0.5s' }}>
              <div className="w-full h-full rounded-xl overflow-hidden relative bg-slate-50">
                <img src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=400" alt="Perfume" className="w-full h-full object-cover opacity-80" />
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-md rounded-md text-[9px] font-bold text-slate-700 shadow-sm">Variation B</div>
              </div>
            </div>

            <div className="absolute top-20 right-12 w-48 h-36 glass-card border border-white/50 p-1.5 z-0 animate-float-slow" style={{ transform: 'translateZ(-40px) rotate(8deg)', animationDelay: '1.2s' }}>
              <div className="w-full h-full rounded-xl overflow-hidden relative bg-slate-50">
                <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400" alt="Smartphone" className="w-full h-full object-cover opacity-80" />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-md rounded-md text-[9px] font-bold text-slate-700 shadow-sm">Social Media Ready</div>
              </div>
            </div>

            {/* Middle Layer (Z: 0px to 20px) */}
            {/* Main Center Product Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-white/95 backdrop-blur-2xl rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-white/80 p-2.5 z-20 transition-transform duration-500 hover:scale-105" style={{ transform: 'translate(-50%, -50%) translateZ(0px) rotate(0deg)' }}>
              <div className="w-full h-full bg-slate-50 rounded-[18px] overflow-hidden relative group">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600" alt="Headphones Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div>
                    <div className="text-white font-black text-lg leading-tight">Pro Audio Series</div>
                    <div className="text-white/80 font-medium text-xs mt-0.5">Lifestyle Composition</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                    <Wand2 className="w-4 h-4" />
                  </div>
                </div>
                {/* Badge top left */}
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/30 backdrop-blur-md border border-white/20 rounded-lg text-[10px] text-white font-bold tracking-wide">
                  Campaign Generated
                </div>
              </div>
            </div>

            {/* Midground small cards */}
            <div className="absolute bottom-16 left-8 w-44 h-44 glass-card border border-white/70 p-1.5 z-10 animate-float" style={{ transform: 'translateZ(20px) rotate(-6deg)', animationDelay: '0.8s' }}>
              <div className="w-full h-full rounded-xl overflow-hidden relative bg-slate-50">
                <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400" alt="Cosmetics" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-md rounded-md text-[9px] font-bold text-slate-700 shadow-sm">Variation A</div>
              </div>
            </div>

            {/* Foreground Layer (Z: 40px to 100px) */}
            
            {/* Analytics floating card */}
            <div className="absolute bottom-32 right-4 w-40 p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.1)] border border-white z-30 flex flex-col gap-1.5 animate-float-slow" style={{ transform: 'translateZ(60px) rotate(4deg)', animationDelay: '2.5s' }}>
               <div className="flex items-center justify-between">
                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Success Rate</div>
                 <BarChart3 className="w-3.5 h-3.5 text-[#3a7bd5]" />
               </div>
               <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5]">98.5%</div>
               <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5] w-[98%]"></div>
               </div>
            </div>

            {/* AI Badges */}
            <div className="absolute top-32 left-0 w-36 p-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white z-30 flex items-center gap-2.5 animate-float" style={{ transform: 'translateZ(80px) rotate(-15deg)', animationDelay: '1.8s' }}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8a2be2] to-[#ff69b4] flex items-center justify-center text-white shadow-inner shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-700 leading-tight">AI Enhanced</div>
            </div>

            <div className="absolute top-48 right-0 p-3 px-4 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white z-30 flex items-center gap-2 animate-float" style={{ transform: 'translateZ(90px) rotate(12deg)', animationDelay: '0.2s' }}>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Marketing Kit Ready</div>
            </div>

            {/* Creative Brief Note */}
            <div className="absolute bottom-10 right-28 p-3 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white z-30 flex items-center gap-2 animate-float" style={{ transform: 'translateZ(40px) rotate(-5deg)', animationDelay: '3.1s' }}>
              <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                <LayoutTemplate className="w-3.5 h-3.5" />
              </div>
              <div className="text-[10px] font-bold text-slate-700">Creative Brief<br/><span className="text-slate-400 font-medium">Applied</span></div>
            </div>

            {/* Small Floating Shapes / Icons */}
            <div className="absolute top-1/4 right-1/4 w-6 h-6 rounded-lg bg-gradient-to-br from-[#00d2ff] to-[#3a7bd5] shadow-lg animate-float-slow z-0" style={{ transform: 'translateZ(10px) rotate(45deg)' }}></div>
            <div className="absolute bottom-1/3 left-1/4 w-4 h-4 rounded-full bg-gradient-to-br from-[#8a2be2] to-[#ff69b4] shadow-lg animate-float z-40" style={{ transform: 'translateZ(100px)' }}></div>
            <div className="absolute top-10 right-1/3 w-8 h-8 rounded-full bg-white/80 backdrop-blur shadow-md border border-white flex items-center justify-center z-20 animate-float" style={{ transform: 'translateZ(50px)' }}>
              <Star className="w-4 h-4 text-amber-400" />
            </div>

          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 relative z-20">
        <div className="glass-card bg-white/90 p-6 flex flex-col hover:-translate-y-1.5 transition-all duration-300 group shadow-sm hover:shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-blue-100/50">
            <Layers className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Total Campaigns</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-800">{stats.total}</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12%</span>
          </div>
        </div>

        <div className="glass-card bg-white/90 p-6 flex flex-col hover:-translate-y-1.5 transition-all duration-300 group shadow-sm hover:shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-indigo-100/50">
            <ImageIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Generated Assets</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-800">{stats.variations}</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +8%</span>
          </div>
        </div>

        <div className="glass-card bg-white/90 p-6 flex flex-col hover:-translate-y-1.5 transition-all duration-300 group shadow-sm hover:shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-emerald-100/50">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Success Rate</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-800">{stats.total ? successRate + '%' : '-'}</h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">Stable</span>
          </div>
        </div>

        <div className="glass-card bg-white/90 p-6 flex flex-col hover:-translate-y-1.5 transition-all duration-300 group shadow-sm hover:shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-purple-100/50">
            <Wand2 className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Templates Used</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-800">4</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +2</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
`;

fs.writeFileSync(dashboardPath, newDashboard);
console.log('Dashboard updated.');
