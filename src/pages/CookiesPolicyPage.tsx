import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "1. ¿Qué son las cookies?",
    content: `Las cookies son pequeños archivos de texto que los sitios web almacenan en su dispositivo (ordenador, tablet o móvil) cuando los visita. Sirven para que el sitio web recuerde información sobre su visita, como su idioma preferido y otras opciones, con el fin de facilitar su próxima visita y hacer que el sitio le resulte más útil.`,
  },
  {
    title: "2. ¿Qué tipos de cookies utilizamos?",
    content: `En esta plataforma podemos utilizar los siguientes tipos de cookies:\n\n• Cookies técnicas o necesarias: Son imprescindibles para el funcionamiento del sitio web. Permiten la navegación y el uso de las diferentes opciones o servicios que ofrece la plataforma, como controlar el tráfico, identificar sesiones de usuario o acceder a partes de acceso restringido.\n\n• Cookies de preferencias o personalización: Permiten recordar información para que el usuario acceda al servicio con determinadas características que pueden diferenciar su experiencia de la de otros usuarios (idioma, configuración regional, etc.).\n\n• Cookies analíticas o de medición: Permiten el seguimiento y análisis estadístico del comportamiento del conjunto de los usuarios de la plataforma. La información recogida es anónima y se utiliza para mejorar la experiencia de navegación y optimizar el servicio.\n\n• Cookies de marketing o publicidad: En caso de utilizarse, estas cookies almacenan información del comportamiento de los usuarios para ofrecer publicidad personalizada.`,
  },
  {
    title: "3. Cookies de terceros",
    content: `Algunos servicios de terceros pueden instalar cookies en su dispositivo cuando visita nuestra plataforma, con el fin de ofrecer sus servicios. Estos terceros tienen sus propias políticas de privacidad y cookies sobre las que no tenemos control.\n\nEntre los posibles servicios de terceros se incluyen:\n\n• Servicios de análisis web (Google Analytics o similares).\n• Proveedores de autenticación.\n• Servicios de alojamiento y CDN.`,
  },
  {
    title: "4. ¿Cómo gestionar las cookies?",
    content: `Usted puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador instalado en su dispositivo.\n\nA continuación le indicamos los enlaces donde encontrará información sobre cómo gestionar las cookies en los principales navegadores:\n\n• Google Chrome: chrome://settings/cookies\n• Mozilla Firefox: about:preferences#privacy\n• Safari: Preferencias > Privacidad\n• Microsoft Edge: edge://settings/content/cookies\n\nSi bloquea el uso de cookies en su navegador, es posible que algunos servicios o funcionalidades de la plataforma no estén disponibles.`,
  },
  {
    title: "5. Base jurídica para el uso de cookies",
    content: `La base jurídica para el uso de cookies técnicas es el interés legítimo del responsable (art. 6.1.f RGPD) y la prestación del servicio solicitado. Para el resto de cookies (analíticas, de personalización o de marketing), la base jurídica es el consentimiento del usuario (art. 6.1.a RGPD), que podrá retirar en cualquier momento.`,
  },
  {
    title: "6. Período de conservación",
    content: `Las cookies técnicas o de sesión se eliminan una vez que el usuario cierra el navegador. Las cookies persistentes tienen una duración variable que puede ir desde unos minutos hasta varios años. En todo caso, el usuario puede eliminarlas manualmente en cualquier momento a través de la configuración de su navegador.`,
  },
  {
    title: "7. Actualizaciones de esta política",
    content: `Esta Política de Cookies puede ser actualizada periódicamente para reflejar cambios en las cookies utilizadas o por motivos operativos, legales o regulatorios. Le recomendamos revisar esta página de forma periódica para estar informado sobre cómo y para qué utilizamos las cookies.`,
  },
  {
    title: "8. Legislación aplicable",
    content: `Esta Política de Cookies se rige por la normativa española y europea vigente, en particular:\n\n• Reglamento (UE) 2016/679 (RGPD).\n• Ley Orgánica 3/2018 (LOPDGDD).\n• Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE).\n• Directiva 2002/58/CE sobre la privacidad y las comunicaciones electrónicas (Directiva ePrivacy).`,
  },
];

const CookiesPolicyPage = () => (
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
        <h1 className="text-3xl font-bold mb-2">Política de Cookies</h1>
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

export default CookiesPolicyPage;
