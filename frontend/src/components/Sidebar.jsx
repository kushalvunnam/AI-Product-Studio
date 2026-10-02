import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusSquare, 
  Image as ImageIcon, 
  History, 
  LayoutTemplate, 
  BarChart3, 
  Settings,
  Sparkles,
  X
} from 'lucide-react';

const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Campaign', path: '/create', icon: PlusSquare },
    { name: 'My Assets', path: '/assets', icon: ImageIcon },
    { name: 'Campaign History', path: '/campaigns', icon: History },
    { name: 'Templates', path: '/templates', icon: LayoutTemplate },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] flex-shrink-0 border-r border-white/5 bg-surfaceSolid/80 backdrop-blur-2xl flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-neon">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight truncate">
              ProductStudio<span className="text-primary">AI</span>
            </span>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-white p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation" aria-expanded={mobileMenuOpen}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3.5 md:py-3 rounded-xl transition-all duration-300 min-h-[44px] ${
                    isActive 
                      ? 'bg-active-gradient text-white shadow-neon border border-primary/30 relative overflow-hidden' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent hover:border-white/10'
                  }`
                }
              >
                <Icon className={`w-5 h-5 shrink-0 `} />
                <span className="font-medium text-sm">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-white/5 shrink-0">
          <div className="glass-panel border-white/10 p-3 rounded-xl flex items-center gap-3 hover:border-primary/30 transition-colors cursor-pointer group">
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-primary to-secondary-cyan flex items-center justify-center text-slate-950 font-bold text-sm shadow-neon">
              JD
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">Jane Doe</span>
              <span className="text-xs text-secondary-cyan truncate">Pro Plan</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
