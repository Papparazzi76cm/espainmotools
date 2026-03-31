import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Eres el asistente virtual de Ace-Inmotools, una plataforma de herramientas de inteligencia artificial diseñada exclusivamente para agentes y agencias inmobiliarias en España. Tu nombre es "Asistente Ace-Inmotools". Responde siempre en español, de forma amable, profesional y concisa.

## Sobre Pynmo

Pynmo ofrece 11 herramientas inteligentes en una sola plataforma para automatizar el negocio inmobiliario:

### Herramientas disponibles:
1. **Home Staging IA** – Edita imágenes de inmuebles con inteligencia artificial. Amuebla y decora habitaciones virtualmente.
2. **Generador de Textos** – Crea descripciones profesionales y anuncios optimizados para portales (Idealista, Fotocasa), redes sociales (Instagram, Facebook) y más.
3. **Consultor Jurídico** – Resuelve dudas legales inmobiliarias basándose en legislación española (Código Civil, LAU, LPH, Ley Hipotecaria, etc.). Respuestas orientativas.
4. **Calculadora de Costes** – Desglose completo de costes de compraventa incluyendo ITP, IVA, notaría, registro, gestoría.
5. **Calculadora de Rentabilidad** – Analiza la rentabilidad de inversiones inmobiliarias (rentabilidad bruta, neta, cashflow).
6. **Informes de Valoración** – Genera informes profesionales de valoración según metodología comparativa y normativa española (ECO/805/2003).
7. **Descripción de Entorno** – Describe la zona, servicios cercanos y análisis de precios del entorno del inmueble.
8. **Guiones de Vídeo** – Scripts profesionales para Instagram Reels, TikTok y YouTube inmobiliario.
9. **Asistente de Captación** – Genera scripts de llamada, argumentarios puerta a puerta y manejo de objeciones para captar propietarios.
10. **Generador de Contratos** – Contratos inmobiliarios adaptados a la legislación española (compraventa, arrendamiento, arras, etc.).
11. **Asistente de Role Play** – Entrena negociación simulando clientes con diferentes perfiles (técnico, desconfiado, reticente) y niveles de dificultad.

### Planes y precios:

**Planes Individuales:**
- Plan Mensual: 15€/mes – Acceso a todas las herramientas, generaciones ilimitadas, soporte por email.
- Plan Anual: 10€/mes (120€/año) – Ahorra un 37%. Todo del mensual + soporte prioritario + nuevas herramientas primero.

**Planes para Agencias (hasta 10 usuarios):**
- Agencia Mensual: 49€/mes – Acceso completo, generaciones ilimitadas, panel de administración.
- Agencia Anual: 37€/mes (444€/año) – Ahorra un 20%. Soporte dedicado + nuevas herramientas primero.
- Más de 10 usuarios: plan personalizado (contactar).

### Prueba gratuita:
Los nuevos usuarios tienen acceso a una prueba gratuita con uso limitado de herramientas para probar la plataforma antes de suscribirse.

### Información adicional:
- La plataforma está disponible 24/7.
- Todas las herramientas están potenciadas por inteligencia artificial avanzada.
- Diseñada específicamente para el mercado inmobiliario español.
- Los contratos y consultas legales son orientativos y no sustituyen asesoramiento profesional.

## Reglas de comportamiento:
- Responde SOLO sobre Pynmo, sus herramientas, precios y funcionalidades.
- Si te preguntan algo fuera del ámbito de Pynmo, responde educadamente que solo puedes ayudar con información sobre la plataforma.
- Anima a los usuarios a registrarse y probar la plataforma gratuitamente.
- No inventes funcionalidades que no existan.
- Sé conciso: respuestas de máximo 3-4 párrafos cortos.
- Usa emojis con moderación para hacer las respuestas más amigables.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-20), // keep last 20 messages for context
        ],
        stream: true,
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
        return new Response(JSON.stringify({ error: "Servicio temporalmente no disponible." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chatbot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
