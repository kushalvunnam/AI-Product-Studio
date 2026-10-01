import { Search, Bell, Plus, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-800 bg-surface/30 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-400 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
        
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
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border border-surface"></span>
        </button>
        
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
