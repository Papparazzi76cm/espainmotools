import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AGENTS = [
  { full_name: "Álvaro Casado Duque", email: "alvaro.casado@remax.es", phone: "647194976" },
  { full_name: "Angela Aldeano Herrera", email: "angela.aldeano@remax.es", phone: "635387008" },
  { full_name: "Verónica de Hinojosa", email: "veronica.dehinojosa@remax.es", phone: "679650415" },
  { full_name: "Alejandro García Sebastián", email: "alejandro.garcia@remax.es", phone: "722278182" },
  { full_name: "Gonzalo Duque Ramos", email: "gonzalo.duque@remax.es", phone: "628941025" },
  { full_name: "Jean Karlos Costa Siqueira", email: "jeankarlos.costa@remax.es", phone: "664169714" },
  { full_name: "Jesús Cuadrado García", email: "jesus.cuadrado@remax.es", phone: "608681850" },
  { full_name: "Luis López Pastor", email: "luis.lopez@remax.es", phone: "686232395" },
  { full_name: "Luis Manuel Lorenzo Bilbao", email: "luisma.lorenzo@remax.es", phone: "672577152" },
  { full_name: "Mariacela Muñoz Guerrero", email: "mai.munoz@remax.es", phone: "634648852" },
  { full_name: "Mario Juan Rujas", email: "mario.juan@remax.es", phone: "673934406" },
  { full_name: "Marta Arranz Álvarez", email: "marta.arranz@remax.es", phone: "673371596" },
  { full_name: "Melani Vaquerizo González", email: "melani.vaquerizo@remax.es", phone: "618439339" },
  { full_name: "Nicolás Valle Hernández", email: "nicolas.valle@remax.es", phone: "688308538" },
  { full_name: "Orlando Vicente Rodríguez García", email: "orlandovicente.rodriguez@remax.es", phone: "619257000" },
  { full_name: "Patricia Leyre Santos Korstanje", email: "patricialeyre.santos@remax.es", phone: "692689947" },
  { full_name: "Patricia Rodríguez León", email: "patricia.rodriguezleon@remax.es", phone: "606748904" },
  { full_name: "Rodrigo Lorenzo Pahino", email: "rodrigo.lorenzo@remax.es", phone: "653066078" },
  { full_name: "Román Furhach", email: "roman.furhach@remax.es", phone: "697840870" },
  { full_name: "Sara Albo López", email: "sara.albo@remax.es", phone: "608770732" },
  { full_name: "Sara Vega Revilla", email: "sara.vega@remax.es", phone: "608306358" },
  { full_name: "Víctor Estival Vieira", email: "victor.estival@remax.es", phone: "632120372" },
  { full_name: "Víctor Triguero de la Fuente", email: "victor.triguero@remax.es", phone: "625771832" },
  { full_name: "Yasmin Noriega Sánchez", email: "yasmin.noriega@remax.es", phone: "605053709" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const callerUserId = claimsData.claims.sub;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUserId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    // 1. Create or find RE/MAX Nexo agency
    let { data: existingAgency } = await adminClient
      .from("agencies")
      .select("id")
      .eq("name", "RE/MAX Nexo")
      .maybeSingle();

    let agencyId: string;
    if (existingAgency) {
      agencyId = existingAgency.id;
    } else {
      const { data: newAgency, error: agencyErr } = await adminClient
        .from("agencies")
        .insert({ name: "RE/MAX Nexo", max_agents: 30, status: "active" })
        .select()
        .single();
      if (agencyErr) throw agencyErr;
      agencyId = newAgency.id;
    }

    // 2. Create each agent
    const results: { email: string; status: string; password?: string }[] = [];
    const defaultPassword = "RemaxNexo2026!";

    for (const agent of AGENTS) {
      try {
        // Create auth user with auto-confirm
        const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
          email: agent.email,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: { full_name: agent.full_name },
        });

        if (authErr) {
          // User might already exist
          results.push({ email: agent.email, status: `error: ${authErr.message}` });
          continue;
        }

        const userId = authUser.user.id;

        // Update profile with agency info
        await adminClient
          .from("profiles")
          .update({
            full_name: agent.full_name,
            agency_id: agencyId,
            agency_name: "RE/MAX Nexo",
            agency_phone: agent.phone,
            agency_email: agent.email,
          })
          .eq("user_id", userId);

        // Assign agente role
        await adminClient
          .from("user_roles")
          .upsert({ user_id: userId, role: "agente" }, { onConflict: "user_id,role" });

        results.push({ email: agent.email, status: "created", password: defaultPassword });
      } catch (e) {
        results.push({ email: agent.email, status: `error: ${e.message}` });
      }
    }

    // 3. Create agency owner account (Verónica as main contact already created above)
    // Set one agent as agencia role for management
    // We'll let the admin assign this manually

    return new Response(JSON.stringify({ 
      success: true, 
      agency_id: agencyId,
      total: AGENTS.length,
      results,
      default_password: defaultPassword,
      message: "Todos los agentes pueden iniciar sesión con la contraseña temporal y cambiarla desde su dashboard."
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
