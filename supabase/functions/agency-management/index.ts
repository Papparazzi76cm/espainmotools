import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const callerUserId = claimsData.claims.sub;

    const adminClient = createClient(supabaseUrl, serviceKey);

    // Verify caller is agencia or agencia_xl
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUserId)
      .in("role", ["agencia", "agencia_xl", "admin"])
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: agency role required" }), { status: 403, headers: corsHeaders });
    }

    // Get caller's agency_id
    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("agency_id")
      .eq("user_id", callerUserId)
      .maybeSingle();

    const callerAgencyId = callerProfile?.agency_id;
    const isAdmin = roleData.role === "admin";
    if (!callerAgencyId && !isAdmin) {
      return new Response(JSON.stringify({ error: "No agency assigned to your account" }), { status: 400, headers: corsHeaders });
    }

    const { action, ...params } = await req.json();

    // Admin can specify agency_id to view any agency; non-admins always use their own
    const effectiveAgencyId = isAdmin && params.agency_id ? params.agency_id : callerAgencyId;

    switch (action) {
      case "list_agencies": {
        // Admin-only: list all agencies
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
        }
        const { data, error } = await adminClient
          .from("agencies")
          .select("id, name, status, max_agents, contact_email")
          .order("name");
        if (error) throw error;
        return new Response(JSON.stringify({ agencies: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "get_agency_info": {
        if (!effectiveAgencyId) {
          return new Response(JSON.stringify({ error: "No agency_id specified" }), { status: 400, headers: corsHeaders });
        }
        const { data, error } = await adminClient
          .from("agencies")
          .select("*")
          .eq("id", effectiveAgencyId)
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ agency: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "list_agents": {
        // Get all profiles belonging to this agency
        const { data: profiles, error } = await adminClient
          .from("profiles")
          .select("*")
          .eq("agency_id", effectiveAgencyId)
          .order("created_at", { ascending: false });
        if (error) throw error;

        // Get roles and auth info
        const userIds = profiles?.map(p => p.user_id) || [];
        const { data: roles } = await adminClient.from("user_roles").select("*").in("user_id", userIds);
        const { data: trials } = await adminClient.from("user_trials").select("*").in("user_id", userIds);
        const { data: authUsers } = await adminClient.auth.admin.listUsers();

        // Get user permissions
        const { data: userPerms } = await adminClient.from("user_permissions").select("*, permissions(name)").in("user_id", userIds);

        const agents = profiles?.map(p => {
          const role = roles?.find(r => r.user_id === p.user_id);
          const trial = trials?.find(t => t.user_id === p.user_id);
          const authUser = authUsers?.users?.find(u => u.id === p.user_id);
          const perms = userPerms?.filter(up => up.user_id === p.user_id).map(up => up.permissions?.name) || [];
          return {
            ...p,
            email: authUser?.email || p.agency_email,
            role: role?.role || "agente",
            trial_end: trial?.trial_end,
            is_paid: trial?.is_paid || false,
            permissions: perms,
          };
        });

        return new Response(JSON.stringify({ agents }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "invite_agent": {
        const { email, full_name } = params;
        if (!email) throw new Error("email required");

        // Check agency agent limit
        const { data: agency } = await adminClient
          .from("agencies")
          .select("max_agents")
          .eq("id", effectiveAgencyId)
          .single();

        const { count } = await adminClient
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("agency_id", callerAgencyId);

        if (agency && count !== null && count >= agency.max_agents) {
          throw new Error(`Límite de agentes alcanzado (${agency.max_agents}). Contacta con soporte para ampliar.`);
        }

        // Check if user already exists
        const { data: authUsers } = await adminClient.auth.admin.listUsers();
        const existingUser = authUsers?.users?.find(u => u.email === email);

        if (existingUser) {
          // Assign to agency
          const { error: profileError } = await adminClient
            .from("profiles")
            .update({ agency_id: callerAgencyId })
            .eq("user_id", existingUser.id);
          if (profileError) throw profileError;

          // Ensure role is agente
          await adminClient.from("user_roles").delete().eq("user_id", existingUser.id);
          await adminClient.from("user_roles").insert({ user_id: existingUser.id, role: "agente" });

          return new Response(JSON.stringify({ success: true, message: "Usuario existente asignado como agente" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } else {
          // Create new user with temporary password
          const tempPassword = crypto.randomUUID().slice(0, 16) + "Aa1!";
          const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: full_name || "" },
          });
          if (createError) throw createError;

          // Assign agency and role
          await adminClient.from("profiles").update({ agency_id: callerAgencyId }).eq("user_id", newUser.user.id);
          await adminClient.from("user_roles").insert({ user_id: newUser.user.id, role: "agente" });

          return new Response(JSON.stringify({ 
            success: true, 
            message: "Agente creado. Contraseña temporal: " + tempPassword,
            temp_password: tempPassword 
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      case "remove_agent": {
        const { user_id } = params;
        if (!user_id) throw new Error("user_id required");

        // Verify agent belongs to this agency
        const { data: agentProfile } = await adminClient
          .from("profiles")
          .select("agency_id")
          .eq("user_id", user_id)
          .single();

        if (agentProfile?.agency_id !== callerAgencyId) {
          throw new Error("Este agente no pertenece a tu agencia");
        }

        // Remove from agency (don't delete user, just unassign)
        await adminClient.from("profiles").update({ agency_id: null }).eq("user_id", user_id);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "update_agent_permissions": {
        const { user_id, permission_names } = params;
        if (!user_id || !permission_names) throw new Error("user_id and permission_names required");

        // Verify agent belongs to this agency
        const { data: agentProfile } = await adminClient
          .from("profiles")
          .select("agency_id")
          .eq("user_id", user_id)
          .single();

        if (agentProfile?.agency_id !== callerAgencyId) {
          throw new Error("Este agente no pertenece a tu agencia");
        }

        // Get permission IDs
        const { data: perms } = await adminClient
          .from("permissions")
          .select("id, name")
          .in("name", permission_names);

        // Delete existing and insert new
        await adminClient.from("user_permissions").delete().eq("user_id", user_id);
        if (perms && perms.length > 0) {
          await adminClient.from("user_permissions").insert(
            perms.map(p => ({ user_id, permission_id: p.id }))
          );
        }

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: corsHeaders });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
