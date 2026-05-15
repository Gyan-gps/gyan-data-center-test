import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router';
import { Menu, X, LogOut } from 'lucide-react';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { getAdminAuthToken } from '@/services/api';
import { Button } from '@/components/ui';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAdminAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check if admin token exists, if not redirect to login
  const token = getAdminAuthToken();
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const isActive = (targetPath: string) => {
    const current = location.pathname;

    const isMatch = (p1: string, p2: string) => {
      const cleanP1 = p1.endsWith('/') ? p1.slice(0, -1) : p1;
      const cleanP2 = p2.endsWith('/') ? p2.slice(0, -1) : p2;
      return cleanP1 === cleanP2;
    };

    if (targetPath === '/admin/dashboard') {
      if (isMatch(current, '/admin/dashboard')) return true;
      
      const cleanCurrent = current.endsWith('/') ? current.slice(0, -1) : current;
      const cleanNews = '/admin/dashboard/news';
      
      return cleanCurrent.startsWith('/admin/dashboard') && !cleanCurrent.startsWith(cleanNews);
    }

    if (targetPath === '/admin/dashboard/news') {
      return current.startsWith('/admin/dashboard/news');
    }
    return false;
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
    },
    {
      label: 'News',
      path: '/admin/dashboard/news',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="text-xl font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu - Mobile Only */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-lg lg:text-2xl font-bold text-gray-900">
              DCI Admin Panel
            </h1>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
