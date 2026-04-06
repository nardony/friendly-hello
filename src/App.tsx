import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { useSecurityProtection } from "@/hooks/useSecurityProtection";
import { InstallBanner } from "@/components/InstallBanner";
import { GlobalWhatsAppButton } from "@/components/GlobalWhatsAppButton";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { TrackingScripts } from "@/components/TrackingScripts";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LandingPageEditor from "./pages/LandingPageEditor";
import DynamicLandingPage from "./pages/DynamicLandingPage";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Install from "./pages/Install";

import AuthRevenda from "./pages/AuthRevenda";
import AuthRevenda2 from "./pages/AuthRevenda2";
import PanelAccess from "./pages/PanelAccess";
import CreditGenerator from "./pages/CreditGenerator";
import OrderTracking from "./pages/OrderTracking";
import OrderHistory from "./pages/OrderHistory";
import ApiDocs from "./pages/ApiDocs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const SecurityWrapper = ({ children }: { children: React.ReactNode }) => {
  useSecurityProtection();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <TooltipProvider>
      <SecurityWrapper>
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/dashboard/new" element={<LandingPageEditor />} />
              <Route path="/dashboard/edit/:id" element={<LandingPageEditor />} />
              <Route path="/p/:slug" element={<DynamicLandingPage />} />
              <Route path="/termos" element={<TermsOfUse />} />
              <Route path="/privacidade" element={<PrivacyPolicy />} />
              <Route path="/revenda" element={<Navigate to="/gerador" replace />} />
              <Route path="/authrevenda" element={<AuthRevenda />} />
              <Route path="/authrevenda2" element={<AuthRevenda2 />} />
              <Route path="/install" element={<Install />} />
              <Route path="/x7k9m2p4" element={<PanelAccess />} />
              <Route path="/gerador" element={<CreditGenerator />} />
              <Route path="/gerador/acompanhar/:orderId" element={<OrderTracking />} />
              <Route path="/gerador/historico" element={<OrderHistory />} />
              <Route path="/gerador/api" element={<ApiDocs />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <InstallBanner />
            <GlobalWhatsAppButton />
            <CookieConsentBanner />
            <TrackingScripts />
          </AuthProvider>
        </BrowserRouter>
      </SecurityWrapper>
    </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
