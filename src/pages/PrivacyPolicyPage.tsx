import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const sectionsES = [
  { title: "1. Responsable del tratamiento", content: "El responsable del tratamiento de los datos personales recogidos a través de esta plataforma es Ace-inmotools. Puede contactar con nosotros a través del correo electrónico disponible en la sección de contacto de nuestra web." },
  { title: "2. Datos que recopilamos", content: "Recopilamos los datos personales que usted nos proporciona voluntariamente al registrarse o utilizar nuestros servicios, incluyendo: nombre completo, dirección de correo electrónico, nombre de empresa (opcional), y datos de uso de la plataforma." },
  { title: "3. Finalidad del tratamiento", content: "Los datos personales se tratan con las siguientes finalidades:\n\n• Gestión de la cuenta de usuario y prestación de los servicios contratados.\n• Comunicaciones relacionadas con el servicio.\n• Mejora de la experiencia de usuario.\n• Gestión del programa de afiliados.\n• Cumplimiento de obligaciones legales." },
  { title: "4. Base jurídica del tratamiento", content: "El tratamiento de sus datos se fundamenta en:\n\n• La ejecución del contrato de servicios (art. 6.1.b RGPD).\n• Su consentimiento expreso (art. 6.1.a RGPD).\n• El interés legítimo del responsable (art. 6.1.f RGPD).\n• El cumplimiento de obligaciones legales (art. 6.1.c RGPD)." },
  { title: "5. Plazo de conservación", content: "Los datos personales se conservarán mientras se mantenga la relación contractual y, una vez finalizada, durante los plazos legalmente establecidos." },
  { title: "6. Destinatarios de los datos", content: "No se cederán datos personales a terceros salvo obligación legal o cuando sea necesario para la prestación del servicio." },
  { title: "7. Transferencias internacionales", content: "En caso de que sus datos sean tratados por proveedores ubicados fuera del Espacio Económico Europeo, nos aseguraremos de que existan garantías adecuadas conforme al artículo 46 del RGPD." },
  { title: "8. Derechos del interesado", content: "Usted tiene derecho a:\n\n• Acceder a sus datos personales.\n• Rectificar datos inexactos.\n• Solicitar la supresión de sus datos.\n• Oponerse al tratamiento.\n• Solicitar la limitación del tratamiento.\n• Solicitar la portabilidad de sus datos.\n• Retirar el consentimiento en cualquier momento." },
  { title: "9. Medidas de seguridad", content: "Hemos adoptado las medidas técnicas y organizativas necesarias para garantizar la seguridad de sus datos personales." },
  { title: "10. Uso de cookies", content: "Esta plataforma puede utilizar cookies propias y de terceros. Para más información, consulte nuestra política de cookies." },
  { title: "11. Modificaciones de la política", content: "Nos reservamos el derecho a modificar esta Política de Privacidad en cualquier momento." },
  { title: "12. Legislación aplicable", content: "Esta Política de Privacidad se rige por:\n\n• Reglamento (UE) 2016/679 (RGPD).\n• Ley Orgánica 3/2018 (LOPDGDD).\n• Ley 34/2002 (LSSI-CE)." },
];

const sectionsEN = [
  { title: "1. Data controller", content: "The data controller for personal data collected through this platform is Ace-inmotools. You can contact us through the email address available in the contact section of our website." },
  { title: "2. Data we collect", content: "We collect personal data that you voluntarily provide when registering or using our services, including: full name, email address, company name (optional), and platform usage data." },
  { title: "3. Purpose of processing", content: "Personal data is processed for the following purposes:\n\n• User account management and service provision.\n• Service-related communications.\n• User experience improvement.\n• Affiliate program management.\n• Compliance with legal obligations." },
  { title: "4. Legal basis for processing", content: "The processing of your data is based on:\n\n• Performance of the service contract (Art. 6.1.b GDPR).\n• Your express consent (Art. 6.1.a GDPR).\n• Legitimate interest of the controller (Art. 6.1.f GDPR).\n• Compliance with legal obligations (Art. 6.1.c GDPR)." },
  { title: "5. Retention period", content: "Personal data will be retained while the contractual relationship is maintained and, once terminated, for the legally established periods." },
  { title: "6. Data recipients", content: "Personal data will not be transferred to third parties except by legal obligation or when necessary for service provision." },
  { title: "7. International transfers", content: "If your data is processed by providers located outside the European Economic Area, we will ensure adequate safeguards exist in accordance with Article 46 of the GDPR." },
  { title: "8. Data subject rights", content: "You have the right to:\n\n• Access your personal data.\n• Rectify inaccurate data.\n• Request erasure of your data.\n• Object to processing.\n• Request restriction of processing.\n• Request data portability.\n• Withdraw consent at any time." },
  { title: "9. Security measures", content: "We have adopted the necessary technical and organizational measures to ensure the security of your personal data." },
  { title: "10. Use of cookies", content: "This platform may use its own and third-party cookies. For more information, please consult our cookie policy." },
  { title: "11. Policy modifications", content: "We reserve the right to modify this Privacy Policy at any time." },
  { title: "12. Applicable legislation", content: "This Privacy Policy is governed by:\n\n• Regulation (EU) 2016/679 (GDPR).\n• Organic Law 3/2018 (LOPDGDD).\n• Law 34/2002 (LSSI-CE)." },
];

const PrivacyPolicyPage = () => {
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
          <h1 className="text-3xl font-bold mb-2">{t("legal.privacyTitle")}</h1>
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

export default PrivacyPolicyPage;
