import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

/* ── PANTONE palette ── */
const ORANGE = "#E87722";
const SLATE = "#333F48";

/* ── FAQ data ── */
const faqs = [
  { q: "¿Necesito vender yo directamente?", a: "No. El sistema rastrea automáticamente los registros que llegan a través de tu enlace personal. Solo comparte y gana." },
  { q: "¿Cuándo recibo mi comisión?", a: "Tras el pago confirmado del cliente referido. Las comisiones se generan automáticamente y puedes hacer seguimiento en tu panel." },
  { q: "¿Cuánto puedo ganar?", a: "Hasta un 20% de comisión por cada cliente. No hay límite de referidos, así que tus ingresos solo dependen de tu alcance." },
  { q: "¿Necesito conocimientos técnicos?", a: "En absoluto. Recibes un enlace único y solo necesitas compartirlo. Todo el seguimiento y cálculo de comisiones es automático." },
  { q: "¿Hay un mínimo de cobro?", a: "Sí, el umbral mínimo para solicitar un cobro es de 50€ en comisiones acumuladas." },
];

/* ── Steps data ── */
const steps = [
  { icon: UserPlus, title: "Regístrate", desc: "Crea tu cuenta de afiliado y obtén tu enlace personal único" },
  { icon: Share2, title: "Comparte", desc: "Envía tu enlace a tu red de contactos, redes sociales o blog" },
  { icon: Users, title: "Refieren", desc: "Los usuarios se registran a través de tu enlace y empiezan a usar la plataforma" },
  { icon: DollarSign, title: "Gana", desc: "Recibe comisiones automáticas por cada cliente que pague" },
];

/* ── Advantages ── */
const advantages = [
  { icon: ShieldCheck, title: "Sin venta activa", desc: "No necesitas realizar llamadas ni cerrar ventas. Solo comparte tu enlace." },
  { icon: BarChart3, title: "Seguimiento automático", desc: "Panel en tiempo real con métricas de referidos, comisiones y pagos." },
  { icon: TrendingUp, title: "Producto en crecimiento", desc: "IA aplicada al sector inmobiliario: un mercado con demanda creciente." },
];

