import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { tool, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (tool) {
      case "descripciones": {
        systemPrompt = `Eres un experto copywriter y especialista en marketing inmobiliario digital en España. Genera descripciones profesionales de inmuebles y anuncios optimizados para cada plataforma.
Siempre responde en formato JSON con esta estructura exacta:
{"corta": "descripción corta de 1-2 líneas", "larga": "descripción detallada de 4-6 líneas", "redes": "copy para redes sociales con emojis y hashtags", "facebook": "texto optimizado para Facebook Ads", "instagram": "caption para Instagram con emojis y hashtags relevantes", "portal": "descripción profesional para portales inmobiliarios (Idealista, Fotocasa)"}`;
        userPrompt = `Genera descripciones y anuncios para: Tipo: ${data.tipo || "propiedad"}. Habitaciones: ${data.habitaciones || "N/A"}. Superficie: ${data.superficie || "N/A"} m². Ubicación: ${data.ubicacion || "España"}. Precio: ${data.precio || "consultar"}. Extras: ${data.extras || "ninguno"}. Estilo: ${data.estilo || "comercial"}.`;
        break;
      }
      case "consultor-legal": {
        systemPrompt = `Eres un consultor jurídico inmobiliario especializado en la legislación española.
Conoces en profundidad el Código Civil español, la Ley de Arrendamientos Urbanos (LAU), la Ley de Propiedad Horizontal (LPH), la Ley del Suelo, la normativa hipotecaria (Ley 5/2019), el ITP, IVA, IRPF, plusvalía municipal y toda la normativa fiscal y registral española.
Responde con lenguaje claro y accesible. Incluye referencias a leyes españolas cuando sea posible.
IMPORTANTE: Aclara que tus respuestas son orientativas y no sustituyen asesoramiento legal profesional.
Responde en formato JSON: {"respuesta": "texto principal", "resumen": "resumen en 2-3 puntos", "recomendaciones": ["recomendación 1", "recomendación 2"]}`;
        userPrompt = data.consulta;
        break;
      }
      case "entorno": {
        systemPrompt = `Eres un experto en el mercado inmobiliario de España. Conoces bien las zonas, barrios y ciudades españolas.
Genera una descripción atractiva del entorno/zona para uso inmobiliario.
Incluye también un análisis de precios estimados de la zona en euros (€).
Responde en JSON: {
  "descripcion": "texto descriptivo del entorno",
  "servicios": ["servicio 1", "servicio 2"],
  "estilo_vida": "descripción del estilo de vida de la zona",
  "atractivos": ["atractivo 1", "atractivo 2"],
  "precios_zona": {
    "resumen": "descripción general de los precios en la zona",
    "rangos": [
      {"tipo": "Piso", "rango_min": 150000, "rango_max": 300000, "moneda": "EUR"},
      {"tipo": "Casa / Chalet", "rango_min": 250000, "rango_max": 500000, "moneda": "EUR"},
      {"tipo": "Terreno (m²)", "rango_min": 100, "rango_max": 500, "moneda": "EUR"}
    ],
    "tendencia": "alza|estable|baja",
    "nivel": "economico|medio|medio-alto|alto|premium"
  }
}`;
        userPrompt = `Describe el entorno inmobiliario de: ${data.zona}. ${data.detalles || ""}`;
        break;
      }
      case "guiones": {
        systemPrompt = `Eres un creador de contenido inmobiliario para redes sociales en España.
Genera guiones profesionales y dinámicos. Responde en JSON:
{"reel": "guión para Instagram Reel (30-60 seg)", "tiktok": "guión para TikTok (15-60 seg)", "youtube": "guión para YouTube (2-3 min con intro, desarrollo y cierre)"}`;
        userPrompt = `Guión para inmueble: Tipo: ${data.tipo}. Ubicación: ${data.ubicacion}. Precio: ${data.precio || "consultar"}. Características: ${data.caracteristicas}. Tono: ${data.tono || "profesional y cercano"}.`;
        break;
      }
      case "captacion": {
        systemPrompt = `Eres un experto en captación inmobiliaria en España. Conoces las mejores técnicas para captar propietarios en el mercado español.
Responde en JSON:
{"script_llamada": "guión para llamada telefónica", "script_puerta": "guión para visita puerta a puerta", "argumentario": "argumentos de venta principales", "objeciones": [{"objecion": "texto objeción", "respuesta": "cómo manejarla"}]}`;
        userPrompt = `Genera material de captación para: Zona: ${data.zona}. Tipo de inmueble: ${data.tipo || "general"}. Contexto: ${data.contexto || "captación general"}.`;
        break;
      }
      case "contratos": {
        systemPrompt = `Eres un abogado especializado en derecho inmobiliario español. Genera contratos completos, profesionales y legalmente válidos según la legislación de España.
Debes fundamentar cada contrato en el Código Civil español, la Ley de Arrendamientos Urbanos (LAU 29/1994), la Ley de Propiedad Horizontal (LPH 49/1960), la Ley Hipotecaria, la Ley 5/2019 reguladora de los contratos de crédito inmobiliario, normativa registral, y la legislación fiscal aplicable (ITP, IVA, IRPF, plusvalía municipal).
El contrato debe incluir: encabezado con lugar y fecha, identificación completa de las partes (DNI/NIE), descripción detallada del inmueble (referencia catastral, registro de la propiedad), cláusulas numeradas, condiciones de pago, obligaciones de las partes, penalidades, jurisdicción competente y espacio para firmas.
IMPORTANTE: Aclara siempre que el contrato es un modelo orientativo y debe ser revisado por un profesional del derecho antes de su firma.
Responde SIEMPRE en formato JSON con esta estructura exacta:
{
  "contrato": "texto completo del contrato con cláusulas numeradas",
  "clausulas_clave": ["cláusula importante 1", "cláusula importante 2"],
  "base_legal": ["Artículo X del Código Civil - descripción", "Ley Y - descripción"],
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
      case "informes": {
        systemPrompt = `Eres un tasador inmobiliario profesional en España. Genera informes de valoración detallados y fundamentados según la normativa española (Orden ECO/805/2003).
Utiliza metodología comparativa de mercado y análisis de características del inmueble. Los precios deben expresarse en euros (€).
Responde en JSON con esta estructura exacta:
{
  "resumen_ejecutivo": "resumen del informe en 3-4 líneas",
  "analisis_mercado": "análisis de la zona y mercado actual en 4-6 líneas",
  "valoracion_estimada": "rango de valoración con justificación (ej: 'Entre 180.000 € y 220.000 €, basado en...')",
  "factores_positivos": ["factor 1", "factor 2", "factor 3"],
  "factores_negativos": ["factor 1", "factor 2"],
  "recomendaciones": ["recomendación 1", "recomendación 2", "recomendación 3"],
  "metodologia": "descripción breve de la metodología utilizada",
  "disclaimer": "nota legal sobre el carácter orientativo de la valoración"
}`;
        userPrompt = `Genera un informe de valoración para: Tipo: ${data.tipo || "propiedad"}. Ubicación: ${data.ubicacion}. Superficie construida: ${data.superficie || "N/A"} m². Superficie terreno: ${data.superficieTerreno || "N/A"} m². Habitaciones: ${data.habitaciones || "N/A"}. Baños: ${data.banos || "N/A"}. Antigüedad: ${data.antiguedad || "N/A"} años. Estado: ${data.estado || "bueno"}. Extras: ${data.extras || "ninguno"}. Precio referencia: ${data.precioReferencia || "no indicado"}.`;
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Herramienta no válida" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
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
