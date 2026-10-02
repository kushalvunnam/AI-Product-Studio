
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
          className="lg:hidden flex items-center justify-center min-h-[44px] min-w-[44px] bg-white border border-slate-200 rounded-xl text-[#52627A] hover:bg-slate-50 shadow-sm"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center bg-white/80 border border-[#D0D5DD] rounded-[14px] px-4 py-2.5 w-80 focus-within:ring-2 focus-within:ring-[#00d2ff]/30 focus-within:border-[#00d2ff] shadow-sm transition-all">
          <Search className="w-4 h-4 text-[#6B7A90]" />
          <input 
            type="text" 
            placeholder="Search campaigns, assets..." 
            className="bg-transparent border-none outline-none text-sm text-[#344054] ml-3 w-full placeholder:text-[#6B7A90]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] bg-white border border-slate-200 rounded-xl text-[#52627A] hover:bg-slate-50 shadow-sm transition-all relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-coral-500 bg-[#ff6b6b] rounded-full border-2 border-white"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-2 z-50 animate-in slide-in-from-top-2">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-[#101828]">Notifications</h3>
                <button className="text-xs text-[#3a7bd5] font-medium hover:underline">Mark all read</button>
              </div>
              <div className="p-2 space-y-1">
                <div className="p-3 bg-slate-50 rounded-xl flex gap-3 items-start cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-[#101828]">Campaign completed</p>
                    <p className="text-xs text-[#52627A] mt-0.5">Summer Promo assets are ready.</p>
                    <p className="text-[10px] text-[#6B7A90] mt-1">2 mins ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1.5 sm:pr-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all min-h-[44px] min-w-[44px] justify-center"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d2ff] to-[#3a7bd5] flex items-center justify-center text-white font-bold text-sm">
              JD
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-2 z-50 animate-in slide-in-from-top-2">
              <Link to="/settings" onClick={() => setShowProfile(false)} className="block px-4 py-2 text-sm text-[#344054] hover:bg-slate-50 rounded-xl transition-colors">Profile Settings</Link>
              <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1">Sign Out</button>
            </div>
          )}
        </div>

        <Link to="/create" className="btn-primary min-h-[44px] px-4 sm:px-6">
          <Plus className="w-5 h-5" /> 
          <span className="hidden sm:inline">New Campaign</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
