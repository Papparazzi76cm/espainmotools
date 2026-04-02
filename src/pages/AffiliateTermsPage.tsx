import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import PynmoLogo from "@/components/PynmoLogo";
import FooterSection from "@/components/landing/FooterSection";

const sectionsES = [
  { title: "1. Objeto del programa", content: "El Programa de Afiliados de Ace-Inmotools permite a usuarios registrados obtener comisiones por referir nuevos clientes de pago a la plataforma. Al registrarse como afiliado, el usuario acepta íntegramente estos términos y condiciones." },
  { title: "2. Requisitos de participación", content: "Puede participar cualquier persona física mayor de 18 años o persona jurídica legalmente constituida. El afiliado debe proporcionar datos verídicos en el registro. Ace-Inmotools se reserva el derecho de rechazar o dar de baja a cualquier afiliado que incumpla estas condiciones." },
  { title: "3. Enlace de afiliado", content: "Al registrarse, el afiliado recibe un enlace personal único con un identificador (AFILIADO_ID). Este enlace es intransferible. El afiliado puede compartirlo libremente en sus canales legítimos. Ace-Inmotools puede regenerar o invalidar enlaces en cualquier momento por motivos de seguridad." },
  { title: "4. Modelo de atribución", content: "Se utiliza un modelo de atribución 'last-click'. Cuando un usuario hace clic en un enlace de afiliado, se almacena una cookie con validez de 30 días. Si el usuario se registra y realiza un pago dentro de ese periodo, la comisión se atribuye al último afiliado cuyo enlace fue utilizado." },
  { title: "5. Comisiones", content: "Las comisiones se calculan como un porcentaje del importe pagado por el cliente referido. El porcentaje base es del 15%, pudiendo llegar hasta el 20% a criterio de Ace-Inmotools. Las comisiones se generan automáticamente tras el pago confirmado del cliente. El tipo de comisión por defecto es 'first_only', aplicándose únicamente al primer pago del cliente referido, salvo configuración distinta." },
  { title: "6. Ciclo de vida de las comisiones", content: "Las comisiones pasan por tres estados: Pendiente (generada tras el pago del referido), Aprobada (validada por el equipo de Ace-Inmotools) y Pagada (liquidada al afiliado). Ace-Inmotools se reserva el derecho de rechazar comisiones derivadas de actividades fraudulentas." },
  { title: "7. Umbral mínimo de cobro", content: "El afiliado debe acumular un mínimo de 50€ en comisiones aprobadas para solicitar el cobro. Los pagos se realizarán mediante transferencia bancaria u otro método acordado." },
  { title: "8. Conductas prohibidas", content: "Queda expresamente prohibido: el auto-referido (registrarse usando el propio enlace de afiliado); el uso de spam, publicidad engañosa o prácticas desleales; suplantar la identidad de Ace-Inmotools; manipular cookies o sistemas de rastreo; y cualquier práctica que contravenga la legislación vigente." },
  { title: "9. Protección antifraude", content: "Ace-Inmotools implementa medidas antifraude, incluyendo la verificación de que el email del afiliado sea diferente al del usuario referido. Cualquier actividad sospechosa puede resultar en la suspensión del afiliado y la anulación de comisiones pendientes." },
  { title: "10. Propiedad intelectual", content: "El afiliado no adquiere ningún derecho sobre la marca, logotipos o contenidos de Ace-Inmotools. El uso de materiales promocionales debe respetar las directrices de marca proporcionadas." },
  { title: "11. Protección de datos", content: "Los datos personales del afiliado se tratan conforme al Reglamento General de Protección de Datos (RGPD). El afiliado puede ejercer sus derechos de acceso, rectificación, supresión y portabilidad contactando con el equipo de Ace-Inmotools." },
  { title: "12. Duración y terminación", content: "La participación en el programa es por tiempo indefinido. Tanto el afiliado como Ace-Inmotools pueden dar por terminada la relación en cualquier momento. En caso de baja, las comisiones pendientes aprobadas serán liquidadas según los plazos habituales. Las comisiones pendientes de aprobación serán revisadas caso por caso." },
  { title: "13. Modificaciones", content: "Ace-Inmotools se reserva el derecho de modificar estos términos en cualquier momento. Los cambios se comunicarán a los afiliados por email o mediante aviso en la plataforma. El uso continuado del programa tras la notificación implica la aceptación de los nuevos términos." },
  { title: "14. Legislación aplicable", content: "Estos términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de la ciudad de Madrid, con renuncia expresa a cualquier otro fuero." },
];

