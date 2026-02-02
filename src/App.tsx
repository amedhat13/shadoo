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
          {/* Placeholder routes */}
          <Route path="/branches" element={<MissionsPage />} />
          <Route path="/wallet" element={<MissionsPage />} />
          <Route path="/reports" element={<MissionsPage />} />
          <Route path="/settings" element={<MissionsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
