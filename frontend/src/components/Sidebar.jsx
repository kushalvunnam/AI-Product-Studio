
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Image as ImageIcon, History, Layers, BarChart3, Settings, X, Wand2 } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Create Campaign', href: '/create', icon: Wand2 },
    { name: 'My Assets', href: '/assets', icon: ImageIcon },
    { name: 'Campaign History', href: '/campaigns', icon: History },
    { name: 'Templates', href: '/templates', icon: Layers },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white/80 backdrop-blur-2xl border-r border-white/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        
        {/* Brand */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100/50">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00d2ff] to-[#3a7bd5] flex items-center justify-center shadow-lg shadow-blue-500/30 text-[#172033] font-bold">
              <Wand2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-[#101828] tracking-tight">ProductStudio<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5]">AI</span></span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-[#6B7A90] hover:text-[#344054] bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-[14px] font-medium transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#00d2ff]/10 to-[#3a7bd5]/10 text-[#101828] shadow-sm border border-[#00d2ff]/20' 
                    : 'text-[#52627A] hover:bg-slate-50 hover:text-[#344054] border border-transparent'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#3a7bd5]' : 'text-[#6B7A90] group-hover:text-[#52627A]'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Mini Profile */}
        <div className="p-6 border-t border-slate-100/50 m-4 bg-gradient-to-br from-[#f8fbff] to-[#eef7ff] rounded-2xl border border-[#00d2ff]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#3a7bd5] p-0.5">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[#3a7bd5] font-bold text-sm">
                JD
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-[#101828]">Jane Doe</p>
              <p className="text-xs text-[#3a7bd5] font-medium">Pro Plan</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
