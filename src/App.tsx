import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartSessionProvider } from "@/contexts/CartSessionContext";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "./components/ui/error-boundary";
import RouteErrorBoundary from "./components/RouteErrorBoundary";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import PrivacyEn from "./pages/PrivacyEn";
import Cookies from "./pages/Cookies";
import CookiesEn from "./pages/CookiesEn";
import Legal from "./pages/Legal";
import LegalEn from "./pages/LegalEn";
import TestConnections from "./pages/TestConnections";
import SeoManager from "./pages/SeoManager";
import CartSessions from "./pages/CartSessions";
import CartLogin from "./pages/CartLogin";
import CartPricing from "./pages/CartPricing";
import CartPaymentSuccess from "./pages/CartPaymentSuccess";
import { AuthGuard } from "./components/cartographie/AuthGuard";
import CartLayout from "./components/layout/CartLayout";
import CartHome from "./pages/CartHome";
import NotFound from "./pages/NotFound";

// Lazy-loaded heavy pages
const CartSessionDashboard = React.lazy(() => import("./pages/CartSessionDashboard"));
const CartPackWizard = React.lazy(() => import("./pages/CartPackWizard"));
const CartPackResults = React.lazy(() => import("./pages/CartPackResults"));
const CartAdmin = React.lazy(() => import("./pages/CartAdmin"));
const CartQuickScan = React.lazy(() => import("./pages/CartQuickScan"));
const CartAffiliateManager = React.lazy(() => import("./pages/CartAffiliateManager"));
const CartPartnerDeck = React.lazy(() => import("./pages/CartPartnerDeck"));

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/** Wrapper that remounts RouteErrorBoundary on route change, clearing stale error state */
function KeyedRouteErrorBoundary({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return <RouteErrorBoundary key={pathname}>{children}</RouteErrorBoundary>;
}

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="light" storageKey="solutio-theme">
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <CartSessionProvider>
                <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
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
                  {/* Cartographie routes - public (tool subdomain feel) */}
                  <Route path="/cartographie" element={<MainLayout><CartHome /></MainLayout>} />
                  <Route path="/cartographie/login" element={<CartLogin />} />
                  <Route path="/cartographie/pricing" element={<AuthGuard><CartLayout><CartPricing /></CartLayout></AuthGuard>} />
                  <Route path="/cartographie/payment-success" element={<AuthGuard><CartLayout><CartPaymentSuccess /></CartLayout></AuthGuard>} />
                  {/* Cartographie routes - protected, wrapped in RouteErrorBoundary */}
                  <Route path="/cartographie/scan" element={<KeyedRouteErrorBoundary><CartLayout><CartQuickScan /></CartLayout></KeyedRouteErrorBoundary>} />
                  <Route path="/cartographie/sessions" element={<AuthGuard><KeyedRouteErrorBoundary><CartLayout><CartSessions /></CartLayout></KeyedRouteErrorBoundary></AuthGuard>} />
                  <Route path="/cartographie/sessions/new" element={<AuthGuard><KeyedRouteErrorBoundary><CartLayout><CartSessions /></CartLayout></KeyedRouteErrorBoundary></AuthGuard>} />
                  <Route path="/cartographie/sessions/:id" element={<AuthGuard><KeyedRouteErrorBoundary><CartLayout><CartSessionDashboard /></CartLayout></KeyedRouteErrorBoundary></AuthGuard>} />
                  <Route path="/cartographie/sessions/:id/pack/:packId" element={<AuthGuard><KeyedRouteErrorBoundary><CartLayout><CartPackWizard /></CartLayout></KeyedRouteErrorBoundary></AuthGuard>} />
                  <Route path="/cartographie/sessions/:id/pack/:packId/results" element={<AuthGuard><KeyedRouteErrorBoundary><CartLayout><CartPackResults /></CartLayout></KeyedRouteErrorBoundary></AuthGuard>} />
                  <Route path="/cartographie/admin" element={<AuthGuard><KeyedRouteErrorBoundary><CartLayout><CartAdmin /></CartLayout></KeyedRouteErrorBoundary></AuthGuard>} />
                  <Route path="/cartographie/admin/affiliates" element={<AuthGuard><KeyedRouteErrorBoundary><CartLayout><CartAffiliateManager /></CartLayout></KeyedRouteErrorBoundary></AuthGuard>} />
                  <Route path="/cartographie/admin/partner-deck" element={<AuthGuard><KeyedRouteErrorBoundary><CartLayout><CartPartnerDeck /></CartLayout></KeyedRouteErrorBoundary></AuthGuard>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
                </Routes>
                </React.Suspense>
              </CartSessionProvider>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </HelmetProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
