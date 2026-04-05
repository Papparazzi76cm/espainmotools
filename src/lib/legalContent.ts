import { CountryConfig } from "@/hooks/useCountryConfig";

interface LegalSection {
  title: string;
  content: string;
}

function getLegislationList(country: CountryConfig | null): string {
  if (!country?.legislation) return "";
  const leg = country.legislation as Record<string, string>;
  return Object.entries(leg)
    .map(([, v]) => `• ${v}`)
    .join("\n");
}

function isSpain(country: CountryConfig | null): boolean {
  return country?.country_code === "es";
}

// ─── AVISO LEGAL ───

export function getLegalNoticeSections(isEn: boolean, country: CountryConfig | null): LegalSection[] {
  const name = country?.country_name || "España";
  const laws = getLegislationList(country);
  const spain = isSpain(country);

  if (isEn) {
    return [
      { title: "1. Owner identification", content: `In compliance with applicable regulations in ${name}, we inform users of the identification data of the owner of this platform:\n\n• Name: Ace-inmotools\n• Activity: Digital tools platform based on artificial intelligence for real estate professionals.\n• Contact: Through the email address available in the contact section of our website.` },
      { title: "2. Website purpose", content: `This website aims to provide information about Ace-inmotools services and facilitate access to its AI tools platform for real estate agents and agencies in ${name}.` },
      { title: "3. Terms of use", content: "Access to the website is free except for the cost of connection through the telecommunications network provided by the user's access provider.\n\nThe user agrees to make appropriate use of the content and services offered, refraining from using them to:\n\n• Carry out illicit activities or activities contrary to good faith.\n• Disseminate racist, xenophobic, pornographic content or content that violates human rights.\n• Cause damage to the physical and logical systems of the website.\n• Introduce or spread computer viruses." },
      { title: "4. Intellectual and industrial property", content: "All content on the website, including but not limited to: texts, photographs, graphics, images, icons, technology, software, links and other audiovisual or sound content, as well as their graphic design and source codes, are the intellectual property of Ace-inmotools or third parties who have authorized their use.\n\nReproduction, distribution, public communication, transformation or any other activity carried out with the content of the website without the express authorization of Ace-inmotools is prohibited." },
      { title: "5. Exclusion of guarantees and liability", content: "Ace-inmotools is not responsible, in any case, for damages of any nature that may arise from:\n\n• Lack of availability or accessibility of the website.\n• Interruption in the operation of the website or computer failures.\n• Presence of viruses or malicious programs in the content.\n• Illicit, negligent, fraudulent use by users." },
      { title: "6. Third-party links", content: "The website may include links to third-party sites. Ace-inmotools assumes no responsibility for the content, information or services that may appear on said sites." },
      { title: "7. Personal data protection", content: `Ace-inmotools is committed to protecting user privacy in compliance with applicable data protection laws in ${name}. For more information on personal data processing, please consult our Privacy Policy.` },
      { title: "8. Cookies", content: "This website uses its own and third-party cookies. For detailed information about the use of cookies, please consult our Cookie Policy." },
      { title: "9. Modifications", content: "Ace-inmotools reserves the right to make any modifications it deems appropriate to its website." },
      { title: "10. Applicable law and jurisdiction", content: `The relationship between Ace-inmotools and the user will be governed by applicable regulations in ${name}.\n\nReference legislation:\n${laws || "• Local applicable legislation"}` },
    ];
  }

  return [
    { title: "1. Datos identificativos del titular", content: `En cumplimiento de la normativa vigente en ${name}, se informa al usuario de los datos identificativos del titular de esta plataforma:\n\n• Denominación: Ace-inmotools\n• Actividad: Plataforma de herramientas digitales basadas en inteligencia artificial para profesionales del sector inmobiliario.\n• Contacto: A través del correo electrónico disponible en la sección de contacto de nuestra web.` },
    { title: "2. Objeto del sitio web", content: `El presente sitio web tiene como finalidad ofrecer información sobre los servicios de Ace-inmotools y facilitar el acceso a su plataforma de herramientas de inteligencia artificial para agentes y agencias inmobiliarias en ${name}.` },
    { title: "3. Condiciones de uso", content: "El acceso al sitio web es gratuito salvo en lo relativo al coste de la conexión a través de la red de telecomunicaciones suministrada por el proveedor de acceso contratado por el usuario.\n\nEl usuario se compromete a hacer un uso adecuado de los contenidos y servicios ofrecidos, absteniéndose de emplearlos para:\n\n• Realizar actividades ilícitas o contrarias a la buena fe y al ordenamiento jurídico.\n• Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico, de apología del terrorismo o que atente contra los derechos humanos.\n• Provocar daños en los sistemas físicos y lógicos del sitio web, de sus proveedores o de terceros.\n• Introducir o difundir virus informáticos o cualesquiera otros sistemas que sean susceptibles de causar daños." },
    { title: "4. Propiedad intelectual e industrial", content: "Todos los contenidos del sitio web, incluyendo a título enunciativo pero no limitativo: textos, fotografías, gráficos, imágenes, iconos, tecnología, software, enlaces y demás contenidos audiovisuales o sonoros, así como su diseño gráfico y códigos fuente, son propiedad intelectual de Ace-inmotools o de terceros que han autorizado su uso.\n\nQueda prohibida la reproducción, distribución, comunicación pública, transformación o cualquier otra actividad que se realice con los contenidos del sitio web sin la autorización expresa de Ace-inmotools." },
    { title: "5. Exclusión de garantías y responsabilidad", content: "Ace-inmotools no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran derivarse de:\n\n• La falta de disponibilidad o accesibilidad del sitio web.\n• La interrupción en el funcionamiento del sitio web o fallos informáticos.\n• La presencia de virus o programas maliciosos en los contenidos.\n• El uso ilícito, negligente, fraudulento o contrario a estos términos por parte de los usuarios." },
    { title: "6. Enlaces a terceros", content: "El sitio web puede incluir enlaces a sitios de terceros. Ace-inmotools no asume ninguna responsabilidad por el contenido, informaciones o servicios que pudieran aparecer en dichos sitios." },
    { title: "7. Protección de datos personales", content: `Ace-inmotools se compromete a proteger la privacidad de los usuarios de conformidad con la legislación de protección de datos vigente en ${name}. Para más información sobre el tratamiento de datos personales, consulte nuestra Política de Privacidad.` },
    { title: "8. Cookies", content: "Este sitio web utiliza cookies propias y de terceros. Para obtener información detallada sobre el uso de cookies, consulte nuestra Política de Cookies." },
    { title: "9. Modificaciones", content: "Ace-inmotools se reserva el derecho de realizar las modificaciones que considere oportunas en su sitio web." },
    { title: "10. Legislación aplicable y jurisdicción", content: `La relación entre Ace-inmotools y el usuario se regirá por la normativa vigente en ${name}.\n\nNormativa de referencia:\n${laws || "• Legislación local aplicable"}` },
  ];
}

