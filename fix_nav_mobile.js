const fs = require('fs');

// Layout.jsx
const layoutJsx = `import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar setMobileMenuOpen={setMobileMenuOpen} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
`;
fs.writeFileSync('frontend/src/components/Layout.jsx', layoutJsx);

// Sidebar.jsx
const sidebarJsx = `import React from 'react';
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={\`fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] flex-shrink-0 border-r border-slate-800 bg-surface/95 backdrop-blur-xl flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 \${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}\`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-primary-400">
            <Sparkles className="w-6 h-6 shrink-0" />
            <span className="font-bold text-xl text-white tracking-tight truncate">ProductStudio<span className="text-primary-500">AI</span></span>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-white p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => 
                  \`flex items-center gap-3 px-3 py-3.5 md:py-2.5 rounded-lg transition-all duration-200 min-h-[44px] \${
                    isActive 
                      ? 'bg-primary-500/10 text-primary-400' 
                      : 'text-slate-400 hover:bg-surfaceHighlight hover:text-slate-200'
                  }\`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium text-sm">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="glass-panel p-3 rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-primary-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
              JD
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate">Jane Doe</span>
              <span className="text-xs text-slate-400 truncate">Pro Plan</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
`;
fs.writeFileSync('frontend/src/components/Sidebar.jsx', sidebarJsx);

// Navbar.jsx
let navbarJsx = fs.readFileSync('frontend/src/components/Navbar.jsx', 'utf8');
navbarJsx = navbarJsx.replace('const Navbar = () => {', 'const Navbar = ({ setMobileMenuOpen }) => {');
navbarJsx = navbarJsx.replace(
  '<button className="md:hidden text-slate-400 hover:text-white">',
  '<button className="md:hidden text-slate-400 hover:text-white p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation" aria-expanded="false">'
);
navbarJsx = navbarJsx.replace(
  '<Menu className="w-6 h-6" />\n        </button>',
  '<Menu className="w-6 h-6" />\n        </button>\n        <span className="md:hidden font-bold text-lg text-white tracking-tight flex items-center gap-1">ProductStudio<span className="text-primary-500">AI</span></span>'
);

// Mobile notification bell panel right adjustment
navbarJsx = navbarJsx.replace(
  'className="absolute right-0 mt-2 w-80 bg-surface border',
  'className="absolute right-0 md:right-0 -mr-4 md:mr-0 mt-2 w-[calc(100vw-2rem)] max-w-sm md:w-80 bg-surface border'
);

fs.writeFileSync('frontend/src/components/Navbar.jsx', navbarJsx);

console.log('Mobile navigation fixed');
