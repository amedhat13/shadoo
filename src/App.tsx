import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/admin/auth/AdminProtectedRoute";
import { LanguageProvider } from "@/i18n/LanguageProvider";

// Public Pages
import LandingPage from "./pages/Landing";
import NotFound from "./pages/NotFound";

// Client Auth & Pages
import AuthPage from "./pages/Auth";
import ChangePasswordPage from "./pages/ChangePassword";
import ClientDashboard from "./pages/ClientDashboard";
import MissionsPage from "./pages/Missions";
import MissionCreatePage from "./pages/MissionCreate";
import MissionDetailsPage from "./pages/MissionDetails";
import WalletPage from "./pages/Wallet";
import ReportsPage from "./pages/Reports";
import BranchesPage from "./pages/Branches";
import SettingsPage from "./pages/Settings";

// Admin Auth & Pages
import AdminAuthPage from "./pages/admin/AdminAuth";
import AdminDashboardPage from "./pages/admin/AdminDashboard";
import AdminClientsPage from "./pages/admin/AdminClients";
import AdminBranchesPage from "./pages/admin/AdminBranches";
import AdminMissionsPage from "./pages/admin/AdminMissions";
import AdminMissionCreatePage from "./pages/admin/AdminMissionCreate";
import AdminMissionDetailsPage from "./pages/admin/AdminMissionDetails";
import AdminVisitsPage from "./pages/admin/AdminVisits";
import AdminAgentsPage from "./pages/admin/AdminAgents";
import AdminTiersPage from "./pages/admin/AdminTiers";
import AdminPayoutsPage from "./pages/admin/AdminPayouts";
import AdminTemplatesPage from "./pages/admin/AdminTemplates";
import AdminPlansPage from "./pages/admin/AdminPlans";
import AdminFinancePage from "./pages/admin/AdminFinance";
import AdminReportsPage from "./pages/admin/AdminReports";
import AdminConfigPage from "./pages/admin/AdminConfig";
import AdminAuditPage from "./pages/admin/AdminAudit";
import AdminAdminsPage from "./pages/admin/AdminAdmins";
import AdminSalesRequestsPage from "./pages/admin/AdminSalesRequests";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Client Auth */}
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />

            {/* Client Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/missions"
              element={
                <ProtectedRoute>
                  <MissionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/missions/create"
              element={
                <ProtectedRoute>
                  <MissionCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/missions/:id"
              element={
                <ProtectedRoute>
                  <MissionDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/missions/:id/edit"
              element={
                <ProtectedRoute>
                  <MissionCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/branches"
              element={
                <ProtectedRoute>
                  <BranchesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Auth */}
            <Route path="/admin/auth" element={<AdminAuthPage />} />

            {/* Admin Dashboard Routes */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboardPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/clients"
              element={
                <AdminProtectedRoute>
                  <AdminClientsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/branches"
              element={
                <AdminProtectedRoute>
                  <AdminBranchesPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/missions"
              element={
                <AdminProtectedRoute>
                  <AdminMissionsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/missions/create"
              element={
                <AdminProtectedRoute>
                  <AdminMissionCreatePage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/missions/:id"
              element={
                <AdminProtectedRoute>
                  <AdminMissionDetailsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/visits"
              element={
                <AdminProtectedRoute>
                  <AdminVisitsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/agents"
              element={
                <AdminProtectedRoute>
                  <AdminAgentsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/tiers"
              element={
                <AdminProtectedRoute>
                  <AdminTiersPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/payouts"
              element={
                <AdminProtectedRoute>
                  <AdminPayoutsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/templates"
              element={
                <AdminProtectedRoute>
                  <AdminTemplatesPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/plans"
              element={
                <AdminProtectedRoute>
                  <AdminPlansPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/finance"
              element={
                <AdminProtectedRoute>
                  <AdminFinancePage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminProtectedRoute>
                  <AdminReportsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/config"
              element={
                <AdminProtectedRoute>
                  <AdminConfigPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <AdminProtectedRoute>
                  <AdminAuditPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/sales-requests"
              element={
                <AdminProtectedRoute>
                  <AdminSalesRequestsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/admins"
              element={
                <AdminProtectedRoute>
                  <AdminAdminsPage />
                </AdminProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