// ─── TÉRMINOS DE USO ───

export function getTermsSections(isEn: boolean, country: CountryConfig | null): LegalSection[] {
  const name = country?.country_name || "España";
  const laws = getLegislationList(country);

  if (isEn) {
    return [
      { title: "1. Purpose", content: `These Terms and Conditions regulate access to and use of the Ace-inmotools platform, a service of AI-based digital tools for real estate professionals in ${name}.` },
      { title: "2. Platform ownership", content: "The Platform is owned by Ace-inmotools." },
      { title: "3. Access and registration", content: "To access Platform functionalities, users must complete a registration process providing truthful and up-to-date data." },
      { title: "4. Description of services", content: "The Platform offers AI tools for real estate, including: description generation, cost calculation, profitability analysis, legal consulting, area analysis, scripts, lead generation, contracts, home staging, reports and commercial roleplay." },
      { title: "5. Plans and trial period", content: "The Platform may offer a free trial period with limited access. After the trial, users must subscribe to a paid plan." },
      { title: "6. Acceptable use", content: "Users agree to use the Platform lawfully. The following is prohibited:\n\n• Using the Platform for illegal purposes.\n• Attempting to access restricted areas without authorization.\n• Sharing credentials with third parties.\n• Using automated systems (bots, scrapers)." },
      { title: "7. Intellectual property", content: "All intellectual property rights of the Platform belong to Ace-inmotools or its licensors." },
      { title: "8. Limitation of liability", content: "Content generated by AI tools is for guidance only and does not constitute binding professional advice." },
      { title: "9. Data protection", content: "Personal data processing is governed by our Privacy Policy." },
      { title: "10. Service availability", content: "Ace-inmotools will endeavor to keep the Platform continuously available." },
      { title: "11. Modification of terms", content: "Ace-inmotools reserves the right to modify these Terms and Conditions at any time." },
      { title: "12. Termination and suspension", content: "Ace-inmotools may suspend or terminate user access in case of non-compliance." },
      { title: "13. Applicable law and jurisdiction", content: `These Terms are governed by the laws of ${name}.\n\n${laws || "• Local applicable legislation"}` },
    ];
  }

  return [
    { title: "1. Objeto", content: `Los presentes Términos y Condiciones regulan el acceso y uso de la plataforma Ace-inmotools, un servicio de herramientas digitales basadas en inteligencia artificial destinadas a profesionales del sector inmobiliario en ${name}.` },
    { title: "2. Titularidad de la Plataforma", content: "La Plataforma es titularidad de Ace-inmotools." },
    { title: "3. Acceso y registro", content: "Para acceder a las funcionalidades de la Plataforma es necesario completar un proceso de registro proporcionando datos veraces y actualizados." },
    { title: "4. Descripción de los servicios", content: "La Plataforma ofrece herramientas de IA orientadas al sector inmobiliario, incluyendo: generación de descripciones, cálculo de costes, análisis de rentabilidad, consultoría legal, análisis del entorno, guiones, captación, contratos, home staging, informes y roleplay comercial." },
    { title: "5. Planes y período de prueba", content: "La Plataforma puede ofrecer un período de prueba gratuito con acceso limitado. Finalizado dicho período, el usuario deberá suscribirse a un plan de pago." },
    { title: "6. Uso aceptable", content: "El usuario se compromete a utilizar la Plataforma de forma lícita. Queda prohibido:\n\n• Utilizar la Plataforma para fines ilegales.\n• Intentar acceder a áreas restringidas sin autorización.\n• Compartir credenciales con terceros.\n• Utilizar sistemas automatizados (bots, scrapers)." },
    { title: "7. Propiedad intelectual", content: "Todos los derechos de propiedad intelectual de la Plataforma son titularidad de Ace-inmotools o de sus licenciantes." },
    { title: "8. Limitación de responsabilidad", content: "Los contenidos generados por las herramientas de IA tienen carácter orientativo y no constituyen asesoramiento profesional vinculante." },
    { title: "9. Protección de datos", content: "El tratamiento de datos personales se rige por nuestra Política de Privacidad." },
    { title: "10. Disponibilidad del servicio", content: "Ace-inmotools se esforzará por mantener la Plataforma disponible de forma continua." },
    { title: "11. Modificación de los términos", content: "Ace-inmotools se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento." },
    { title: "12. Resolución y suspensión", content: "Ace-inmotools podrá suspender o resolver el acceso del usuario en caso de incumplimiento." },
    { title: "13. Legislación aplicable y jurisdicción", content: `Estos Términos se rigen por la legislación de ${name}.\n\n${laws || "• Legislación local aplicable"}` },
  ];
}

