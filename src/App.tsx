import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TrialProvider } from "@/contexts/TrialContext";
import { CountryProvider } from "@/contexts/CountryContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import DescripcionesPage from "./pages/DescripcionesPage";
import CostesPage from "./pages/CostesPage";
import RentabilidadPage from "./pages/RentabilidadPage";
import ConsultorLegalPage from "./pages/ConsultorLegalPage";

import EntornoPage from "./pages/EntornoPage";
import GuionesPage from "./pages/GuionesPage";
import CaptacionPage from "./pages/CaptacionPage";
import ContratosPage from "./pages/ContratosPage";
import HomeStagingPage from "./pages/HomeStagingPage";
import InformesPage from "./pages/InformesPage";
import RolePlayPage from "./pages/RolePlayPage";
import ToolPlaceholder from "./pages/ToolPlaceholder";
import AdminPage from "./pages/AdminPage";
import AgencyPage from "./pages/AgencyPage";
import AffiliatePage from "./pages/AffiliatePage";
import NotFound from "./pages/NotFound";
import AffiliateLandingPage from "./pages/AffiliateLandingPage";
import AffiliateTermsPage from "./pages/AffiliateTermsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import CookiesPolicyPage from "./pages/CookiesPolicyPage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import LegalNoticePage from "./pages/LegalNoticePage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import { ToolGuard } from "@/components/ToolGuard";
import CookieConsentBanner from "@/components/CookieConsentBanner";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <TrialProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/herramientas/descripciones" element={<ToolGuard toolId="descripciones"><DescripcionesPage /></ToolGuard>} />
          <Route path="/herramientas/costes" element={<ToolGuard toolId="costes"><CostesPage /></ToolGuard>} />
          <Route path="/herramientas/rentabilidad" element={<ToolGuard toolId="rentabilidad"><RentabilidadPage /></ToolGuard>} />
          <Route path="/herramientas/consultor-legal" element={<ToolGuard toolId="consultor-legal"><ConsultorLegalPage /></ToolGuard>} />
          <Route path="/herramientas/anuncios" element={<Navigate to="/herramientas/descripciones" replace />} />
          <Route path="/herramientas/entorno" element={<ToolGuard toolId="entorno"><EntornoPage /></ToolGuard>} />
          <Route path="/herramientas/guiones" element={<ToolGuard toolId="guiones"><GuionesPage /></ToolGuard>} />
          <Route path="/herramientas/captacion" element={<ToolGuard toolId="captacion"><CaptacionPage /></ToolGuard>} />
          <Route path="/herramientas/contratos" element={<ToolGuard toolId="contratos"><ContratosPage /></ToolGuard>} />
          <Route path="/herramientas/home-staging" element={<ToolGuard toolId="home-staging"><HomeStagingPage /></ToolGuard>} />
          <Route path="/herramientas/informes" element={<ToolGuard toolId="informes"><InformesPage /></ToolGuard>} />
          <Route path="/herramientas/roleplay" element={<ToolGuard toolId="roleplay"><RolePlayPage /></ToolGuard>} />
          <Route path="/herramientas/:toolId" element={<ToolPlaceholder />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/mi-agencia" element={<AgencyPage />} />
          <Route path="/mi-afiliado" element={<AffiliatePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </TrialProvider>
  );
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthRoute />} />
              <Route path="/afiliados" element={<AffiliateLandingPage />} />
              <Route path="/terminos-afiliados" element={<AffiliateTermsPage />} />
              <Route path="/terminos" element={<TermsOfUsePage />} />
              <Route path="/politica-privacidad" element={<PrivacyPolicyPage />} />
              <Route path="/politica-cookies" element={<CookiesPolicyPage />} />
              <Route path="/aviso-legal" element={<LegalNoticePage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
            <CookieConsentBanner />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
