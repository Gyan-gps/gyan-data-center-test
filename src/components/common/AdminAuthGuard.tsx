    import React from 'react'
    import { Navigate } from 'react-router'
    import { useAdminAuthStore } from '@/store/adminAuthStore'
    import { Loading } from '@/components/ui'

    interface AdminAuthGuardProps {
    children: React.ReactNode
    }

    /**
     * AdminAuthGuard prevents authenticated admins from accessing auth pages (like login)
     * Redirects authenticated admins to admin dashboard
     */
    export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
    const isAuthenticated = useAdminAuthStore(s => s.isAuthenticated);
  const isLoading = useAdminAuthStore(s => s.isLoading);

    if (isLoading) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <Loading text="Loading..." size="lg" />
        </div>
        )
    }
    // If admin is already authenticated, redirect to admin dashboard
    if (isAuthenticated) {
        return <Navigate to="/admin/dashboard" replace />
    }

    return <>{children}</>
    }