const sectionsEN = [
  { title: "1. Program purpose", content: "The Ace-Inmotools Affiliate Program allows registered users to earn commissions by referring new paying clients to the platform. By registering as an affiliate, the user fully accepts these terms and conditions." },
  { title: "2. Participation requirements", content: "Any individual over 18 years old or legally constituted legal entity may participate. The affiliate must provide truthful data during registration. Ace-Inmotools reserves the right to reject or deactivate any affiliate who violates these conditions." },
  { title: "3. Affiliate link", content: "Upon registration, the affiliate receives a unique personal link with an identifier (AFFILIATE_ID). This link is non-transferable. The affiliate may share it freely through legitimate channels. Ace-Inmotools may regenerate or invalidate links at any time for security reasons." },
  { title: "4. Attribution model", content: "A 'last-click' attribution model is used. When a user clicks on an affiliate link, a cookie is stored with a 30-day validity. If the user registers and makes a payment within that period, the commission is attributed to the last affiliate whose link was used." },
  { title: "5. Commissions", content: "Commissions are calculated as a percentage of the amount paid by the referred client. The base percentage is 15%, which may reach up to 20% at Ace-Inmotools' discretion. Commissions are automatically generated after confirmed client payment. The default commission type is 'first_only', applying only to the first payment of the referred client, unless configured otherwise." },
  { title: "6. Commission lifecycle", content: "Commissions go through three states: Pending (generated after the referral's payment), Approved (validated by the Ace-Inmotools team) and Paid (settled to the affiliate). Ace-Inmotools reserves the right to reject commissions derived from fraudulent activities." },
  { title: "7. Minimum payout threshold", content: "The affiliate must accumulate a minimum of €50 in approved commissions to request payment. Payments will be made via bank transfer or another agreed method." },
  { title: "8. Prohibited conduct", content: "The following is expressly prohibited: self-referral (registering using your own affiliate link); use of spam, misleading advertising or unfair practices; impersonating Ace-Inmotools; manipulating cookies or tracking systems; and any practice that violates current legislation." },
  { title: "9. Anti-fraud protection", content: "Ace-Inmotools implements anti-fraud measures, including verifying that the affiliate's email is different from the referred user's. Any suspicious activity may result in the affiliate's suspension and cancellation of pending commissions." },
  { title: "10. Intellectual property", content: "The affiliate does not acquire any rights over Ace-Inmotools' brand, logos or content. Use of promotional materials must respect the provided brand guidelines." },
  { title: "11. Data protection", content: "The affiliate's personal data is processed in accordance with the General Data Protection Regulation (GDPR). The affiliate may exercise their rights of access, rectification, deletion and portability by contacting the Ace-Inmotools team." },
  { title: "12. Duration and termination", content: "Participation in the program is for an indefinite period. Both the affiliate and Ace-Inmotools may terminate the relationship at any time. In case of termination, approved pending commissions will be settled according to the usual timelines. Pending approval commissions will be reviewed on a case-by-case basis." },
  { title: "13. Modifications", content: "Ace-Inmotools reserves the right to modify these terms at any time. Changes will be communicated to affiliates by email or through a notice on the platform. Continued use of the program after notification implies acceptance of the new terms." },
  { title: "14. Applicable law", content: "These terms are governed by Spanish law. For any dispute, the parties submit to the courts and tribunals of the city of Madrid, with express waiver of any other jurisdiction." },
];

export default function AffiliateTermsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isEn = i18n.language?.startsWith("en");
  const sections = isEn ? sectionsEN : sectionsES;

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-16">
          <PynmoLogo size="sm" />
          <Button variant="ghost" size="sm" onClick={() => navigate("/afiliados")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> {t("affiliateTerms.back")}
          </Button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {t("affiliateTerms.title")}
          </h1>
          <p className="text-muted-foreground mb-10">
            {t("legal.lastUpdated")} {new Date().toLocaleDateString(isEn ? "en-US" : "es-ES", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="space-y-8">
            {sections.map((s, i) => (
              <motion.section key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <h2 className="text-lg font-semibold text-foreground mb-2">{s.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{s.content}</p>
              </motion.section>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border/40 text-center">
            <p className="text-sm text-muted-foreground mb-4">{t("affiliateTerms.bottomNote")}</p>
            <Button onClick={() => navigate("/afiliados")} style={{ background: "#E87722", color: "#fff" }}>
              {t("affiliateTerms.backToProgram")}
            </Button>
          </div>
        </motion.div>
      </main>

      <FooterSection />
    </div>
  );
}
