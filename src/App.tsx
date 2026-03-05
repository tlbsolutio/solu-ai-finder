import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartSessionProvider } from "@/contexts/CartSessionContext";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ui/error-boundary";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
// Diagnostic page removed from tunnel — kept as file but not routed
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import PrivacyEn from "./pages/PrivacyEn";
import Cookies from "./pages/Cookies";
import CookiesEn from "./pages/CookiesEn";
import Legal from "./pages/Legal";
import LegalEn from "./pages/LegalEn";
import TestConnections from "./pages/TestConnections";
import SeoManager from "./pages/SeoManager";
import CartHome from "./pages/CartHome";
import CartQuickScan from "./pages/CartQuickScan";
import CartSessions from "./pages/CartSessions";
import CartSessionDashboard from "./pages/CartSessionDashboard";
import CartPackWizard from "./pages/CartPackWizard";
import CartPackResults from "./pages/CartPackResults";
import CartLogin from "./pages/CartLogin";
import { AuthGuard } from "./components/cartographie/AuthGuard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <CartSessionProvider>
                <Routes>
                  <Route path="/" element={<MainLayout><Index /></MainLayout>} />
                  <Route path="/diagnostic" element={<Navigate to="/cartographie" replace />} />
                  <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
                  <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />
                  <Route path="/privacy-en" element={<MainLayout><PrivacyEn /></MainLayout>} />
                  <Route path="/cookies" element={<MainLayout><Cookies /></MainLayout>} />
                  <Route path="/cookies-en" element={<MainLayout><CookiesEn /></MainLayout>} />
                  <Route path="/legal" element={<MainLayout><Legal /></MainLayout>} />
                  <Route path="/legal-en" element={<MainLayout><LegalEn /></MainLayout>} />
                  <Route path="/test-connections" element={<MainLayout><TestConnections /></MainLayout>} />
                  <Route path="/seo-manager" element={<MainLayout><SeoManager /></MainLayout>} />
                  {/* Cartographie routes - public */}
                  <Route path="/cartographie" element={<MainLayout><CartHome /></MainLayout>} />
                  <Route path="/cartographie/scan" element={<MainLayout><CartQuickScan /></MainLayout>} />
                  <Route path="/cartographie/login" element={<MainLayout><CartLogin /></MainLayout>} />
                  {/* Cartographie routes - protected */}
                  <Route path="/cartographie/sessions" element={<AuthGuard><CartSessions /></AuthGuard>} />
                  <Route path="/cartographie/sessions/new" element={<AuthGuard><CartSessions /></AuthGuard>} />
                  <Route path="/cartographie/sessions/:id" element={<AuthGuard><CartSessionDashboard /></AuthGuard>} />
                  <Route path="/cartographie/sessions/:id/pack/:packId" element={<AuthGuard><CartPackWizard /></AuthGuard>} />
                  <Route path="/cartographie/sessions/:id/pack/:packId/results" element={<AuthGuard><CartPackResults /></AuthGuard>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
                </Routes>
              </CartSessionProvider>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
