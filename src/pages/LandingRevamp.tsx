import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { toast } from 'react-hot-toast';
import { Login } from '@/components/landing/Login';
import { LandingLayout } from '@/components/landing/LandingLayout';

export const LandingRevamp: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      toast.error('Your trial account has expired. Please contact support.', {
        duration: 5000,
        position: 'top-right'
      });
      // Optionally remove the query param so it doesn't show on refresh
      window.history.replaceState({}, '', '/');
    }
  }, [location]);

  return (
    <div className="antialiased text-slate-800">
      <LandingLayout>
        <Login />
      </LandingLayout>
    </div>
  );
};
