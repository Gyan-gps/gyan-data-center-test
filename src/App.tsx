import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// Store
import { useAuthStore } from "@/store/authStore";

// GA Tracking
import { trackPageViewWithUser, trackPageView } from "@/utils/ga";

// Layout
import { Layout } from "@/components/layout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  ErrorBoundary,
  ProtectedRoute,
  AuthGuard,
  PWADebug,
  AdminProtectedRoute,
} from "@/components/common";

// Pages
import { Home } from "@/pages/Home";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/auth/Login";
import { AdminLogin } from "@/pages/auth/AdminLogin";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminNews } from "@/pages/admin/AdminNews";
import { AdminRedirect } from "@/pages/admin/AdminRedirect";
import { Explorer } from "@/pages/Explorer";
import { Companies } from "@/pages/Companies";
import { ITLoad } from "@/pages/ITLoad";
import { Analytics } from "@/pages/Analytics";
import { News } from "@/pages/News";
import { ReportsPage } from "@/pages/Reports2";
import { Profile } from "@/pages/auth/Profile";
import { CompanyDetailsPage } from "@/pages/CompanyDetails";
import DataCenterDetail from "@/pages/DataCenterDetail";
import AskAnalyst from "@/pages/AskAnalyst";
import { NotFound } from "@/pages/NotFound";
import { MyRA } from "./pages/Myra";
// import ReportDetailsPage from "./pages/ReportDetailsPage";
import { Signals } from "./pages/Signals";
import { LocationIntelligenceDashboard } from "@/components/location-intelligence/LocationIntelligenceDashboard";
// Styles
import "@/styles/globals.css";
import ExtendedSnippet from "./pages/ExtendedSnippet";
import { AdminAuthGuard } from "./components/common/AdminAuthGuard";
import { useAdminAuthStore } from "./store/adminAuthStore";
import { LandingRevamp } from "./pages/LandingRevamp";
import { useTrialHeartbeat } from "./hooks/useTrialHeartbeat";
import { CompaniesIntelligenceDashboard } from "./components/companies-intelligence/CompaniesIntelligenceDashboard";
import ReportTabs from "./components/Reports2/ReportTabs";

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Page tracking component
const PageTracker: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Track page views
    if (isAuthenticated && user) {
      trackPageViewWithUser(
        location.pathname,
        document.title,
        user.id.toString(),
        user.email
      );
    } else {
      trackPageView(location.pathname, document.title);
    }
  }, [location.pathname, isAuthenticated, user]);

  return null;
};

// Global trial tracker to ensure single heartbeat instance
const GlobalTrialTracker: React.FC = () => {
  useTrialHeartbeat();
  return null;
};

function App() {
  useEffect(() => {
    // Initialize auth store on app startup
    const initializeAuth = async () => {
    const { initialize: initializeUser } = useAuthStore.getState();
    const { initialize: initializeAdmin } = useAdminAuthStore.getState();
      try {
       await Promise.all([
        initializeUser(),
        initializeAdmin() 
      ]);
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      }
    };

    initializeAuth();
  }, []); // Empty dependency array - only run once on mount

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <PageTracker />
          <GlobalTrialTracker />
          <div className="App">
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingRevamp />} />

              {/* Auth Routes - Prevent authenticated users from accessing */}
              <Route
                path="/login"
                element={
                  <AuthGuard>
                    <Login />
                  </AuthGuard>
                }
              />

              {/* Admin Login Route */}
              <Route
                path="/admin/login"
                element={
                  <AdminAuthGuard>
                    <AdminLogin />
                  </AdminAuthGuard>
                }
              />

              {/* Admin Routes - Protected */}
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminRedirect />
                  </AdminProtectedRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />

              <Route
                path="/admin/dashboard/news"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminNews />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />

              {/* Protected Routes - Require authentication */}
              <Route
                path="/assets"
                element={
                  <ProtectedRoute requiresPage="Data Center">
                    <Layout>
                      <Home />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/home"
                element={
                  <ProtectedRoute requiresPage="Home">
                    <Layout>
                      <Explorer />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/companies"
                element={
                  <ProtectedRoute requiresPage="Companies">
                    <Layout>
                      <Companies />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/company/:companyName/:companyId"
                element={
                  <ProtectedRoute requiresPage="*">
                    <Layout>
                      <CompanyDetailsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/it-load"
                element={
                  <ProtectedRoute requiresPage="IT Load">
                    <Layout>
                      <ITLoad />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/datacenter/:dcId"
                element={
                  <ProtectedRoute requiresPage="*">
                    <Layout>
                      <DataCenterDetail />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/analytics"
                element={
                  <ProtectedRoute requiresPage="Analytics">
                    <Layout>
                      <Analytics />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/companies-intelligence"
                element={
                  <ProtectedRoute requiresPage="Companies Intelligence">
                    <Layout>
                      <CompaniesIntelligenceDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

               <Route
                path="/location-intelligence"
                element={
                  <ProtectedRoute requiresPage="Location Intelligence">
                    <Layout>
                      <LocationIntelligenceDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />


              <Route
                path="/news"
                element={
                  <ProtectedRoute requiresPage="News">
                    <Layout>
                      <News />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute requiresPage="Reports">
                    <Layout>
                      <ReportsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/news"
                element={
                  <ProtectedRoute requiresPage="News">
                    <Layout>
                      <Signals />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              {/* <Route
                path="/reports/:slug"
                element={
                  <ProtectedRoute requiresPage="Reports">
                    <Layout>
                      <ExtendedSnippet />
                    </Layout>
                  </ProtectedRoute>
                }
              /> */}
               <Route
                path="/reports/:slug"
                element={
                  <ProtectedRoute requiresPage="Reports">
                    <Layout>
                      <ReportTabs />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/signals"
                element={
                  <ProtectedRoute requiresPage="News">
                    <Layout>
                      <Signals />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute requiresPage="*">
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ask-analyst"
                element={
                  <ProtectedRoute requiresPage="Ask Analyst">
                    <Layout>
                      <AskAnalyst />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dcx-ai"
                element={
                  <ProtectedRoute requiresPage="DCX AI">
                    <Layout>
                      <MyRA />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dcx-ai/:conversation_id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MyRA />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* <Route
                path="/dcx-ai/payment"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PaymentsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              /> */}

              {/* 404 Route - Must be last to catch all unmatched routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Toaster position="top-right" />
            <PWADebug />
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
