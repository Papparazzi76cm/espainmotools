import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X } from "lucide-react";
import PynmoLogo from "@/components/PynmoLogo";
import { motion, AnimatePresence } from "framer-motion";
import ParticleField from "@/components/landing/ParticleField";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import FeatureCards from "@/components/landing/FeatureCards";
import PricingSection from "@/components/landing/PricingSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FooterSection from "@/components/landing/FooterSection";
import ChatbotWidget from "@/components/landing/ChatbotWidget";

const AuthPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Capture ref param for affiliate tracking
  const refParam = new URLSearchParams(window.location.search).get("ref");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("¡Bienvenido de vuelta!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, referred_by: refParam || undefined },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Revisa tu email para confirmar tu cuenta");
      }
    } catch (error: any) {
      toast.error(error.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  const openAuth = (login = true) => {
    setIsLogin(login);
    setShowAuth(true);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <ParticleField />
      <LandingNav onGetStarted={() => openAuth(false)} />

      <HeroSection onGetStarted={() => openAuth(false)} />
      <FeatureCards />
      <HowItWorksSection />
      <PricingSection onGetStarted={() => openAuth(false)} />
      <FooterSection />

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
            onClick={() => setShowAuth(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-sm border-border/50 bg-card shadow-2xl shadow-primary/10">
                <CardHeader className="text-center relative">
                  <button
                    onClick={() => setShowAuth(false)}
                    className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex items-center justify-center mb-2">
                    <PynmoLogo size="lg" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isLogin ? "Inicia sesión en tu cuenta" : "Crea tu cuenta"}
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <div>
                        <Label>Nombre completo</Label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Tu nombre"
                          required={!isLogin}
                        />
                      </div>
                    )}
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                    <div>
                      <Label>Contraseña</Label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-xl shadow-sm shadow-primary/20" disabled={loading}>
                      {loading ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                    </Button>
                  </form>
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-sm text-primary hover:underline"
                    >
                      {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ChatbotWidget />
    </div>
  );
};

export default AuthPage;
