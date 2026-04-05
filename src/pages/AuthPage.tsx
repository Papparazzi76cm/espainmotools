import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X, Building2, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
import SEOHead from "@/components/SEOHead";
import { storeAffiliateRef, getAffiliateRef, clearAffiliateRef } from "@/lib/affiliateTracking";
import { useTranslation } from "react-i18next";

const AuthPage = () => {
  const { t } = useTranslation();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<"agente" | "agencia" | "">("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const refParam = new URLSearchParams(window.location.search).get("ref");
    if (!refParam) return;
    (async () => {
      const { data } = await supabase.from("affiliates").select("affiliate_id, is_active").eq("affiliate_id", refParam).eq("is_active", true).maybeSingle();
      if (data) storeAffiliateRef(data.affiliate_id);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !acceptTerms) { toast.error(t("auth.acceptTermsError")); return; }
    if (!isLogin && !userType) { toast.error(t("auth.selectType")); return; }
    setLoading(true);
    const affiliateRef = getAffiliateRef();
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.welcomeBack"));
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, user_type: userType, referred_by: affiliateRef || undefined }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (affiliateRef) clearAffiliateRef();
        toast.success(t("auth.checkEmail"));
      }
    } catch (error: any) {
      toast.error(error.message || t("auth.authError"));
    } finally {
      setLoading(false);
    }
  };

  const openAuth = (login = true) => { setIsLogin(login); setShowAuth(true); };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Ace-Inmotools",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": t("seo.landing.description"),
    "url": "https://es-ace-inmotools.lovable.app/auth",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "description": "Free trial"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "39"
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <SEOHead
        titleKey="seo.landing.title"
        descriptionKey="seo.landing.description"
        canonical="https://es-ace-inmotools.lovable.app/auth"
        jsonLd={softwareJsonLd}
      />
      <ParticleField />
      <LandingNav onGetStarted={() => openAuth(false)} onLogin={() => openAuth(true)} />
      <HeroSection onGetStarted={() => openAuth(false)} />
      <FeatureCards />
      <HowItWorksSection />
      <PricingSection onGetStarted={() => openAuth(false)} />
      <FooterSection />

      <AnimatePresence>
        {showAuth && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md p-4" onClick={() => setShowAuth(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()}>
              <Card className="w-full max-w-sm border-border/50 bg-card shadow-2xl shadow-primary/10">
                <CardHeader className="text-center relative">
                  <button onClick={() => setShowAuth(false)} className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex items-center justify-center mb-2"><PynmoLogo size="lg" /></div>
                  <p className="text-sm text-muted-foreground">{isLogin ? t("auth.loginTitle") : t("auth.registerTitle")}</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <>
                        <div>
                          <Label>{t("auth.fullName")}</Label>
                          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t("auth.fullNamePlaceholder")} required={!isLogin} />
                        </div>
                        <div>
                          <Label className="mb-2 block">{t("auth.accountType")}</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => setUserType("agente")} className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all text-sm ${userType === "agente" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                              <User className="h-5 w-5" />{t("auth.agent")}
                            </button>
                            <button type="button" onClick={() => setUserType("agencia")} className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all text-sm ${userType === "agencia" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                              <Building2 className="h-5 w-5" />{t("auth.agency")}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    <div><Label>{t("auth.email")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required /></div>
                    <div><Label>{t("auth.password")}</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} /></div>
                    {!isLogin && (
                      <div className="flex items-start gap-2">
                        <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(v) => setAcceptTerms(v === true)} className="mt-0.5" />
                        <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                          {t("auth.acceptTerms")}{" "}
                          <a href="/terminos" target="_blank" className="text-primary underline hover:text-primary/80">{t("auth.termsLink")}</a>
                        </label>
                      </div>
                    )}
                    <Button type="submit" className="w-full rounded-xl shadow-sm shadow-primary/20" disabled={loading || (!isLogin && !acceptTerms)}>
                      {loading ? t("auth.loading") : isLogin ? t("auth.loginButton") : t("auth.createAccount")}
                    </Button>
                  </form>
                  <div className="mt-4 text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
                      {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
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
