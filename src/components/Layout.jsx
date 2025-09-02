import { Outlet } from 'react-router-dom';
import Header from './Header';

function Layout() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] relative">
      {/* Background shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-[#f02e65]/10 to-[#ff6b9d]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-r from-[#2de0c0]/10 to-[#00d4aa]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-gradient-to-r from-[#ff6b9d]/10 to-[#f02e65]/10 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
