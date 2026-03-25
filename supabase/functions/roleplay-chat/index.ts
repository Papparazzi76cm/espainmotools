import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CLIENT_PROFILES: Record<string, { description: string; difficulty: string }> = {
  comprensivo: {
    description: "Cliente amable, abierto a escuchar y dispuesto a considerar opciones. Hace preguntas normales y acepta argumentos razonables con facilidad.",
    difficulty: "baja",
  },
  curioso: {
    description: "Cliente muy preguntón que quiere entender cada detalle. Hace muchas preguntas pero no con mala intención, sino por genuino interés.",
    difficulty: "baja",
  },
  tecnico: {
    description: "Cliente con conocimientos técnicos o legales. Pregunta sobre aspectos constructivos, legales, fiscales. Detecta respuestas vagas.",
    difficulty: "media",
  },
  reticente: {
    description: "Cliente pasivo que no muestra entusiasmo. Da respuestas cortas y no se compromete fácilmente. Cuesta mantenerle enganchado.",
    difficulty: "media",
  },
  desconfiado: {
    description: "Cliente que duda de todo, pide pruebas, compara constantemente, sospecha de las intenciones del agente. Difícil de convencer.",
    difficulty: "alta",
  },
  malas_experiencias: {
    description: "Cliente que ha tenido malas experiencias con agentes inmobiliarios. Está resentido, menciona situaciones pasadas negativas y es muy exigente.",
    difficulty: "alta",
  },
  negociador_agresivo: {
    description: "Cliente que intenta imponer condiciones, presiona con el precio, amenaza con irse, usa tácticas de negociación agresivas.",
    difficulty: "alta",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, role, profile, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const profileData = CLIENT_PROFILES[profile];
    if (!profileData) {
      return new Response(JSON.stringify({ error: "Perfil de cliente no válido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const roleName = role === "comprador" ? "comprador interesado en adquirir un inmueble" : "vendedor/propietario que quiere vender su inmueble";
    const agentAction = role === "comprador" ? "venderle el inmueble" : "captar su inmueble para gestionarlo";

    // If action is "evaluate", generate final feedback
    if (action === "evaluate") {
      const evalPrompt = `Analiza la conversación de role-play inmobiliario y genera una evaluación detallada del desempeño del agente.

Perfil del cliente simulado: ${profile} (${profileData.description}) - Dificultad: ${profileData.difficulty}
Rol de la IA: ${roleName}
Objetivo del agente: ${agentAction}

Conversación:
${messages.map((m: any) => `${m.role === "user" ? "AGENTE" : "CLIENTE"}: ${m.content}`).join("\n")}

Genera una evaluación en JSON:
{
  "puntuacion": número del 1 al 10,
  "resumen": "resumen general del desempeño en 2-3 líneas",
  "aciertos": ["punto positivo 1", "punto positivo 2"],
  "mejoras": ["área de mejora 1", "área de mejora 2"],
  "objeciones_resueltas": número,
  "objeciones_pendientes": ["objeción no resuelta 1"],
  "consejo_final": "consejo principal para mejorar"
}`;

      const evalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Eres un formador experto en ventas inmobiliarias en España. Evalúa objetivamente." },
            { role: "user", content: evalPrompt },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!evalResponse.ok) {
        const status = evalResponse.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Créditos agotados." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI error: ${status}`);
      }

      const evalData = await evalResponse.json();
      const content = evalData.choices?.[0]?.message?.content || "{}";
      let result;
      try { result = JSON.parse(content); } catch { result = { raw: content }; }

      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Streaming chat
    const systemPrompt = `Eres un simulador de cliente inmobiliario para entrenamiento de agentes en España. 
Tu rol: ${roleName}.
Tu perfil de personalidad: "${profile}" — ${profileData.description}
Nivel de dificultad: ${profileData.difficulty}

REGLAS ESTRICTAS:
1. NUNCA rompas el personaje. Siempre actúa como el cliente, no como un asistente.
2. Plantea objeciones realistas acordes a tu perfil de personalidad.
3. No cedas fácilmente. Solo acepta cuando el agente toque puntos de dolor reales y dé argumentos convincentes.
4. Responde de forma natural, como hablaría un cliente real en España. Usa español de España (tuteo, expresiones españolas).
5. Tus respuestas deben ser concisas (2-4 frases máximo).
6. Si el agente comete errores (presiona demasiado, no escucha, etc.), reacciona negativamente.
7. Incluye detalles de contexto personal realistas (familia, trabajo, situación financiera) para hacer la simulación creíble.
8. Haz referencia a la realidad del mercado inmobiliario español cuando sea relevante (hipotecas, Euríbor, ITP, notaría, etc.).

Objetivo del agente: ${agentAction}. Tú debes poner las objeciones típicas de tu perfil.`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Demasiadas solicitudes." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Créditos agotados." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("roleplay-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
