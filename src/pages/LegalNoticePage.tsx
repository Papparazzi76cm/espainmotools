import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "1. Datos identificativos del titular",
    content: `En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa al usuario de los datos identificativos del titular de esta plataforma:\n\n• Denominación: Ace-inmotools\n• Actividad: Plataforma de herramientas digitales basadas en inteligencia artificial para profesionales del sector inmobiliario.\n• Contacto: A través del correo electrónico disponible en la sección de contacto de nuestra web.`,
  },
  {
    title: "2. Objeto del sitio web",
    content: `El presente sitio web tiene como finalidad ofrecer información sobre los servicios de Ace-inmotools y facilitar el acceso a su plataforma de herramientas de inteligencia artificial para agentes y agencias inmobiliarias en España.`,
  },
  {
    title: "3. Condiciones de uso",
    content: `El acceso al sitio web es gratuito salvo en lo relativo al coste de la conexión a través de la red de telecomunicaciones suministrada por el proveedor de acceso contratado por el usuario.\n\nEl usuario se compromete a hacer un uso adecuado de los contenidos y servicios ofrecidos, absteniéndose de emplearlos para:\n\n• Realizar actividades ilícitas o contrarias a la buena fe y al ordenamiento jurídico.\n• Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico, de apología del terrorismo o que atente contra los derechos humanos.\n• Provocar daños en los sistemas físicos y lógicos del sitio web, de sus proveedores o de terceros.\n• Introducir o difundir virus informáticos o cualesquiera otros sistemas que sean susceptibles de causar daños.`,
  },
  {
    title: "4. Propiedad intelectual e industrial",
    content: `Todos los contenidos del sitio web, incluyendo a título enunciativo pero no limitativo: textos, fotografías, gráficos, imágenes, iconos, tecnología, software, enlaces y demás contenidos audiovisuales o sonoros, así como su diseño gráfico y códigos fuente, son propiedad intelectual de Ace-inmotools o de terceros que han autorizado su uso, sin que puedan entenderse cedidos al usuario ninguno de los derechos de explotación reconocidos por la normativa vigente en materia de propiedad intelectual.\n\nLas marcas, nombres comerciales o signos distintivos son titularidad de Ace-inmotools o de terceros, sin que el acceso al sitio web atribuya al usuario derecho alguno sobre los mismos.\n\nQueda prohibida la reproducción, distribución, comunicación pública, transformación o cualquier otra actividad que se realice con los contenidos del sitio web sin la autorización expresa de Ace-inmotools.`,
  },
  {
    title: "5. Exclusión de garantías y responsabilidad",
    content: `Ace-inmotools no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran derivarse de:\n\n• La falta de disponibilidad o accesibilidad del sitio web.\n• La interrupción en el funcionamiento del sitio web o fallos informáticos, averías telefónicas, desconexiones, retrasos o bloqueos causados por deficiencias o sobrecargas en las líneas telefónicas, en el sistema de Internet o en otros sistemas electrónicos.\n• La falta de idoneidad del sitio web para las necesidades específicas del usuario.\n• La presencia de virus o programas maliciosos en los contenidos.\n• La recepción, obtención, almacenamiento, difusión o transmisión por parte de los usuarios de los contenidos del sitio web.\n• El uso ilícito, negligente, fraudulento o contrario a estos términos por parte de los usuarios.`,
  },
  {
    title: "6. Enlaces a terceros",
    content: `El sitio web puede incluir enlaces a sitios de terceros. Ace-inmotools no asume ninguna responsabilidad por el contenido, informaciones o servicios que pudieran aparecer en dichos sitios, que tendrán exclusivamente carácter informativo y que en ningún caso implican relación alguna entre Ace-inmotools y las personas o entidades titulares de tales contenidos o titulares de los sitios donde se encuentren.`,
  },
  {
    title: "7. Protección de datos personales",
    content: `De conformidad con lo establecido en el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), Ace-inmotools se compromete a proteger la privacidad de los usuarios. Para más información sobre el tratamiento de datos personales, consulte nuestra Política de Privacidad accesible en /politica-privacidad.`,
  },
  {
    title: "8. Cookies",
    content: `Este sitio web utiliza cookies propias y de terceros. Para obtener información detallada sobre el uso de cookies, consulte nuestra Política de Cookies accesible en /politica-cookies.`,
  },
  {
    title: "9. Modificaciones",
    content: `Ace-inmotools se reserva el derecho de realizar las modificaciones que considere oportunas en su sitio web, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través del mismo como la forma en la que estos aparezcan presentados o localizados. Estas modificaciones no darán lugar a reclamación alguna.`,
  },
  {
    title: "10. Legislación aplicable y jurisdicción",
    content: `La relación entre Ace-inmotools y el usuario se regirá por la normativa española vigente. Para la resolución de cualquier controversia, las partes se someterán a los Juzgados y Tribunales que correspondan conforme a derecho.\n\nNormativa de referencia:\n\n• Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).\n• Reglamento (UE) 2016/679 (RGPD).\n• Ley Orgánica 3/2018 (LOPDGDD).\n• Real Decreto Legislativo 1/2007, por el que se aprueba el texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios.`,
  },
];

const LegalNoticePage = () => (
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
        <h1 className="text-3xl font-bold mb-2">Aviso Legal</h1>
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

export default LegalNoticePage;
