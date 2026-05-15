import React from 'react';
import { Navigate } from 'react-router';
import { getAdminAuthToken } from '@/services/api';

/**
 * AdminRedirect Component
 * Handles /admin route redirection:
 * - If admin JWT token in cookies: redirect to /admin/dashboard
 * - If no admin token: redirect to /admin/login
 */
export const AdminRedirect: React.FC = () => {
  const token = getAdminAuthToken();

  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/admin/login" replace />;
};
