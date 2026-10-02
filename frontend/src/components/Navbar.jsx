import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Plus, Menu, CheckCircle2, XCircle, Clock, ChevronDown, User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getCampaigns } from '../services/campaignService';

const Navbar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef();
  const profileRef = useRef();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.includes('create')) return 'Create Campaign';
    if (path.includes('campaigns')) return 'Campaign History';
    if (path.includes('assets')) return 'My Assets';
    if (path.includes('templates')) return 'Templates';
    if (path.includes('analytics')) return 'Analytics';
    if (path.includes('settings')) return 'Settings';
    return 'Dashboard';
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const campaigns = await getCampaigns();
        if (campaigns && campaigns.length > 0) {
          const recentCampaigns = campaigns.slice(0, 5);
          const notifs = recentCampaigns.map(c => {
            let icon, title, color;
            if (c.status === 'completed') {
              icon = <CheckCircle2 className="w-4 h-4 text-primary" />;
              title = 'Campaign Completed';
              color = 'bg-primary/10 border-primary/20 shadow-neon';
            } else if (c.status === 'failed') {
              icon = <XCircle className="w-4 h-4 text-red-400" />;
              title = 'Campaign Failed';
              color = 'bg-red-500/10 border-red-500/20';
            } else {
              icon = <Clock className="w-4 h-4 text-secondary-cyan" />;
              title = 'Campaign Processing';
              color = 'bg-secondary-cyan/10 border-secondary-cyan/20 shadow-neon-cyan';
            }
            return {
              id: c._id,
              title,
              message: `${c.name || 'Untitled'} - ${c.analysis?.productName || 'Product'}`,
              time: new Date(c.createdAt).toLocaleDateString(),
              icon,
              color,
              read: false
            };
          });
          setNotifications(notifs);
          setUnreadCount(notifs.length);
        }
      } catch (err) {
        console.error("Failed to load notifications");
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => {
      if (n.id === id && !n.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        return { ...n, read: true };
      }
      return n;
    }));
  };

  return (
    <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-white/5 bg-surfaceSolid/40 backdrop-blur-2xl sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden text-slate-400 hover:text-white p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileMenuOpen}
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden md:flex flex-col">
          <h2 className="text-xl font-bold text-white tracking-tight">{getPageTitle()}</h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide">PRODUCTSTUDIO AI</p>
        </div>

        <span className="md:hidden font-bold text-lg text-white tracking-tight flex items-center gap-1">
          ProductStudio<span className="text-primary">AI</span>
        </span>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative hidden lg:block w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search campaigns, assets..."
            className="w-full bg-white/5 border border-white/10 rounded-full focus:ring-1 focus:ring-primary focus:border-primary block pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 transition-all shadow-inner outline-none"
          />
        </div>

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-surfaceSolid shadow-neon"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 md:right-0 -mr-4 md:mr-0 mt-3 w-[calc(100vw-2rem)] max-w-sm md:w-80 glass-panel border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 origin-top-right">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:text-primary-300 font-medium transition-colors">Mark all read</button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => markAsRead(notif.id)}
                        className={`p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-primary/5' : ''}`}
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${notif.color}`}>
                          {notif.icon}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${!notif.read ? 'text-white' : 'text-slate-300'}`}>{notif.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{notif.message}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-primary ml-auto mt-2 shadow-neon shrink-0"></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="relative hidden sm:block" ref={profileRef}>
          <button 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary-cyan flex items-center justify-center text-slate-950 font-bold text-sm shadow-neon">
              JD
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 glass-panel border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 origin-top-right">
               <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col">
                  <span className="font-bold text-white">Jane Doe</span>
                  <span className="text-xs text-slate-400">jane.doe@example.com</span>
               </div>
               <div className="p-2 flex flex-col">
                 <Link to="/settings" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors" onClick={() => setShowProfile(false)}>
                   <User className="w-4 h-4" /> Profile
                 </Link>
                 <Link to="/settings" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors" onClick={() => setShowProfile(false)}>
                   <SettingsIcon className="w-4 h-4" /> Settings
                 </Link>
                 <div className="h-px bg-white/5 my-1 mx-2"></div>
                 <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-sm text-slate-300 transition-colors">
                   <LogOut className="w-4 h-4" /> Sign Out
                 </button>
               </div>
            </div>
          )}
        </div>

        <Link 
          to="/create" 
          className="hidden md:flex btn-primary py-2 px-5 text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
