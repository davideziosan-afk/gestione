import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Progetti from "./pages/Progetti";
import CostiFissi from "./pages/CostiFissi";
import Movimenti from "./pages/Movimenti";
import Cashflow from "./pages/Cashflow";
import CompanyPrice from "./pages/CompanyPrice";
import ImportCSV from "./pages/ImportCSV";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/progetti" element={<Layout><Progetti /></Layout>} />
          <Route path="/costi-fissi" element={<Layout><CostiFissi /></Layout>} />
          <Route path="/movimenti" element={<Layout><Movimenti /></Layout>} />
          <Route path="/cashflow" element={<Layout><Cashflow /></Layout>} />
          <Route path="/company-price" element={<Layout><CompanyPrice /></Layout>} />
          <Route path="/import" element={<Layout><ImportCSV /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;