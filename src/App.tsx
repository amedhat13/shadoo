import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import MissionsPage from "./pages/Missions";
import MissionCreatePage from "./pages/MissionCreate";
import MissionDetailsPage from "./pages/MissionDetails";
import WalletPage from "./pages/Wallet";
import ReportsPage from "./pages/Reports";
import BranchesPage from "./pages/Branches";
import SettingsPage from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
