import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user with anon client
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const callerUserId = claimsData.claims.sub;

    // Service role client for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check caller is admin
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUserId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), { status: 403, headers: corsHeaders });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case "list_users": {
        // Get all profiles with their roles
        const { data: profiles, error } = await adminClient
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Get all roles
        const { data: roles } = await adminClient.from("user_roles").select("*");
        
        // Get all user_trials
        const { data: trials } = await adminClient.from("user_trials").select("*");

        // Get auth users for email (paginate to get all)
        let allAuthUsers: any[] = [];
        let page = 1;
        while (true) {
          const { data } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 });
          if (!data?.users?.length) break;
          allAuthUsers = allAuthUsers.concat(data.users);
          if (data.users.length < 1000) break;
          page++;
        }

        // Merge data
        const users = profiles?.map((p) => {
          const role = roles?.find((r) => r.user_id === p.user_id);
          const trial = trials?.find((t) => t.user_id === p.user_id);
          const authUser = allAuthUsers.find((u) => u.id === p.user_id);
          return {
            ...p,
            email: authUser?.email || p.agency_email,
            role: role?.role || "agente",
            trial_end: trial?.trial_end,
            trial_start: trial?.trial_start,
            is_paid: trial?.is_paid || false,
          };
        });

        return new Response(JSON.stringify({ users }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "update_user_role": {
        const { user_id, role } = params;
        if (!user_id || !role) throw new Error("user_id and role required");

        // Upsert role
        const { error } = await adminClient
          .from("user_roles")
          .upsert({ user_id, role }, { onConflict: "user_id,role" });

        // If changing role, delete old roles first
        await adminClient.from("user_roles").delete().eq("user_id", user_id);
        const { error: insertError } = await adminClient.from("user_roles").insert({ user_id, role });

        if (insertError) throw insertError;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "update_user_status": {
        const { user_id, status } = params;
        if (!user_id || !status) throw new Error("user_id and status required");

        const { error } = await adminClient
          .from("profiles")
          .update({ status })
          .eq("user_id", user_id);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "update_user_access": {
        const { user_id, access_start, access_end, is_paid } = params;
        if (!user_id) throw new Error("user_id required");

        // Update profiles
        const { error: profileError } = await adminClient
          .from("profiles")
          .update({ access_start, access_end })
          .eq("user_id", user_id);
        if (profileError) throw profileError;

        // Update trial if is_paid changed
        if (typeof is_paid === "boolean") {
          await adminClient
            .from("user_trials")
            .update({ is_paid })
            .eq("user_id", user_id);
        }

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "assign_agency": {
        const { user_id, agency_id } = params;
        if (!user_id) throw new Error("user_id required");

        const { error } = await adminClient
          .from("profiles")
          .update({ agency_id })
          .eq("user_id", user_id);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "delete_user": {
        const { user_id } = params;
        if (!user_id) throw new Error("user_id required");
        if (user_id === callerUserId) throw new Error("Cannot delete yourself");

        const { error } = await adminClient.auth.admin.deleteUser(user_id);
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "list_agencies": {
        const { data, error } = await adminClient
          .from("agencies")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return new Response(JSON.stringify({ agencies: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "create_agency": {
        const { name, contact_email, phone, contract_start, contract_end, max_agents } = params;
        if (!name) throw new Error("name required");

        const { data, error } = await adminClient
          .from("agencies")
          .insert({ name, contact_email, phone, contract_start, contract_end, max_agents: max_agents || 10 })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ agency: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "update_agency": {
        const { agency_id, ...agencyData } = params;
        if (!agency_id) throw new Error("agency_id required");

        const { error } = await adminClient
          .from("agencies")
          .update(agencyData)
          .eq("id", agency_id);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "delete_agency": {
        const { agency_id } = params;
        if (!agency_id) throw new Error("agency_id required");

        const { error } = await adminClient.from("agencies").delete().eq("id", agency_id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "toggle_affiliate": {
        const { user_id, activate } = params;
        if (!user_id) throw new Error("user_id required");
        const BASE_URL = "https://es-ace-inmotools.lovable.app/auth";

        if (activate) {
          const { data: existing } = await adminClient
            .from("affiliates")
            .select("*")
            .eq("user_id", user_id)
            .maybeSingle();

          if (existing) {
            const { error } = await adminClient
              .from("affiliates")
              .update({ is_active: true, deactivated_at: null })
              .eq("user_id", user_id);
            if (error) throw error;
          } else {
            // Insert and then update link_afiliado with the generated affiliate_id
            const { data: newAff, error } = await adminClient
              .from("affiliates")
              .insert({ user_id, is_active: true })
              .select("affiliate_id")
              .single();
            if (error) throw error;
            await adminClient
              .from("affiliates")
              .update({ link_afiliado: `${BASE_URL}?ref=${newAff.affiliate_id}` })
              .eq("user_id", user_id);
          }
        } else {
          const { error } = await adminClient
            .from("affiliates")
            .update({ is_active: false, deactivated_at: new Date().toISOString() })
            .eq("user_id", user_id);
          if (error) throw error;
        }

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "regenerate_affiliate": {
        const { user_id } = params;
        if (!user_id) throw new Error("user_id required");
        const BASE_URL_REGEN = "https://es-ace-inmotools.lovable.app/auth";

        // Generate new affiliate_id
        const newId = "AFF-" + crypto.randomUUID().replace(/-/g, "").slice(0, 10);
        const { error } = await adminClient
          .from("affiliates")
          .update({ affiliate_id: newId, link_afiliado: `${BASE_URL_REGEN}?ref=${newId}` })
          .eq("user_id", user_id);
        if (error) throw error;

        return new Response(JSON.stringify({ success: true, affiliate_id: newId }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "list_affiliates": {
        const { data, error } = await adminClient
          .from("affiliates")
          .select("*");
        if (error) throw error;
        return new Response(JSON.stringify({ affiliates: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: corsHeaders });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
