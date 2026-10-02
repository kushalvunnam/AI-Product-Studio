import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Plus, Menu, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCampaigns } from '../services/campaignService';

const Navbar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef();

  useEffect(() => {
    // Generate notifications from recent campaigns
    const fetchNotifications = async () => {
      try {
        const campaigns = await getCampaigns();
        if (campaigns && campaigns.length > 0) {
          const recentCampaigns = campaigns.slice(0, 5); // top 5 recent
          const notifs = recentCampaigns.map(c => {
            let icon, title, color;
            if (c.status === 'completed') {
              icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
              title = 'Campaign Completed';
              color = 'bg-emerald-500/10 border-emerald-500/20';
            } else if (c.status === 'failed') {
              icon = <XCircle className="w-4 h-4 text-red-400" />;
              title = 'Campaign Failed';
              color = 'bg-red-500/10 border-red-500/20';
            } else {
              icon = <Clock className="w-4 h-4 text-blue-400" />;
              title = 'Campaign Processing';
              color = 'bg-blue-500/10 border-blue-500/20';
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
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-800 bg-surface/30 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-400 hover:text-white p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileMenuOpen}>
          <Menu className="w-6 h-6" />
        </button>
        <span className="md:hidden font-bold text-lg text-white tracking-tight flex items-center gap-1">ProductStudio<span className="text-primary-500">AI</span></span>
        
        <div className="relative hidden sm:block w-64 md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search campaigns, assets..."
            className="w-full bg-slate-900/50 border border-slate-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 text-slate-200 placeholder-slate-500 transition-colors"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-white transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border border-surface animate-pulse"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 md:right-0 -mr-4 md:mr-0 mt-2 w-[calc(100vw-2rem)] max-w-sm md:w-80 bg-surface border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h3 className="font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary-400 hover:text-primary-300 font-medium">Mark all read</button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-slate-800">
                    {notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => markAsRead(notif.id)}
                        className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-slate-800/20' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${notif.color}`}>
                          {notif.icon}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${!notif.read ? 'text-white' : 'text-slate-300'}`}>{notif.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{notif.message}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-primary-500 ml-auto mt-1"></div>
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
        
        <Link 
          to="/create" 
          className="hidden sm:flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
