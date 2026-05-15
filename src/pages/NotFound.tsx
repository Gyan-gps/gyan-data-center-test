import React from 'react';
import { Link, useNavigate } from 'react-router';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { redirectUserToPageAfterLogin } from '@/utils';

export const NotFound: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const getRedirectPath = () => {
    if (isAuthenticated && user?.allowedPages) {
      return redirectUserToPageAfterLogin(user.allowedPages, '/home');
    }
    return '/';
  };

  const handleGoHome = () => {
    navigate(getRedirectPath());
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-slate-800 mb-4">404</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back to where you need to be.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGoHome}
              icon={Home}
              className="justify-center"
              variant='ghost'
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              icon={ArrowLeft}
              className="justify-center"
            >
              Go Back
            </Button>
          </div>

          {/* Search suggestion for authenticated users */}
          {isAuthenticated && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Search className="w-4 h-4" />
                <span className="text-sm font-medium">Quick Links</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {user?.allowedPages?.includes('Home') && (
                  <Link 
                    to="/home"
                    className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                {user?.allowedPages?.includes('Companies') && (
                  <Link 
                    to="/companies"
                    className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Companies
                  </Link>
                )}
                {user?.allowedPages?.includes('Analytics') && (
                  <Link 
                    to="/analytics"
                    className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Analytics
                  </Link>
                )}
                {user?.allowedPages?.includes('News') && (
                  <Link 
                    to="/news"
                    className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    News
                  </Link>
                )}
                <Link 
                  to="/profile"
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Profile
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Decorative Element */}
        <div className="mt-12 opacity-60">
          <svg 
            className="w-64 h-32 mx-auto text-slate-300" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
      </div>
    </div>
  );
};
