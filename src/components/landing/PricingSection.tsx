import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Building2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PricingSectionProps {
  onGetStarted: () => void;
}

const PricingSection = ({ onGetStarted }: PricingSectionProps) => {
  const { t } = useTranslation();

  const individualPlans = [
    {
      name: t("pricing.monthly"), price: "15", period: t("pricing.perMonth"), icon: Zap,
      features: [t("pricing.feat_allTools"), t("pricing.feat_unlimited"), t("pricing.feat_emailSupport"), t("pricing.feat_updates")],
      popular: false,
    },
    {
      name: t("pricing.annual"), price: "10", period: t("pricing.perMonth"), badge: t("pricing.save37"), icon: Crown,
      features: [t("pricing.feat_allMonthly"), t("pricing.feat_unlimited"), t("pricing.feat_prioritySupport"), t("pricing.feat_newToolsFirst"), t("pricing.feat_annualBilling")],
      popular: true,
    },
  ];

  const agencyPlans = [
    {
      name: t("pricing.agencyMonthly"), price: "49", period: t("pricing.perMonth"), icon: Building2,
      features: [t("pricing.feat_max10"), t("pricing.feat_fullAccess"), t("pricing.feat_unlimited"), t("pricing.feat_prioritySupport"), t("pricing.feat_adminPanel")],
      popular: false,
    },
    {
      name: t("pricing.agencyAnnual"), price: "37", period: t("pricing.perMonth"), badge: t("pricing.save20"), icon: Users,
      features: [t("pricing.feat_max10"), t("pricing.feat_allMonthlyAgency"), t("pricing.feat_dedicatedSupport"), t("pricing.feat_newToolsFirst"), t("pricing.feat_annualBillingAgency")],
      popular: true,
    },
  ];

  return (
    <section className="relative py-24 px-4" id="pricing">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("pricing.title")} <span className="text-primary">{t("pricing.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">{t("pricing.subtitle")}</p>
        </motion.div>

        <motion.h3 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-lg font-semibold text-muted-foreground text-center mb-6 uppercase tracking-wider">
          {t("pricing.individual")}
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
          {individualPlans.map((plan, i) => (
            <PlanCard key={i} plan={plan} index={i} onGetStarted={onGetStarted} ctaLabel={t("pricing.startNow")} />
          ))}
        </div>

        <motion.h3 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-lg font-semibold text-muted-foreground text-center mb-6 uppercase tracking-wider">
          {t("pricing.forAgencies")}
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
          {agencyPlans.map((plan, i) => (
            <PlanCard key={i} plan={plan} index={i} onGetStarted={onGetStarted} ctaLabel={t("pricing.startNow")} />
          ))}
        </div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-sm text-muted-foreground">
          {t("pricing.moreThan10")}{" "}
          <button onClick={onGetStarted} className="text-primary hover:underline font-medium">{t("pricing.contactUs")}</button>
        </motion.p>
      </div>
    </section>
  );
};

function PlanCard({ plan, index, onGetStarted, ctaLabel }: { plan: any; index: number; onGetStarted: () => void; ctaLabel: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ y: -4 }}
      className={`relative rounded-2xl border p-8 transition-all duration-300 ${plan.popular ? "border-primary/50 bg-primary/10 shadow-2xl shadow-primary/15 scale-[1.02]" : "border-border/40 bg-card/50 backdrop-blur-xl"}`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/30">{plan.badge}</span>
      )}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.popular ? "bg-primary/20 border border-primary/30" : "bg-muted border border-border/30"}`}>
          <plan.icon className={`h-5 w-5 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
      </div>
      <div className="mb-6">
        <span className="text-4xl font-bold text-foreground">{plan.price}€</span>
        <span className="text-muted-foreground">{plan.period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {plan.features.map((f: string, i: number) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />{f}
          </li>
        ))}
      </ul>
      <Button onClick={onGetStarted} className={`w-full rounded-xl py-5 transition-all duration-300 ${plan.popular ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 border-0" : "border-primary/30 hover:bg-primary/10 hover:border-primary/50"}`} variant={plan.popular ? "default" : "outline"}>
        {ctaLabel}
      </Button>
    </motion.div>
  );
}

export default PricingSection;
