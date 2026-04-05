import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles, ArrowRight, UserPlus, Share2, Users, DollarSign,
  Check, Link2, BarChart3, Zap, ShieldCheck, TrendingUp,
  ChevronDown, X, Building2, Copy,
} from "lucide-react";
import PynmoLogo from "@/components/PynmoLogo";
import ParticleField from "@/components/landing/ParticleField";
import FooterSection from "@/components/landing/FooterSection";
import { toast } from "sonner";

const ORANGE = "#E87722";
const SLATE = "#333F48";

export default function AffiliateLandingPage() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const steps = [
    { icon: UserPlus, titleKey: "step1Title", descKey: "step1Desc" },
    { icon: Share2, titleKey: "step2Title", descKey: "step2Desc" },
    { icon: Users, titleKey: "step3Title", descKey: "step3Desc" },
    { icon: DollarSign, titleKey: "step4Title", descKey: "step4Desc" },
  ];

  const advantages = [
    { icon: ShieldCheck, titleKey: "adv1Title", descKey: "adv1Desc" },
    { icon: BarChart3, titleKey: "adv2Title", descKey: "adv2Desc" },
    { icon: TrendingUp, titleKey: "adv3Title", descKey: "adv3Desc" },
  ];

  const faqs = [
    { qKey: "faq1q", aKey: "faq1a" },
    { qKey: "faq2q", aKey: "faq2a" },
    { qKey: "faq3q", aKey: "faq3a" },
    { qKey: "faq4q", aKey: "faq4a" },
    { qKey: "faq5q", aKey: "faq5a" },
  ];

  const scrollToForm = () => {
    setShowForm(true);
    setTimeout(() => document.getElementById("affiliate-form")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <SEOHead titleKey="seo.affiliate.title" descriptionKey="seo.affiliate.description" canonical="https://es-ace-inmotools.lovable.app/afiliados" />
      <ParticleField />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
          <PynmoLogo size="sm" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              {t("affiliateLanding.login")}
            </Button>
            <Button size="sm" onClick={scrollToForm} className="rounded-lg shadow-sm" style={{ background: ORANGE, color: "#fff" }}>
              {t("affiliateLanding.beAffiliate")}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-20 pb-16">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[128px] bg-[#E87722]/20 glow-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full blur-[100px] bg-[#E87722]/10 glow-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(240_12%_24%)_80%)]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium backdrop-blur-sm mb-6"
            style={{ borderColor: `${ORANGE}60`, background: `${ORANGE}15`, color: ORANGE }}
          >
            <Zap className="h-3.5 w-3.5" />
            {t("affiliateLanding.badge")}
          </motion.span>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground leading-tight"
          >
            {t("affiliateLanding.heroTitle1")}{" "}
            <span style={{ color: ORANGE }}>{t("affiliateLanding.heroTitle2")}</span>{" "}
            {t("affiliateLanding.heroTitle3")}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t("affiliateLanding.heroSubtitle") }}
          />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" onClick={scrollToForm}
              className="group text-base px-8 py-6 rounded-xl border-0 shadow-xl transition-all duration-300 font-semibold"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, #F59E0B)`, color: "#fff", boxShadow: `0 10px 40px ${ORANGE}40` }}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {t("affiliateLanding.heroCta")}
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-14 grid grid-cols-3 gap-8 max-w-md mx-auto"
          >
            {[
              { value: "20%", label: t("affiliateLanding.statMaxCommission") },
              { value: "50€", label: t("affiliateLanding.statMinPayout") },
              { value: "∞", label: t("affiliateLanding.statNoLimits") },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold" style={{ color: ORANGE }}>{s.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4">{t("affiliateLanding.howItWorks")}</h2>
            <p className="text-muted-foreground text-lg">{t("affiliateLanding.howItWorksSubtitle")}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full hover:border-[#E87722]/40 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${ORANGE}15` }}>
                      <step.icon className="h-7 w-7" style={{ color: ORANGE }} />
                    </div>
                    <div className="text-xs font-bold rounded-full px-3 py-1 inline-block mb-3" style={{ background: `${ORANGE}20`, color: ORANGE }}>
                      {i + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{t(`affiliateLanding.${step.titleKey}`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`affiliateLanding.${step.descKey}`)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ADVANTAGES */}
      <section className="py-20 px-4" style={{ background: `${SLATE}15` }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4">{t("affiliateLanding.whyAffiliate")}</h2>
            <p className="text-muted-foreground text-lg">{t("affiliateLanding.whySubtitle")}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {advantages.map((adv, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${ORANGE}15` }}>
                      <adv.icon className="h-6 w-6" style={{ color: ORANGE }} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{t(`affiliateLanding.${adv.titleKey}`)}</h3>
                    <p className="text-muted-foreground">{t(`affiliateLanding.${adv.descKey}`)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="affiliate-form" className="py-20 px-4">
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{t("affiliateLanding.registerTitle")}</h2>
            <p className="text-muted-foreground">{t("affiliateLanding.registerSubtitle")}</p>
          </motion.div>
          <AffiliateSignupForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4" style={{ background: `${SLATE}10` }}>
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{t("affiliateLanding.faqTitle")}</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left p-5 flex items-center justify-between gap-4">
                    <span className="font-medium text-foreground">{t(`affiliateLanding.${faq.qKey}`)}</span>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
                          {t(`affiliateLanding.${faq.aKey}`)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4">{t("affiliateLanding.readyTitle")}</h2>
          <p className="text-muted-foreground text-lg mb-8">{t("affiliateLanding.readySubtitle")}</p>
          <Button size="lg" onClick={scrollToForm}
            className="group text-base px-10 py-6 rounded-xl border-0 shadow-xl transition-all duration-300 font-semibold"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, #F59E0B)`, color: "#fff", boxShadow: `0 10px 40px ${ORANGE}40` }}
          >
            <Link2 className="h-5 w-5 mr-2" />
            {t("affiliateLanding.readyCta")}
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </section>

      <FooterSection />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Signup Form component                                 */
/* ═══════════════════════════════════════════════════════ */

function AffiliateSignupForm() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ affiliate_id: string; link: string } | null>(null);
  const navigate = useNavigate();

  const ORANGE = "#E87722";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      toast.error(t("affiliateLanding.formAcceptError"));
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("affiliate-register", {
        body: { email, password, full_name: fullName, company },
      });
      if (error) throw new Error(error.message);
      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }
      setResult({ affiliate_id: data.affiliate_id, link: data.link });
      toast.success(t("affiliateLanding.formSuccess"));
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (!loginError) {
        setTimeout(() => navigate("/mi-afiliado"), 1500);
      }
    } catch (err: any) {
      toast.error(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="border-border/50 bg-card shadow-2xl" style={{ boxShadow: `0 0 60px ${ORANGE}15` }}>
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: `${ORANGE}20` }}>
              <Check className="h-8 w-8" style={{ color: ORANGE }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">{t("affiliateLanding.resultWelcome")}</h3>
              <p className="text-muted-foreground text-sm">{t("affiliateLanding.resultLinkReady")}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <Label className="text-xs text-muted-foreground mb-2 block">{t("affiliateLanding.resultYourLink")}</Label>
              <div className="flex gap-2">
                <Input readOnly value={result.link} className="font-mono text-xs bg-background" />
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result.link); toast.success(t("affiliateLanding.resultCopied")); }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t("affiliateLanding.resultRedirecting")}</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card className="border-border/50 bg-card shadow-2xl" style={{ boxShadow: `0 0 60px ${ORANGE}10` }}>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-foreground">{t("affiliateLanding.formFullName")}</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t("affiliateLanding.formFullNamePlaceholder")} required className="mt-1.5" />
            </div>
            <div>
              <Label className="text-foreground">{t("affiliateLanding.formEmail")}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required className="mt-1.5" />
            </div>
            <div>
              <Label className="text-foreground">{t("affiliateLanding.formPassword")}</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("affiliateLanding.formPasswordPlaceholder")} required minLength={6} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-foreground">{t("affiliateLanding.formCompany")} <span className="text-muted-foreground text-xs">{t("affiliateLanding.formCompanyOptional")}</span></Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={t("affiliateLanding.formCompanyPlaceholder")} className="mt-1.5" />
            </div>
            <div className="flex items-start gap-3 pt-1">
              <Checkbox id="terms" checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} className="mt-0.5" />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                {t("affiliateLanding.formAcceptTerms")}{" "}
                <a href="/terminos-afiliados" target="_blank" className="underline hover:text-foreground" style={{ color: ORANGE }}>
                  {t("affiliateLanding.formTermsLink")}
                </a>{" "}
                {t("affiliateLanding.formPrivacy")}
              </label>
            </div>
            <Button type="submit" disabled={loading}
              className="w-full py-6 rounded-xl text-base font-semibold border-0 shadow-lg transition-all"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, #F59E0B)`, color: "#fff", boxShadow: `0 8px 30px ${ORANGE}30` }}
            >
              {loading ? t("affiliateLanding.formSubmitting") : t("affiliateLanding.formSubmit")}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {t("affiliateLanding.formHasAccount")}{" "}
              <a href="/auth" className="hover:underline" style={{ color: ORANGE }}>
                {t("affiliateLanding.formLogin")}
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
