import { APP_NAME } from '@/utils';
import React, { useState } from 'react';
import { PWAInstallButton } from '@/components/common';
import { useAuth } from '@/hooks';
import { useNavigate } from 'react-router';
import { redirectUserToPageAfterLogin } from '@/utils';

export const LandingHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Navigate to dashboard for logged-in users
  const handleGoToDashboard = () => {
    if (user?.allowedPages && user.allowedPages.length > 0) {
      const redirectPath = redirectUserToPageAfterLogin(user.allowedPages, '/home');
      navigate(redirectPath);
    } else {
      navigate('/home');
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Logo with graceful fallback */}
            <img 
              src="/Logo.png" 
              alt="Mordor Intelligence" 
              className="h-7 sm:h-9 w-auto" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'h-7 sm:h-9 w-7 sm:w-9 rounded-xl bg-[#007ea7]';
                target.parentNode?.insertBefore(fallback, target);
              }}
            />
            <span className="text-base sm:text-lg font-semibold tracking-tight">{APP_NAME}</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-6 text-sm font-medium text-slate-600">
            <a href="#modules" className="hover:text-slate-900 transition-colors">Modules</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Capabilities</a>
            <a href="#audience" className="hover:text-slate-900 transition-colors">Who Uses It</a>
            <a href="#usecases" className="hover:text-slate-900 transition-colors">Use Cases</a>
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <PWAInstallButton className="hidden rounded-xl border-2 border-[#007ea7] text-[#007ea7] hover:bg-[#007ea7] hover:text-white px-3 py-1.5 text-xs font-semibold transition-colors sm:inline-block">
              Install App
            </PWAInstallButton>
            
            {isAuthenticated ? (
              // Show dashboard button for logged-in users
              <button
                onClick={handleGoToDashboard}
                className="rounded-xl bg-[#007ea7] hover:bg-[#006a8c] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white transition-colors"
              >
                Go to Dashboard
              </button>
            ) : (
              // Show login and demo buttons for non-authenticated users
              <>
                <a 
                  href="#login" 
                  className="rounded-xl border border-slate-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Login
                </a>
                <a 
                  href="#request-demo" 
                  className="rounded-xl bg-[#007ea7] hover:bg-[#006a8c] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white transition-colors"
                >
                  Request Demo
                </a>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated ? (
              // Show dashboard button for logged-in users
              <button
                onClick={handleGoToDashboard}
                className="rounded-lg bg-[#007ea7] hover:bg-[#006a8c] px-2 py-1 text-xs font-semibold text-white transition-colors"
              >
                Dashboard
              </button>
            ) : (
              // Show login button for non-authenticated users
              <a 
                href="#login" 
                className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Login
              </a>
            )}
            
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center">
                <span className={`block w-4 h-0.5 bg-slate-600 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : ''}`} />
                <span className={`block w-4 h-0.5 bg-slate-600 transition-all duration-300 mt-1 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-4 h-0.5 bg-slate-600 transition-all duration-300 mt-1 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-4">
            <nav className="flex flex-col gap-3 text-sm font-medium text-slate-600">
              <a href="#modules" className="hover:text-slate-900 transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Modules
              </a>
              <a href="#features" className="hover:text-slate-900 transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Capabilities
              </a>
              <a href="#audience" className="hover:text-slate-900 transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Who Uses It
              </a>
              <a href="#usecases" className="hover:text-slate-900 transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Use Cases
              </a>
              <div className="flex flex-col gap-3 pt-3 border-t border-slate-200">
                <PWAInstallButton className="w-full rounded-xl border-2 border-[#007ea7] text-[#007ea7] hover:bg-[#007ea7] hover:text-white px-3 py-2 text-sm font-semibold transition-colors text-center">
                  Install App
                </PWAInstallButton>
                
                {isAuthenticated ? (
                  // Show dashboard button for logged-in users
                  <button
                    onClick={() => {
                      handleGoToDashboard();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full rounded-xl bg-[#007ea7] hover:bg-[#006a8c] px-3 py-2 text-sm font-semibold text-white transition-colors text-center"
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  // Show request demo button for non-authenticated users
                  <a 
                    href="#cta" 
                    className="w-full rounded-xl bg-[#007ea7] hover:bg-[#006a8c] px-3 py-2 text-sm font-semibold text-white transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Request Demo
                  </a>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
