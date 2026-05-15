import React from 'react'
import { Navigate } from 'react-router'
import { useAuthStore } from '@/store/authStore'
import { Loading } from '@/components/ui'

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * AuthGuard prevents authenticated users from accessing auth pages (like login)
 * Redirects authenticated users to home page
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore(state => state)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading..." size="lg" />
      </div>
    )
  }

  // If user is already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}