// ─── POLÍTICA DE PRIVACIDAD ───

export function getPrivacySections(isEn: boolean, country: CountryConfig | null): LegalSection[] {
  const name = country?.country_name || "España";
  const laws = getLegislationList(country);

  if (isEn) {
    return [
      { title: "1. Data controller", content: "The data controller for personal data collected through this platform is Ace-inmotools. You can contact us through the email address available in the contact section of our website." },
      { title: "2. Data we collect", content: "We collect personal data that you voluntarily provide when registering or using our services, including: full name, email address, company name (optional), and platform usage data." },
      { title: "3. Purpose of processing", content: "Personal data is processed for the following purposes:\n\n• User account management and service provision.\n• Service-related communications.\n• User experience improvement.\n• Affiliate program management.\n• Compliance with legal obligations." },
      { title: "4. Legal basis for processing", content: `The processing of your data is based on the applicable data protection regulations in ${name}:\n\n• Performance of the service contract.\n• Your express consent.\n• Legitimate interest of the controller.\n• Compliance with legal obligations.` },
      { title: "5. Retention period", content: "Personal data will be retained while the contractual relationship is maintained and, once terminated, for the legally established periods." },
      { title: "6. Data recipients", content: "Personal data will not be transferred to third parties except by legal obligation or when necessary for service provision." },
      { title: "7. International transfers", content: "If your data is processed by providers located outside your jurisdiction, we will ensure adequate safeguards exist in accordance with applicable data protection laws." },
      { title: "8. Data subject rights", content: "You have the right to:\n\n• Access your personal data.\n• Rectify inaccurate data.\n• Request erasure of your data.\n• Object to processing.\n• Request restriction of processing.\n• Request data portability.\n• Withdraw consent at any time." },
      { title: "9. Security measures", content: "We have adopted the necessary technical and organizational measures to ensure the security of your personal data." },
      { title: "10. Use of cookies", content: "This platform may use its own and third-party cookies. For more information, please consult our cookie policy." },
      { title: "11. Policy modifications", content: "We reserve the right to modify this Privacy Policy at any time." },
      { title: "12. Applicable legislation", content: `This Privacy Policy is governed by the applicable legislation in ${name}:\n\n${laws || "• Local applicable legislation"}` },
    ];
  }

  return [
    { title: "1. Responsable del tratamiento", content: "El responsable del tratamiento de los datos personales recogidos a través de esta plataforma es Ace-inmotools. Puede contactar con nosotros a través del correo electrónico disponible en la sección de contacto de nuestra web." },
    { title: "2. Datos que recopilamos", content: "Recopilamos los datos personales que usted nos proporciona voluntariamente al registrarse o utilizar nuestros servicios, incluyendo: nombre completo, dirección de correo electrónico, nombre de empresa (opcional), y datos de uso de la plataforma." },
    { title: "3. Finalidad del tratamiento", content: "Los datos personales se tratan con las siguientes finalidades:\n\n• Gestión de la cuenta de usuario y prestación de los servicios contratados.\n• Comunicaciones relacionadas con el servicio.\n• Mejora de la experiencia de usuario.\n• Gestión del programa de afiliados.\n• Cumplimiento de obligaciones legales." },
    { title: "4. Base jurídica del tratamiento", content: `El tratamiento de sus datos se fundamenta en la normativa de protección de datos vigente en ${name}:\n\n• La ejecución del contrato de servicios.\n• Su consentimiento expreso.\n• El interés legítimo del responsable.\n• El cumplimiento de obligaciones legales.` },
    { title: "5. Plazo de conservación", content: "Los datos personales se conservarán mientras se mantenga la relación contractual y, una vez finalizada, durante los plazos legalmente establecidos." },
    { title: "6. Destinatarios de los datos", content: "No se cederán datos personales a terceros salvo obligación legal o cuando sea necesario para la prestación del servicio." },
    { title: "7. Transferencias internacionales", content: "En caso de que sus datos sean tratados por proveedores ubicados fuera de su jurisdicción, nos aseguraremos de que existan garantías adecuadas conforme a la legislación aplicable de protección de datos." },
    { title: "8. Derechos del interesado", content: "Usted tiene derecho a:\n\n• Acceder a sus datos personales.\n• Rectificar datos inexactos.\n• Solicitar la supresión de sus datos.\n• Oponerse al tratamiento.\n• Solicitar la limitación del tratamiento.\n• Solicitar la portabilidad de sus datos.\n• Retirar el consentimiento en cualquier momento." },
    { title: "9. Medidas de seguridad", content: "Hemos adoptado las medidas técnicas y organizativas necesarias para garantizar la seguridad de sus datos personales." },
    { title: "10. Uso de cookies", content: "Esta plataforma puede utilizar cookies propias y de terceros. Para más información, consulte nuestra política de cookies." },
    { title: "11. Modificaciones de la política", content: "Nos reservamos el derecho a modificar esta Política de Privacidad en cualquier momento." },
    { title: "12. Legislación aplicable", content: `Esta Política de Privacidad se rige por la legislación vigente en ${name}:\n\n${laws || "• Legislación local aplicable"}` },
  ];
}