export default function AffiliateLandingPage() {
  const [showForm, setShowForm] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const scrollToForm = () => {
    setShowForm(true);
    setTimeout(() => document.getElementById("affiliate-form")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <ParticleField />

      {/* ── Nav ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
          <PynmoLogo size="sm" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Iniciar sesión
            </Button>
            <Button
              size="sm"
              onClick={scrollToForm}
              className="rounded-lg shadow-sm"
              style={{ background: ORANGE, color: "#fff" }}
            >
              Ser afiliado
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-20 pb-16">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[128px] bg-[#E87722]/20 glow-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full blur-[100px] bg-[#E87722]/10 glow-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(240_12%_24%)_80%)]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium backdrop-blur-sm mb-6"
            style={{ borderColor: `${ORANGE}60`, background: `${ORANGE}15`, color: ORANGE }}
          >
            <Zap className="h-3.5 w-3.5" />
            Programa de Afiliados
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground leading-tight"
          >
            Gana dinero recomendando{" "}
            <span style={{ color: ORANGE }}>herramientas de IA</span>{" "}
            para inmobiliarias
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Hasta un <strong className="text-foreground">20% de comisión</strong> por cada cliente que refieras, sin complicaciones
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={scrollToForm}
              className="group text-base px-8 py-6 rounded-xl border-0 shadow-xl transition-all duration-300 font-semibold"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, #F59E0B)`, color: "#fff", boxShadow: `0 10px 40px ${ORANGE}40` }}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Quiero ser afiliado
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-14 grid grid-cols-3 gap-8 max-w-md mx-auto"
          >
            {[
              { value: "20%", label: "Comisión máxima" },
              { value: "50€", label: "Cobro mínimo" },
              { value: "∞", label: "Sin límites" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold" style={{ color: ORANGE }}>{s.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4">Cómo funciona</h2>
            <p className="text-muted-foreground text-lg">4 pasos simples para empezar a ganar</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full hover:border-[#E87722]/40 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: `${ORANGE}15` }}
                    >
                      <step.icon className="h-7 w-7" style={{ color: ORANGE }} />
                    </div>
                    <div
                      className="text-xs font-bold rounded-full px-3 py-1 inline-block mb-3"
                      style={{ background: `${ORANGE}20`, color: ORANGE }}
                    >
                      Paso {i + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VENTAJAS ── */}
      <section className="py-20 px-4" style={{ background: `${SLATE}15` }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4">¿Por qué ser afiliado?</h2>
            <p className="text-muted-foreground text-lg">Ventajas que hacen la diferencia</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {advantages.map((adv, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
                  <CardContent className="p-8">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                      style={{ background: `${ORANGE}15` }}
                    >
                      <adv.icon className="h-6 w-6" style={{ color: ORANGE }} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{adv.title}</h3>
                    <p className="text-muted-foreground">{adv.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMULARIO ── */}
      <section id="affiliate-form" className="py-20 px-4">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Regístrate como afiliado</h2>
            <p className="text-muted-foreground">Crea tu cuenta y empieza a ganar comisiones hoy</p>
          </motion.div>

          <AffiliateSignupForm />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4" style={{ background: `${SLATE}10` }}>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Preguntas frecuentes</h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4"
                  >
                    <span className="font-medium text-foreground">{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
                          {faq.a}
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

      {/* ── CTA FINAL ── */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4">
            ¿Listo para empezar a ganar?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Activa tu enlace de afiliado ahora y empieza a generar ingresos pasivos
          </p>
          <Button
            size="lg"
            onClick={scrollToForm}
            className="group text-base px-10 py-6 rounded-xl border-0 shadow-xl transition-all duration-300 font-semibold"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, #F59E0B)`, color: "#fff", boxShadow: `0 10px 40px ${ORANGE}40` }}
          >
            <Link2 className="h-5 w-5 mr-2" />
            Activar mi enlace de afiliado ahora
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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ affiliate_id: string; link: string } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      toast.error("Debes aceptar las condiciones para continuar");
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
      toast.success("¡Cuenta de afiliado creada con éxito!");

      // Auto-login
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (!loginError) {
        setTimeout(() => navigate("/mi-afiliado"), 1500);
      }
    } catch (err: any) {
      toast.error(err.message || "Error al crear la cuenta");
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
              <h3 className="text-xl font-bold text-foreground mb-2">¡Bienvenido al programa!</h3>
              <p className="text-muted-foreground text-sm">Tu enlace de afiliado está listo</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <Label className="text-xs text-muted-foreground mb-2 block">Tu enlace personal</Label>
              <div className="flex gap-2">
                <Input readOnly value={result.link} className="font-mono text-xs bg-background" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(result.link);
                    toast.success("¡Enlace copiado!");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Redirigiendo a tu panel de afiliado...</p>
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
              <Label className="text-foreground">Nombre completo *</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre y apellidos"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-foreground">Email *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-foreground">Contraseña *</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-foreground">Empresa <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nombre de tu empresa"
                className="mt-1.5"
              />
            </div>
            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="terms"
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v === true)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                Acepto las{" "}
                <a href="/terminos-afiliados" target="_blank" className="underline hover:text-foreground" style={{ color: ORANGE }}>
                  condiciones del programa de afiliados
                </a>{" "}
                y la política de privacidad
              </label>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 rounded-xl text-base font-semibold border-0 shadow-lg transition-all"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, #F59E0B)`, color: "#fff", boxShadow: `0 8px 30px ${ORANGE}30` }}
            >
              {loading ? "Creando cuenta..." : "Crear mi cuenta de afiliado"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <a href="/auth" className="hover:underline" style={{ color: ORANGE }}>
                Inicia sesión
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
