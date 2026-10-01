import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusSquare, 
  Image as ImageIcon, 
  History, 
  LayoutTemplate, 
  BarChart3, 
  Settings,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
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
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-surface/50 backdrop-blur-xl hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-primary-400">
          <Sparkles className="w-6 h-6" />
          <span className="font-bold text-xl text-white tracking-tight">ProductStudio<span className="text-primary-500">AI</span></span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-500/10 text-primary-400' 
                    : 'text-slate-400 hover:bg-surfaceHighlight hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <div className="glass-panel p-3 rounded-lg flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Jane Doe</span>
            <span className="text-xs text-slate-400">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
