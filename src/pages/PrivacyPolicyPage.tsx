import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "1. Responsable del tratamiento",
    content: `El responsable del tratamiento de los datos personales recogidos a través de esta plataforma es Ace-inmotools. Puede contactar con nosotros a través del correo electrónico disponible en la sección de contacto de nuestra web.`,
  },
  {
    title: "2. Datos que recopilamos",
    content: `Recopilamos los datos personales que usted nos proporciona voluntariamente al registrarse o utilizar nuestros servicios, incluyendo: nombre completo, dirección de correo electrónico, nombre de empresa (opcional), y datos de uso de la plataforma. También podemos recopilar datos técnicos como la dirección IP, tipo de navegador y dispositivo utilizado.`,
  },
  {
    title: "3. Finalidad del tratamiento",
    content: `Los datos personales se tratan con las siguientes finalidades:\n\n• Gestión de la cuenta de usuario y prestación de los servicios contratados.\n• Comunicaciones relacionadas con el servicio (notificaciones, actualizaciones).\n• Mejora de la experiencia de usuario y optimización de la plataforma.\n• Gestión del programa de afiliados, en su caso.\n• Cumplimiento de obligaciones legales aplicables.`,
  },
  {
    title: "4. Base jurídica del tratamiento",
    content: `El tratamiento de sus datos se fundamenta en:\n\n• La ejecución del contrato de servicios (art. 6.1.b RGPD).\n• Su consentimiento expreso, cuando corresponda (art. 6.1.a RGPD).\n• El interés legítimo del responsable para mejorar sus servicios (art. 6.1.f RGPD).\n• El cumplimiento de obligaciones legales (art. 6.1.c RGPD).`,
  },
  {
    title: "5. Plazo de conservación",
    content: `Los datos personales se conservarán mientras se mantenga la relación contractual y, una vez finalizada, durante los plazos legalmente establecidos para atender posibles responsabilidades. Los datos tratados sobre la base del consentimiento se conservarán hasta que usted lo revoque.`,
  },
  {
    title: "6. Destinatarios de los datos",
    content: `No se cederán datos personales a terceros salvo obligación legal o cuando sea necesario para la prestación del servicio (por ejemplo, proveedores de alojamiento o servicios tecnológicos). En tales casos, exigimos garantías contractuales adecuadas conforme al RGPD.`,
  },
  {
    title: "7. Transferencias internacionales",
    content: `En caso de que sus datos sean tratados por proveedores ubicados fuera del Espacio Económico Europeo, nos aseguraremos de que existan garantías adecuadas conforme al artículo 46 del RGPD (cláusulas contractuales tipo, decisiones de adecuación u otras garantías apropiadas).`,
  },
  {
    title: "8. Derechos del interesado",
    content: `De conformidad con el RGPD y la LOPDGDD, usted tiene derecho a:\n\n• Acceder a sus datos personales.\n• Rectificar datos inexactos o incompletos.\n• Solicitar la supresión de sus datos (derecho al olvido).\n• Oponerse al tratamiento de sus datos.\n• Solicitar la limitación del tratamiento.\n• Solicitar la portabilidad de sus datos.\n• Retirar el consentimiento en cualquier momento.\n\nPara ejercer estos derechos, puede contactarnos a través del correo electrónico indicado en la sección de contacto. Asimismo, tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).`,
  },
  {
    title: "9. Medidas de seguridad",
    content: `Hemos adoptado las medidas técnicas y organizativas necesarias para garantizar la seguridad de sus datos personales y evitar su alteración, pérdida, tratamiento o acceso no autorizado, conforme al estado de la tecnología, la naturaleza de los datos y los riesgos a los que están expuestos.`,
  },
  {
    title: "10. Uso de cookies",
    content: `Esta plataforma puede utilizar cookies propias y de terceros con finalidades técnicas, de personalización y analíticas. Para más información sobre el uso de cookies, consulte nuestra política de cookies (si aplica). En todo caso, puede configurar su navegador para rechazar la instalación de cookies.`,
  },
  {
    title: "11. Modificaciones de la política",
    content: `Nos reservamos el derecho a modificar esta Política de Privacidad en cualquier momento. Cualquier cambio será publicado en esta misma página con la fecha de última actualización. Le recomendamos revisarla periódicamente.`,
  },
  {
    title: "12. Legislación aplicable",
    content: `Esta Política de Privacidad se rige por la normativa española y europea vigente en materia de protección de datos personales, en particular:\n\n• Reglamento (UE) 2016/679 (RGPD).\n• Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).\n• Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE).`,
  },
];

const PrivacyPolicyPage = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild>
          <a href="/auth">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </a>
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-2">Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Última actualización: {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
            >
              <h2 className="text-lg font-semibold mb-2">{s.title}</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{s.content}</p>
            </motion.section>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
);

export default PrivacyPolicyPage;
