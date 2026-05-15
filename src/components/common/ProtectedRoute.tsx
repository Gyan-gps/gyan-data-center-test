import React from "react";
import { Navigate, useLocation, matchPath } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { Loading } from "@/components/ui";
import { toast } from "react-hot-toast";
import { useTrialHeartbeat } from "@/hooks/useTrialHeartbeat";
import { TrialExpiredOverlay } from "./TrialExpiredOverlay";
import { Layout } from "@/components/layout";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresPage?: string;
  requiresExport?: boolean;
  requiresAnalytics?: boolean;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresPage,
  requiresExport = false,
  requiresAnalytics = false,
  fallback,
}) => {
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    isLoading,
    isActiveUser,
    canAccessPage,
    hasDownloadAccess,
    trialState,
  } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check trial
  // if (trialState?.isTrial && trialState.status === "expired") {
  //   toast.error("Your trial account has expired. Please contact support.");
  //   return <Navigate to="/" replace />;
  // }

  // Check if user is active
  if (!isActiveUser()) {
    toast.error("Your account is inactive. Please contact support.");
    return <Navigate to="/" replace />;
  }

  // Intercept the route for Trial Experiation
  if (
    user?.trial &&
    (trialState?.status === "expired" ||
      (trialState?.remainingSeconds && trialState.remainingSeconds <= 0))
  ) {
    // Only allow /reports and /reports/*, otherwise show trial over overlay
    const isReportsPath =
      matchPath({ path: "/reports" }, location.pathname) ||
      matchPath({ path: "/reports/*" }, location.pathname) ||
      matchPath({ path: "/profile" }, location.pathname);
    if (!isReportsPath) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <Layout>
          <div className="flex-1 flex flex-col min-h-0 bg-gray-50 max-w-container mx-auto w-full">
            <TrialExpiredOverlay
              moduleName={
                requiresPage && requiresPage !== "*"
                  ? requiresPage
                  : "this module"
              }
            />
          </div>
        </Layout>
      );
    }
  }

  // Check page access permission
  // if (requiresPage !== "*") {
  //   // Wildcard to skip page check
  //   if (requiresPage && !canAccessPage(requiresPage)) {
  //     if (fallback) {
  //       return <>{fallback}</>;
  //     }
  //     toast.error(`You don't have access to the ${requiresPage} page.`);
  //     return <Navigate to="/" replace />;
  //   }
  // }

  // Check export permission
  if (requiresExport && !hasDownloadAccess()) {
    if (fallback) {
      return <>{fallback}</>;
    }
    toast.error("You don't have export permissions.");
    return <Navigate to="/" replace />;
  }

  // Check analytics permission
  if (requiresAnalytics) {
    if (fallback) {
      return <>{fallback}</>;
    }
    toast.error("You don't have analytics permissions.");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
