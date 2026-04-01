import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const sectionsES = [
  { title: "1. ¿Qué son las cookies?", content: "Las cookies son pequeños archivos de texto que los sitios web almacenan en su dispositivo cuando los visita." },
  { title: "2. ¿Qué tipos de cookies utilizamos?", content: "• Cookies técnicas o necesarias: Son imprescindibles para el funcionamiento del sitio web.\n\n• Cookies de preferencias: Permiten recordar información como el idioma.\n\n• Cookies analíticas: Permiten el seguimiento y análisis estadístico del comportamiento de los usuarios.\n\n• Cookies de marketing: Almacenan información del comportamiento para ofrecer publicidad personalizada." },
  { title: "3. Cookies de terceros", content: "Algunos servicios de terceros pueden instalar cookies en su dispositivo cuando visita nuestra plataforma." },
  { title: "4. ¿Cómo gestionar las cookies?", content: "Puede permitir, bloquear o eliminar las cookies instaladas mediante la configuración de su navegador.\n\n• Google Chrome: chrome://settings/cookies\n• Mozilla Firefox: about:preferences#privacy\n• Safari: Preferencias > Privacidad\n• Microsoft Edge: edge://settings/content/cookies" },
  { title: "5. Base jurídica", content: "La base jurídica para el uso de cookies técnicas es el interés legítimo (art. 6.1.f RGPD). Para el resto de cookies, la base es el consentimiento del usuario (art. 6.1.a RGPD)." },
  { title: "6. Período de conservación", content: "Las cookies de sesión se eliminan al cerrar el navegador. Las cookies persistentes tienen duración variable." },
  { title: "7. Actualizaciones", content: "Esta Política de Cookies puede ser actualizada periódicamente." },
  { title: "8. Legislación aplicable", content: "• Reglamento (UE) 2016/679 (RGPD)\n• Ley Orgánica 3/2018 (LOPDGDD)\n• Ley 34/2002 (LSSI-CE)\n• Directiva 2002/58/CE (Directiva ePrivacy)" },
];

const sectionsEN = [
  { title: "1. What are cookies?", content: "Cookies are small text files that websites store on your device when you visit them." },
  { title: "2. What types of cookies do we use?", content: "• Technical or necessary cookies: Essential for website operation.\n\n• Preference cookies: Allow remembering information such as language.\n\n• Analytical cookies: Allow tracking and statistical analysis of user behavior.\n\n• Marketing cookies: Store behavioral information to offer personalized advertising." },
  { title: "3. Third-party cookies", content: "Some third-party services may install cookies on your device when you visit our platform." },
  { title: "4. How to manage cookies?", content: "You can allow, block or delete installed cookies through your browser settings.\n\n• Google Chrome: chrome://settings/cookies\n• Mozilla Firefox: about:preferences#privacy\n• Safari: Preferences > Privacy\n• Microsoft Edge: edge://settings/content/cookies" },
  { title: "5. Legal basis", content: "The legal basis for technical cookies is legitimate interest (Art. 6.1.f GDPR). For other cookies, the basis is user consent (Art. 6.1.a GDPR)." },
  { title: "6. Retention period", content: "Session cookies are deleted when the browser is closed. Persistent cookies have variable duration." },
  { title: "7. Updates", content: "This Cookie Policy may be updated periodically." },
  { title: "8. Applicable legislation", content: "• Regulation (EU) 2016/679 (GDPR)\n• Organic Law 3/2018 (LOPDGDD)\n• Law 34/2002 (LSSI-CE)\n• Directive 2002/58/EC (ePrivacy Directive)" },
];

const CookiesPolicyPage = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const sections = isEn ? sectionsEN : sectionsES;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild><a href="/auth"><ArrowLeft className="h-4 w-4 mr-1" />{t("legal.back")}</a></Button>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold mb-2">{t("legal.cookiesTitle")}</h1>
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

export default CookiesPolicyPage;
