import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/missions/create" element={<MissionCreatePage />} />
          <Route path="/missions/:id" element={<MissionDetailsPage />} />
          <Route path="/missions/:id/edit" element={<MissionCreatePage />} />
          <Route path="/branches" element={<BranchesPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