// ─── POLÍTICA DE COOKIES ───

export function getCookiesSections(isEn: boolean, country: CountryConfig | null): LegalSection[] {
  const name = country?.country_name || "España";
  const laws = getLegislationList(country);

  if (isEn) {
    return [
      { title: "1. What are cookies?", content: "Cookies are small text files that websites store on your device when you visit them." },
      { title: "2. What types of cookies do we use?", content: "• Technical or necessary cookies: Essential for website operation.\n\n• Preference cookies: Allow remembering information such as language.\n\n• Analytical cookies: Allow tracking and statistical analysis of user behavior.\n\n• Marketing cookies: Store behavioral information to offer personalized advertising." },
      { title: "3. Third-party cookies", content: "Some third-party services may install cookies on your device when you visit our platform." },
      { title: "4. How to manage cookies?", content: "You can allow, block or delete installed cookies through your browser settings.\n\n• Google Chrome: chrome://settings/cookies\n• Mozilla Firefox: about:preferences#privacy\n• Safari: Preferences > Privacy\n• Microsoft Edge: edge://settings/content/cookies" },
      { title: "5. Legal basis", content: `The legal basis for technical cookies is legitimate interest. For other cookies, the basis is user consent, in accordance with the applicable regulations in ${name}.` },
      { title: "6. Retention period", content: "Session cookies are deleted when the browser is closed. Persistent cookies have variable duration." },
      { title: "7. Updates", content: "This Cookie Policy may be updated periodically." },
      { title: "8. Applicable legislation", content: `This Cookie Policy is governed by the applicable legislation in ${name}:\n\n${laws || "• Local applicable legislation"}` },
    ];
  }

  return [
    { title: "1. ¿Qué son las cookies?", content: "Las cookies son pequeños archivos de texto que los sitios web almacenan en su dispositivo cuando los visita." },
    { title: "2. ¿Qué tipos de cookies utilizamos?", content: "• Cookies técnicas o necesarias: Son imprescindibles para el funcionamiento del sitio web.\n\n• Cookies de preferencias: Permiten recordar información como el idioma.\n\n• Cookies analíticas: Permiten el seguimiento y análisis estadístico del comportamiento de los usuarios.\n\n• Cookies de marketing: Almacenan información del comportamiento para ofrecer publicidad personalizada." },
    { title: "3. Cookies de terceros", content: "Algunos servicios de terceros pueden instalar cookies en su dispositivo cuando visita nuestra plataforma." },
    { title: "4. ¿Cómo gestionar las cookies?", content: "Puede permitir, bloquear o eliminar las cookies instaladas mediante la configuración de su navegador.\n\n• Google Chrome: chrome://settings/cookies\n• Mozilla Firefox: about:preferences#privacy\n• Safari: Preferencias > Privacidad\n• Microsoft Edge: edge://settings/content/cookies" },
    { title: "5. Base jurídica", content: `La base jurídica para el uso de cookies técnicas es el interés legítimo. Para el resto de cookies, la base es el consentimiento del usuario, conforme a la legislación vigente en ${name}.` },
    { title: "6. Período de conservación", content: "Las cookies de sesión se eliminan al cerrar el navegador. Las cookies persistentes tienen duración variable." },
    { title: "7. Actualizaciones", content: "Esta Política de Cookies puede ser actualizada periódicamente." },
    { title: "8. Legislación aplicable", content: `Esta Política de Cookies se rige por la legislación vigente en ${name}:\n\n${laws || "• Legislación local aplicable"}` },
  ];
}
