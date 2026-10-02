import React from 'react';
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
