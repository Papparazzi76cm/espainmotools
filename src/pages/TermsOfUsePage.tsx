import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "1. Objeto",
    content: `Los presentes Términos y Condiciones regulan el acceso y uso de la plataforma Ace-inmotools (en adelante, "la Plataforma"), un servicio de herramientas digitales basadas en inteligencia artificial destinadas a profesionales del sector inmobiliario en España. El uso de la Plataforma implica la aceptación plena e incondicional de estos términos.`,
  },
  {
    title: "2. Titularidad de la Plataforma",
    content: `La Plataforma es titularidad de Ace-inmotools. Para cualquier consulta puede contactar con nosotros a través del correo electrónico disponible en la sección de contacto de nuestra web.`,
  },
  {
    title: "3. Acceso y registro",
    content: `Para acceder a las funcionalidades de la Plataforma es necesario completar un proceso de registro proporcionando datos veraces y actualizados. El usuario es responsable de la confidencialidad de sus credenciales de acceso y de todas las actividades realizadas con su cuenta.\n\nAce-inmotools se reserva el derecho de suspender o cancelar cuentas que incumplan estos términos o que presenten actividad sospechosa.`,
  },
  {
    title: "4. Descripción de los servicios",
    content: `La Plataforma ofrece un conjunto de herramientas de inteligencia artificial orientadas al sector inmobiliario, que incluyen, entre otras:\n\n• Generación de descripciones de inmuebles.\n• Cálculo de costes de compraventa.\n• Análisis de rentabilidad.\n• Consultoría legal automatizada.\n• Análisis del entorno.\n• Generación de guiones y contenidos.\n• Estrategias de captación.\n• Generación de contratos.\n• Simulación de home staging.\n• Informes de mercado.\n• Simulaciones de roleplay comercial.\n\nLas herramientas disponibles pueden variar según el plan contratado y las actualizaciones de la Plataforma.`,
  },
  {
    title: "5. Planes y período de prueba",
    content: `La Plataforma puede ofrecer un período de prueba gratuito con acceso limitado a las herramientas. Finalizado dicho período, el usuario deberá suscribirse a un plan de pago para continuar utilizando los servicios.\n\nLos precios, funcionalidades y condiciones de cada plan se detallan en la sección de precios de la Plataforma y pueden ser modificados con previo aviso.`,
  },
  {
    title: "6. Uso aceptable",
    content: `El usuario se compromete a utilizar la Plataforma de forma lícita y conforme a estos términos. Queda expresamente prohibido:\n\n• Utilizar la Plataforma para fines ilegales o no autorizados.\n• Intentar acceder a áreas restringidas o sistemas de la Plataforma sin autorización.\n• Reproducir, distribuir o explotar comercialmente los contenidos generados por la Plataforma fuera del ámbito de su actividad profesional inmobiliaria.\n• Utilizar la Plataforma de forma que pueda dañar, sobrecargar o deteriorar su funcionamiento.\n• Compartir credenciales de acceso con terceros no autorizados.\n• Utilizar sistemas automatizados (bots, scrapers) para acceder a la Plataforma.`,
  },
  {
    title: "7. Propiedad intelectual",
    content: `Todos los derechos de propiedad intelectual e industrial de la Plataforma (diseño, código fuente, logotipos, marcas, textos y gráficos) son titularidad de Ace-inmotools o de sus licenciantes.\n\nLos contenidos generados por las herramientas de IA a partir de los datos proporcionados por el usuario podrán ser utilizados libremente por este en el ejercicio de su actividad profesional, sin que ello implique la cesión de derechos sobre la tecnología subyacente.`,
  },
  {
    title: "8. Limitación de responsabilidad",
    content: `Los contenidos generados por las herramientas de inteligencia artificial tienen carácter orientativo y no constituyen asesoramiento profesional vinculante. Ace-inmotools no garantiza la exactitud, integridad o idoneidad de los resultados generados.\n\nEl usuario es el único responsable del uso que haga de los contenidos generados y de verificar su adecuación antes de utilizarlos en su actividad profesional.\n\nAce-inmotools no será responsable de daños directos o indirectos derivados del uso o imposibilidad de uso de la Plataforma, salvo en los casos previstos por la legislación aplicable.`,
  },
  {
    title: "9. Protección de datos",
    content: `El tratamiento de datos personales se rige por nuestra Política de Privacidad, accesible en /politica-privacidad. Al utilizar la Plataforma, el usuario acepta el tratamiento de sus datos conforme a dicha política y a la normativa vigente en materia de protección de datos (RGPD y LOPDGDD).`,
  },
  {
    title: "10. Disponibilidad del servicio",
    content: `Ace-inmotools se esforzará por mantener la Plataforma disponible de forma continua, pero no garantiza la ausencia de interrupciones, errores o fallos técnicos. Se reserva el derecho de realizar mantenimientos programados o actualizaciones que puedan afectar temporalmente a la disponibilidad del servicio.`,
  },
  {
    title: "11. Modificación de los términos",
    content: `Ace-inmotools se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones serán publicadas en esta misma página con la fecha de última actualización. El uso continuado de la Plataforma tras la publicación de los cambios implica la aceptación de los nuevos términos.`,
  },
  {
    title: "12. Resolución y suspensión",
    content: `Ace-inmotools podrá suspender o resolver el acceso del usuario a la Plataforma en caso de incumplimiento de estos términos, uso fraudulento o cualquier otra causa justificada, sin perjuicio de las acciones legales que pudieran corresponder.\n\nEl usuario podrá cancelar su cuenta en cualquier momento a través de las opciones disponibles en la Plataforma o contactando con el servicio de atención al cliente.`,
  },
  {
    title: "13. Legislación aplicable y jurisdicción",
    content: `Estos Términos y Condiciones se rigen por la legislación española. Para cualquier controversia derivada de la interpretación o cumplimiento de estos términos, las partes se someten a los Juzgados y Tribunales competentes conforme a la legislación procesal vigente.\n\nNormativa de referencia:\n\n• Reglamento (UE) 2016/679 (RGPD).\n• Ley Orgánica 3/2018 (LOPDGDD).\n• Ley 34/2002 (LSSI-CE).\n• Real Decreto Legislativo 1/2007, por el que se aprueba el texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios.`,
  },
];

const TermsOfUsePage = () => (
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
        <h1 className="text-3xl font-bold mb-2">Términos y Condiciones de Uso</h1>
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

export default TermsOfUsePage;
