import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { useCountry } from "@/contexts/CountryContext";
import { getLegalNoticeSections } from "@/lib/legalContent";

const LegalNoticePage = () => {
  const { t, i18n } = useTranslation();
  const { selectedCountry } = useCountry();
  const isEn = i18n.language?.startsWith("en");
  const sections = getLegalNoticeSections(isEn, selectedCountry);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead titleKey="seo.legalNotice.title" descriptionKey="seo.legalNotice.description" canonical="https://es-ace-inmotools.lovable.app/aviso-legal" />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild><a href="/auth"><ArrowLeft className="h-4 w-4 mr-1" />{t("legal.back")}</a></Button>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold mb-2">{t("legal.legalNoticeTitle")}</h1>
          <p className="text-sm text-muted-foreground mb-4">
            {selectedCountry && <span className="inline-block mr-2 text-base">{selectedCountry.flag_emoji} {selectedCountry.country_name}</span>}
          </p>
          <p className="text-sm text-muted-foreground mb-8">{t("legal.lastUpdated")} {new Date().toLocaleDateString(isEn ? "en-US" : "es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
          <div className="space-y-8">
            {sections.map((s, i) => (
              <motion.section key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.4 }}>
                <h2 className="text-lg font-semibold mb-2">{s.title}</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{s.content}</p>
              </motion.section>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalNoticePage;
