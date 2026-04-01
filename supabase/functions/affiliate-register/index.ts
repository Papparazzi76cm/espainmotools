import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email, password, full_name, company } = await req.json();

    if (!email || !password || !full_name) {
      return new Response(JSON.stringify({ error: "email, password y nombre son obligatorios" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: "La contraseña debe tener al menos 6 caracteres" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    const BASE_URL = "https://es-ace-inmotools.lovable.app/auth";

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      // Check if already an affiliate
      const { data: existingAff } = await adminClient
        .from("affiliates")
        .select("affiliate_id, link_afiliado, is_active")
        .eq("user_id", existingUser.id)
        .maybeSingle();

      if (existingAff?.is_active) {
        return new Response(JSON.stringify({ error: "Este email ya tiene una cuenta de afiliado activa. Inicia sesión para acceder a tu panel." }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Activate affiliate for existing user
      if (existingAff && !existingAff.is_active) {
        await adminClient
          .from("affiliates")
          .update({ is_active: true, deactivated_at: null })
          .eq("user_id", existingUser.id);
      } else {
        const { data: newAff } = await adminClient
          .from("affiliates")
          .upsert({ user_id: existingUser.id, is_active: true, deactivated_at: null }, { onConflict: "user_id" })
          .select("affiliate_id")
          .single();

        if (newAff) {
          await adminClient
            .from("affiliates")
            .update({ link_afiliado: `${BASE_URL}?ref=${newAff.affiliate_id}` })
            .eq("user_id", existingUser.id);
        }
      }

      return new Response(JSON.stringify({
        error: "Ya existe una cuenta con este email. Se ha activado el rol de afiliado. Inicia sesión para acceder a tu panel."
      }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create new user with email confirmed
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, company: company || "" },
    });
    if (createError) throw createError;

    const userId = newUser.user.id;

    // Update profile with company if provided
    if (company) {
      await adminClient
        .from("profiles")
        .update({ agency_name: company })
        .eq("user_id", userId);
    }

    // Create affiliate record
    const { data: newAff, error: affError } = await adminClient
      .from("affiliates")
      .upsert({ user_id: userId, is_active: true }, { onConflict: "user_id" })
      .select("affiliate_id")
      .single();
    if (affError) throw affError;

    // Set the affiliate link
    const affiliateLink = `${BASE_URL}?ref=${newAff.affiliate_id}`;
    await adminClient
      .from("affiliates")
      .update({ link_afiliado: affiliateLink })
      .eq("user_id", userId);

    return new Response(JSON.stringify({
      success: true,
      affiliate_id: newAff.affiliate_id,
      link: affiliateLink,
      message: "¡Cuenta de afiliado creada! Ya puedes iniciar sesión.",
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
