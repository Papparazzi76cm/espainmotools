import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { tool, data, images, language, country } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "en" ? "en" : "es";
    const langInstruction = lang === "en"
      ? "\n\nIMPORTANT: You MUST respond entirely in English. All text, labels, descriptions and content must be in English."
      : "";

    // Country context - defaults to Spain if not provided
    const countryName = country?.name || "España";
    const countryCode = country?.code || "es";
    const aiContext = country?.ai_context || "";
    const legislation = country?.legislation || {};
    const taxConfig = country?.tax_config || {};
    const terminology = country?.terminology || {};

    const countryInstruction = `\n\nCONTEXTO DE PAÍS: ${countryName} (${countryCode.toUpperCase()}).
${aiContext}
Usa la terminología local: ${Object.entries(terminology).map(([k, v]) => `${k}=${v}`).join(", ")}.
Adapta todas las referencias legales, fiscales e impositivas a la legislación de ${countryName}.
NO menciones leyes ni impuestos de otros países a menos que se pida expresamente una comparativa.`;

    let systemPrompt = "";
    let userPrompt = "";

    switch (tool) {
      case "descripciones": {
        const hasImages = images && Array.isArray(images) && images.length > 0;
        systemPrompt = `Eres un experto copywriter y especialista en marketing inmobiliario digital en ${countryName}. Genera descripciones profesionales de inmuebles y anuncios optimizados para cada plataforma.
${hasImages ? "Se te proporcionan fotografías del inmueble. Analízalas detalladamente para identificar: estilo arquitectónico, acabados, materiales, luminosidad, distribución, vistas, estado de conservación y cualquier detalle relevante. Usa esta información visual para enriquecer significativamente las descripciones generadas." : ""}
Usa la moneda y terminología local de ${countryName}. Adapta los portales inmobiliarios a los más relevantes del país.
Siempre responde en formato JSON con esta estructura exacta:
{"corta": "descripción corta de 1-2 líneas", "larga": "descripción detallada de 4-6 líneas", "redes": "copy para redes sociales con emojis y hashtags", "facebook": "texto optimizado para Facebook Ads", "instagram": "caption para Instagram con emojis y hashtags relevantes", "portal": "descripción profesional para portales inmobiliarios del país"}`;
        userPrompt = `Genera descripciones y anuncios para: Tipo: ${data.tipo || "propiedad"}. Habitaciones: ${data.habitaciones || "N/A"}. Superficie: ${data.superficie || "N/A"} m². Ubicación: ${data.ubicacion || "España"}. Precio: ${data.precio || "consultar"}. Extras: ${data.extras || "ninguno"}. Estilo: ${data.estilo || "comercial"}.`;
        break;
      }
      case "consultor-legal": {
        const lawsList = Object.entries(legislation).map(([k, v]) => `- ${v}`).join("\n");
        const taxList = Object.entries(taxConfig).map(([k, v]) => `- ${k}: ${v}`).join("\n");
        systemPrompt = `Eres un consultor jurídico inmobiliario especializado en la legislación de ${countryName}.
Conoces en profundidad la normativa inmobiliaria del país, incluyendo:
${lawsList || "la legislación inmobiliaria vigente"}

Impuestos y fiscalidad aplicable:
${taxList || "la normativa fiscal vigente"}

Responde con lenguaje claro y accesible. Incluye referencias a leyes de ${countryName} cuando sea posible.
IMPORTANTE: Aclara que tus respuestas son orientativas y no sustituyen asesoramiento legal profesional.
Responde en formato JSON: {"respuesta": "texto principal", "resumen": "resumen en 2-3 puntos", "recomendaciones": ["recomendación 1", "recomendación 2"]}`;
        userPrompt = data.consulta;
        break;
      }
      case "entorno": {
        const currSymbol = countryCode === "es" ? "€" : (terminology?.currency_symbol || "$");
        const currCode = country?.code === "es" ? "EUR" : (country?.currency_code || "USD");
        systemPrompt = `Eres un experto en el mercado inmobiliario de ${countryName}. Conoces bien las zonas, barrios y ciudades del país.
Genera una descripción atractiva del entorno/zona para uso inmobiliario.
Incluye también un análisis de precios estimados de la zona en la moneda local.
Responde en JSON: {
  "descripcion": "texto descriptivo del entorno",
  "servicios": ["servicio 1", "servicio 2"],
  "estilo_vida": "descripción del estilo de vida de la zona",
  "atractivos": ["atractivo 1", "atractivo 2"],
  "precios_zona": {
    "resumen": "descripción general de los precios en la zona",
    "rangos": [
      {"tipo": "${terminology?.piso || "Departamento/Piso"}", "rango_min": 0, "rango_max": 0, "moneda": "${currCode}"},
      {"tipo": "Casa", "rango_min": 0, "rango_max": 0, "moneda": "${currCode}"},
      {"tipo": "Terreno (m²)", "rango_min": 0, "rango_max": 0, "moneda": "${currCode}"}
    ],
    "tendencia": "alza|estable|baja",
    "nivel": "economico|medio|medio-alto|alto|premium"
  }
}`;
        userPrompt = `Describe el entorno inmobiliario de: ${data.zona}. ${data.detalles || ""}`;
        break;
      }
      case "guiones": {
        systemPrompt = `Eres un creador de contenido inmobiliario para redes sociales en ${countryName}.
Genera guiones profesionales y dinámicos adaptados a la duración indicada. Usa terminología local del país.
Responde en JSON:
{"reel": "guión para Instagram Reel", "tiktok": "guión para TikTok", "youtube": "guión para YouTube con intro, desarrollo y cierre"}`;
        userPrompt = `Guión para inmueble: Tipo: ${data.tipo}. Ubicación: ${data.ubicacion}. Precio: ${data.precio || "consultar"}. Características: ${data.caracteristicas}. Tono: ${data.tono || "profesional y cercano"}. Duración objetivo: ${data.duracion || "60 segundos"}.`;
        break;
      }
      case "captacion": {
        systemPrompt = `Eres un experto en captación inmobiliaria en ${countryName}. Conoces las mejores técnicas para captar propietarios en el mercado del país.
Responde en JSON:
{"script_llamada": "guión para llamada telefónica", "script_puerta": "guión para visita puerta a puerta", "argumentario": "argumentos de venta principales", "objeciones": [{"objecion": "texto objeción", "respuesta": "cómo manejarla"}]}`;
        userPrompt = `Genera material de captación para: Zona: ${data.zona}. Tipo de inmueble: ${data.tipo || "general"}. Contexto: ${data.contexto || "captación general"}.`;
        break;
      }
      case "contratos": {
        const contractLaws = Object.entries(legislation).map(([k, v]) => `- ${v}`).join("\n");
        systemPrompt = `Eres un abogado especializado en derecho inmobiliario de ${countryName}. Genera contratos completos, profesionales y legalmente válidos según la legislación del país.
Debes fundamentar cada contrato en la normativa vigente de ${countryName}:
${contractLaws || "la legislación inmobiliaria aplicable"}

El contrato debe incluir: encabezado con lugar y fecha, identificación completa de las partes, descripción detallada del inmueble, cláusulas numeradas, condiciones de pago, obligaciones de las partes, penalidades, jurisdicción competente y espacio para firmas.
Usa la terminología legal local del país (${terminology?.escritura || "escritura"}, ${terminology?.notario || "notario"}, ${terminology?.arrendador || "arrendador"}, ${terminology?.arrendatario || "arrendatario"}, etc.).
IMPORTANTE: Aclara siempre que el contrato es un modelo orientativo y debe ser revisado por un profesional del derecho antes de su firma.
Responde SIEMPRE en formato JSON con esta estructura exacta:
{
  "contrato": "texto completo del contrato con cláusulas numeradas",
  "clausulas_clave": ["cláusula importante 1", "cláusula importante 2"],
  "base_legal": ["Referencia legal 1 - descripción", "Referencia legal 2 - descripción"],
  "advertencias": ["advertencia legal 1", "advertencia 2"],
  "resumen": "resumen ejecutivo del contrato en 2-3 líneas"
}`;
        userPrompt = `Genera un contrato de ${data.tipo} con los siguientes datos:
Partes involucradas: ${data.partes}.
Inmueble: ${data.inmueble}.
Condiciones económicas: ${data.condiciones || "a definir por las partes"}.
Detalles adicionales: ${data.detalles || "ninguno"}.`;
        break;
      }
      case "costes-vendedor": {
        const taxDetails = Object.entries(taxConfig).map(([k, v]) => `- ${k}: ${v}`).join("\n");
        systemPrompt = `Eres un asesor fiscal inmobiliario experto en la legislación tributaria de ${countryName}. Calcula con precisión los costes fiscales de una venta de inmueble según la normativa del país.

Impuestos y tasas aplicables en ${countryName}:
${taxDetails || "Consulta la normativa fiscal vigente del país."}

Calcula cada impuesto según los tramos y tasas vigentes del país. Considera gastos deducibles habituales.

Responde en JSON:
{
  "impuesto_principal_importe": número,
  "impuesto_principal_detalle": "explicación del cálculo del impuesto principal sobre la ganancia",
  "impuesto_transferencia_estimado": número,
  "impuesto_transferencia_detalle": "explicación del cálculo del impuesto de transferencia/plusvalía",
  "otros_costes": "otros costes aplicables (notaría, registro, etc.)",
  "notas": "observaciones adicionales o recomendaciones fiscales"
}`;
        userPrompt = `Calcula los costes fiscales de venta de un inmueble en ${countryName}:
- Precio de venta: ${data.precio_venta}
- Precio de adquisición: ${data.precio_adquisicion}
- Año de adquisición: ${data.anio_adquisicion}
- Año actual: ${new Date().getFullYear()}
- Región/Estado/Provincia: ${data.comunidad || "no especificada"}
- Comisión del agente: ${data.comision}%`;
        break;
      }
      case "informes": {
        systemPrompt = `Eres un tasador inmobiliario profesional en ${countryName}. Genera informes de valoración detallados y fundamentados según la normativa del país.
Utiliza metodología comparativa de mercado y análisis de características del inmueble. Los precios deben expresarse en la moneda local del país.
Responde en JSON con esta estructura exacta:
{
  "resumen_ejecutivo": "resumen del informe en 3-4 líneas",
  "analisis_mercado": "análisis de la zona y mercado actual en 4-6 líneas",
  "valoracion_estimada": "rango de valoración con justificación",
  "factores_positivos": ["factor 1", "factor 2", "factor 3"],
  "factores_negativos": ["factor 1", "factor 2"],
  "recomendaciones": ["recomendación 1", "recomendación 2", "recomendación 3"],
  "metodologia": "descripción breve de la metodología utilizada",
  "disclaimer": "nota legal sobre el carácter orientativo de la valoración"
}`;
        userPrompt = `Genera un informe de valoración para: Tipo: ${data.tipo || "propiedad"}. Ubicación: ${data.ubicacion}. Superficie construida: ${data.superficie || "N/A"} m². Superficie terreno: ${data.superficieTerreno || "N/A"} m². Habitaciones: ${data.habitaciones || "N/A"}. Baños: ${data.banos || "N/A"}. Antigüedad: ${data.antiguedad || "N/A"} años. Estado: ${data.estado || "bueno"}. Extras: ${data.extras || "ninguno"}. Precio referencia: ${data.precioReferencia || "no indicado"}.${data.descripcion_inmueble ? `\n\nDESCRIPCIÓN DETALLADA DEL INMUEBLE (generada previamente por el agente, úsala para enriquecer significativamente el informe con detalles precisos sobre el inmueble):\n${data.descripcion_inmueble}` : ""}`;
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Herramienta no válida" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Append language instruction to system prompt
    systemPrompt += langInstruction;

    // Build messages - support multimodal content for descripciones with images
    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    if (tool === "descripciones" && images && Array.isArray(images) && images.length > 0) {
      // Build multimodal user message with text + images
      const contentParts: any[] = [
        { type: "text", text: userPrompt + `\n\nSe adjuntan ${images.length} fotografía(s) del inmueble. Analízalas para enriquecer las descripciones con detalles visuales reales.` },
      ];
      for (const img of images.slice(0, 20)) {
        contentParts.push({
          type: "image_url",
          image_url: { url: img },
        });
      }
      messages.push({ role: "user", content: contentParts });
    } else {
      messages.push({ role: "user", content: userPrompt });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados. Contacta al administrador." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      result = { raw: content };
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("inmo-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
