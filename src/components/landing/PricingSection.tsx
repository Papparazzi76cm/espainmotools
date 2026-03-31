import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Building2, Users } from "lucide-react";

interface PricingSectionProps {
  onGetStarted: () => void;
}

const PricingSection = ({ onGetStarted }: PricingSectionProps) => {
  const individualPlans = [
    {
      name: "Mensual",
      price: "15",
      period: "/mes",
      icon: Zap,
      features: [
        "Acceso a todas las herramientas",
        "Generaciones ilimitadas con IA",
        "Soporte por email",
        "Actualizaciones incluidas",
      ],
      popular: false,
    },
    {
      name: "Anual",
      price: "10",
      period: "/mes",
      badge: "Ahorra un 37%",
      icon: Crown,
      features: [
        "Todo del plan mensual",
        "Generaciones ilimitadas con IA",
        "Soporte prioritario",
        "Nuevas herramientas primero",
        "Facturación anual: 120€/año",
      ],
      popular: true,
    },
  ];

  const agencyPlans = [
    {
      name: "Agencia Mensual",
      price: "49",
      period: "/mes",
      icon: Building2,
      features: [
        "Máximo 10 usuarios",
        "Acceso completo a todas las herramientas",
        "Generaciones ilimitadas con IA",
        "Soporte prioritario",
        "Panel de administración",
      ],
      popular: false,
    },
    {
      name: "Agencia Anual",
      price: "37",
      period: "/mes",
      badge: "Ahorra un 20%",
      icon: Users,
      features: [
        "Máximo 10 usuarios",
        "Todo del plan mensual de agencia",
        "Soporte dedicado",
        "Nuevas herramientas primero",
        "Facturación anual: 444€/año",
      ],
      popular: true,
    },
  ];

  return (
    <section className="relative py-24 px-4" id="pricing">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Precios{" "}
            <span className="text-primary">
              simples y transparentes
            </span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sin sorpresas. Acceso completo a todas las herramientas desde el primer día.
          </p>
        </motion.div>

        {/* Individual Plans */}
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-lg font-semibold text-muted-foreground text-center mb-6 uppercase tracking-wider"
        >
          Individual
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
          {individualPlans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} onGetStarted={onGetStarted} />
          ))}
        </div>

        {/* Agency Plans */}
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-lg font-semibold text-muted-foreground text-center mb-6 uppercase tracking-wider"
        >
          Para Agencias
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
          {agencyPlans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} onGetStarted={onGetStarted} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground"
        >
        ¿Más de 20 usuarios?{" "}
          <button onClick={onGetStarted} className="text-primary hover:underline font-medium">
            Contáctanos para un plan personalizado
          </button>
        </motion.p>
      </div>
    </section>
  );
};

function PlanCard({ plan, index, onGetStarted }: { plan: any; index: number; onGetStarted: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className={`relative rounded-2xl border p-8 transition-all duration-300 ${
        plan.popular
          ? "border-primary/50 bg-primary/10 shadow-2xl shadow-primary/15 scale-[1.02]"
          : "border-border/40 bg-card/50 backdrop-blur-xl"
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/30">
          {plan.badge}
        </span>
      )}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.popular ? "bg-primary/20 border border-primary/30" : "bg-muted border border-border/30"}`}
        >
          <plan.icon className={`h-5 w-5 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
      </div>
      <div className="mb-6">
        <span className="text-4xl font-bold text-foreground">{plan.price}€</span>
        <span className="text-muted-foreground">{plan.period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {plan.features.map((f: string) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Button
        onClick={onGetStarted}
        className={`w-full rounded-xl py-5 transition-all duration-300 ${
          plan.popular
            ? "bg-gradient-to-r from-blue-600 via-primary to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-primary/25 border-0"
            : "border-primary/30 hover:bg-primary/10 hover:border-primary/50"
        }`}
        variant={plan.popular ? "default" : "outline"}
      >
        Empezar Ahora
      </Button>
    </motion.div>
  );
}

export default PricingSection;
