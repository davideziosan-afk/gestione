import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Progetti from "./pages/Progetti";
import CostiFissi from "./pages/CostiFissi";
import Movimenti from "./pages/Movimenti";
import Cashflow from "./pages/Cashflow";
import CompanyPrice from "./pages/CompanyPrice";
import ImportCSV from "./pages/ImportCSV";
import Auth from "./pages/Auth";
import Setup2FA from "./pages/Setup2FA";
import PendingApproval from "./pages/PendingApproval";
import AdminApprovals from "./pages/AdminApprovals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/setup-2fa" element={<ProtectedRoute><Setup2FA /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/progetti" element={<ProtectedRoute><Layout><Progetti /></Layout></ProtectedRoute>} />
            <Route path="/costi-fissi" element={<ProtectedRoute><Layout><CostiFissi /></Layout></ProtectedRoute>} />
            <Route path="/movimenti" element={<ProtectedRoute><Layout><Movimenti /></Layout></ProtectedRoute>} />
            <Route path="/cashflow" element={<ProtectedRoute><Layout><Cashflow /></Layout></ProtectedRoute>} />
            <Route path="/company-price" element={<ProtectedRoute><Layout><CompanyPrice /></Layout></ProtectedRoute>} />
            <Route path="/import" element={<ProtectedRoute><Layout><ImportCSV /></Layout></ProtectedRoute>} />
            <Route path="/admin/approvals" element={<ProtectedRoute><Layout><AdminApprovals /></Layout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;