
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
