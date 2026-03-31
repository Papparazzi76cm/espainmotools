import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TrialProvider } from "@/contexts/TrialContext";
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
import NotFound from "./pages/NotFound";

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
          <Route path="/herramientas/descripciones" element={<DescripcionesPage />} />
          <Route path="/herramientas/costes" element={<CostesPage />} />
          <Route path="/herramientas/rentabilidad" element={<RentabilidadPage />} />
          <Route path="/herramientas/consultor-legal" element={<ConsultorLegalPage />} />
          <Route path="/herramientas/anuncios" element={<AnunciosPage />} />
          <Route path="/herramientas/entorno" element={<EntornoPage />} />
          <Route path="/herramientas/guiones" element={<GuionesPage />} />
          <Route path="/herramientas/captacion" element={<CaptacionPage />} />
          <Route path="/herramientas/contratos" element={<ContratosPage />} />
          <Route path="/herramientas/home-staging" element={<HomeStagingPage />} />
          <Route path="/herramientas/informes" element={<InformesPage />} />
          <Route path="/herramientas/roleplay" element={<RolePlayPage />} />
          <Route path="/herramientas/:toolId" element={<ToolPlaceholder />} />
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
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
