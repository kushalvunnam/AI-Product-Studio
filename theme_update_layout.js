const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

const sidebarJsx = `
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
      <div className={\`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white/80 backdrop-blur-2xl border-r border-white/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 transform transition-transform duration-300 ease-in-out \${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col\`}>
        
        {/* Brand */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100/50">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00d2ff] to-[#3a7bd5] flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-bold">
              <Wand2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">ProductStudio<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5]">AI</span></span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
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
                className={\`flex items-center gap-3 px-4 py-3 rounded-[14px] font-medium transition-all duration-300 group \${
                  isActive 
                    ? 'bg-gradient-to-r from-[#00d2ff]/10 to-[#3a7bd5]/10 text-slate-800 shadow-sm border border-[#00d2ff]/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'
                }\`}
              >
                <item.icon className={\`w-5 h-5 transition-colors \${isActive ? 'text-[#3a7bd5]' : 'text-slate-400 group-hover:text-slate-600'}\`} />
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
              <p className="text-sm font-bold text-slate-800">Jane Doe</p>
              <p className="text-xs text-[#3a7bd5] font-medium">Pro Plan</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
`;

const headerJsx = `
import { Bell, Search, Menu, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Header = ({ setIsSidebarOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-4 md:px-8 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center bg-white/80 border border-slate-200 rounded-[14px] px-4 py-2.5 w-80 focus-within:ring-2 focus-within:ring-[#00d2ff]/30 focus-within:border-[#00d2ff] shadow-sm transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search campaigns, assets..." 
            className="bg-transparent border-none outline-none text-sm text-slate-700 ml-3 w-full placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-all relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-coral-500 bg-[#ff6b6b] rounded-full border-2 border-white"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-2 z-50 animate-in slide-in-from-top-2">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Notifications</h3>
                <button className="text-xs text-[#3a7bd5] font-medium hover:underline">Mark all read</button>
              </div>
              <div className="p-2 space-y-1">
                <div className="p-3 bg-slate-50 rounded-xl flex gap-3 items-start cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Campaign completed</p>
                    <p className="text-xs text-slate-500 mt-0.5">Summer Promo assets are ready.</p>
                    <p className="text-[10px] text-slate-400 mt-1">2 mins ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative hidden sm:block">
          <button 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1.5 pr-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d2ff] to-[#3a7bd5] flex items-center justify-center text-white font-bold text-sm">
              JD
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-2 z-50 animate-in slide-in-from-top-2">
              <Link to="/settings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">Profile Settings</Link>
              <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1">Sign Out</button>
            </div>
          )}
        </div>

        <Link to="/create" className="btn-primary hidden sm:flex">
          <Plus className="w-4 h-4" /> New Campaign
        </Link>
      </div>
    </header>
  );
};

export default Header;
`;

const layoutJsx = `
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-transparent relative">
      <div className="bg-glow-primary -top-40 -left-40"></div>
      <div className="bg-glow-secondary top-40 -right-40"></div>
      
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        <Header setIsSidebarOpen={setIsSidebarOpen} />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
`;

fs.writeFileSync(path.join(srcDir, 'components', 'Sidebar.jsx'), sidebarJsx);
fs.writeFileSync(path.join(srcDir, 'components', 'Header.jsx'), headerJsx);
fs.writeFileSync(path.join(srcDir, 'components', 'Layout.jsx'), layoutJsx);

console.log('Finished updating Layout, Header, Sidebar');
