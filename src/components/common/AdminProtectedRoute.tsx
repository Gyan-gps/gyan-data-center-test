import React from 'react';
import { Navigate } from 'react-router';
import { getAdminAuthToken } from '@/services/api';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * AdminProtectedRoute Component
 * Protects admin routes by checking admin JWT token in cookies
 */
export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
}) => {
  const token = getAdminAuthToken();

  // If no admin JWT token in cookies, redirect to admin login
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Token exists, render the protected component
  return <>{children}</>;
};
