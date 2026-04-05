import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const sectionKeys = [
  "dataController", "objectWebsite", "useConditions", "intellectualProperty",
  "exclusionGuarantees", "thirdPartyLinks", "dataProtection", "cookies",
  "modifications", "jurisdiction"
];

const sectionsES = [
  { title: "1. Datos identificativos del titular", content: "En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa al usuario de los datos identificativos del titular de esta plataforma:\n\n• Denominación: Ace-inmotools\n• Actividad: Plataforma de herramientas digitales basadas en inteligencia artificial para profesionales del sector inmobiliario.\n• Contacto: A través del correo electrónico disponible en la sección de contacto de nuestra web." },
  { title: "2. Objeto del sitio web", content: "El presente sitio web tiene como finalidad ofrecer información sobre los servicios de Ace-inmotools y facilitar el acceso a su plataforma de herramientas de inteligencia artificial para agentes y agencias inmobiliarias en España." },
  { title: "3. Condiciones de uso", content: "El acceso al sitio web es gratuito salvo en lo relativo al coste de la conexión a través de la red de telecomunicaciones suministrada por el proveedor de acceso contratado por el usuario.\n\nEl usuario se compromete a hacer un uso adecuado de los contenidos y servicios ofrecidos, absteniéndose de emplearlos para:\n\n• Realizar actividades ilícitas o contrarias a la buena fe y al ordenamiento jurídico.\n• Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico, de apología del terrorismo o que atente contra los derechos humanos.\n• Provocar daños en los sistemas físicos y lógicos del sitio web, de sus proveedores o de terceros.\n• Introducir o difundir virus informáticos o cualesquiera otros sistemas que sean susceptibles de causar daños." },
  { title: "4. Propiedad intelectual e industrial", content: "Todos los contenidos del sitio web, incluyendo a título enunciativo pero no limitativo: textos, fotografías, gráficos, imágenes, iconos, tecnología, software, enlaces y demás contenidos audiovisuales o sonoros, así como su diseño gráfico y códigos fuente, son propiedad intelectual de Ace-inmotools o de terceros que han autorizado su uso, sin que puedan entenderse cedidos al usuario ninguno de los derechos de explotación reconocidos por la normativa vigente en materia de propiedad intelectual.\n\nQueda prohibida la reproducción, distribución, comunicación pública, transformación o cualquier otra actividad que se realice con los contenidos del sitio web sin la autorización expresa de Ace-inmotools." },
  { title: "5. Exclusión de garantías y responsabilidad", content: "Ace-inmotools no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran derivarse de:\n\n• La falta de disponibilidad o accesibilidad del sitio web.\n• La interrupción en el funcionamiento del sitio web o fallos informáticos.\n• La presencia de virus o programas maliciosos en los contenidos.\n• El uso ilícito, negligente, fraudulento o contrario a estos términos por parte de los usuarios." },
  { title: "6. Enlaces a terceros", content: "El sitio web puede incluir enlaces a sitios de terceros. Ace-inmotools no asume ninguna responsabilidad por el contenido, informaciones o servicios que pudieran aparecer en dichos sitios." },
  { title: "7. Protección de datos personales", content: "De conformidad con lo establecido en el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), Ace-inmotools se compromete a proteger la privacidad de los usuarios. Para más información sobre el tratamiento de datos personales, consulte nuestra Política de Privacidad." },
  { title: "8. Cookies", content: "Este sitio web utiliza cookies propias y de terceros. Para obtener información detallada sobre el uso de cookies, consulte nuestra Política de Cookies." },
  { title: "9. Modificaciones", content: "Ace-inmotools se reserva el derecho de realizar las modificaciones que considere oportunas en su sitio web." },
  { title: "10. Legislación aplicable y jurisdicción", content: "La relación entre Ace-inmotools y el usuario se regirá por la normativa española vigente.\n\nNormativa de referencia:\n• Ley 34/2002 (LSSI-CE)\n• Reglamento (UE) 2016/679 (RGPD)\n• Ley Orgánica 3/2018 (LOPDGDD)" },
];

const sectionsEN = [
  { title: "1. Owner identification", content: "In compliance with Article 10 of Law 34/2002, we inform users of the identification data of the owner of this platform:\n\n• Name: Ace-inmotools\n• Activity: Digital tools platform based on artificial intelligence for real estate professionals.\n• Contact: Through the email address available in the contact section of our website." },
  { title: "2. Website purpose", content: "This website aims to provide information about Ace-inmotools services and facilitate access to its AI tools platform for real estate agents and agencies in Spain." },
  { title: "3. Terms of use", content: "Access to the website is free except for the cost of connection through the telecommunications network provided by the user's access provider.\n\nThe user agrees to make appropriate use of the content and services offered, refraining from using them to:\n\n• Carry out illicit activities or activities contrary to good faith.\n• Disseminate racist, xenophobic, pornographic content or content that violates human rights.\n• Cause damage to the physical and logical systems of the website.\n• Introduce or spread computer viruses." },
  { title: "4. Intellectual and industrial property", content: "All content on the website, including but not limited to: texts, photographs, graphics, images, icons, technology, software, links and other audiovisual or sound content, as well as their graphic design and source codes, are the intellectual property of Ace-inmotools or third parties who have authorized their use.\n\nReproduction, distribution, public communication, transformation or any other activity carried out with the content of the website without the express authorization of Ace-inmotools is prohibited." },
  { title: "5. Exclusion of guarantees and liability", content: "Ace-inmotools is not responsible, in any case, for damages of any nature that may arise from:\n\n• Lack of availability or accessibility of the website.\n• Interruption in the operation of the website or computer failures.\n• Presence of viruses or malicious programs in the content.\n• Illicit, negligent, fraudulent use by users." },
  { title: "6. Third-party links", content: "The website may include links to third-party sites. Ace-inmotools assumes no responsibility for the content, information or services that may appear on said sites." },
  { title: "7. Personal data protection", content: "In accordance with Regulation (EU) 2016/679 (GDPR) and Organic Law 3/2018 (LOPDGDD), Ace-inmotools is committed to protecting user privacy. For more information on personal data processing, please consult our Privacy Policy." },
  { title: "8. Cookies", content: "This website uses its own and third-party cookies. For detailed information about the use of cookies, please consult our Cookie Policy." },
  { title: "9. Modifications", content: "Ace-inmotools reserves the right to make any modifications it deems appropriate to its website." },
  { title: "10. Applicable law and jurisdiction", content: "The relationship between Ace-inmotools and the user will be governed by current Spanish regulations.\n\nReference legislation:\n• Law 34/2002 (LSSI-CE)\n• Regulation (EU) 2016/679 (GDPR)\n• Organic Law 3/2018 (LOPDGDD)" },
];

const LegalNoticePage = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const sections = isEn ? sectionsEN : sectionsES;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead titleKey="seo.legalNotice.title" descriptionKey="seo.legalNotice.description" canonical="https://es-ace-inmotools.lovable.app/aviso-legal" />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild><a href="/auth"><ArrowLeft className="h-4 w-4 mr-1" />{t("legal.back")}</a></Button>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold mb-2">{t("legal.legalNoticeTitle")}</h1>
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
