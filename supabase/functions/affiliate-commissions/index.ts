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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUserId)
      .maybeSingle();

    const isAdmin = roleData?.role === "admin";
    const { action, ...params } = await req.json();

    const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

    switch (action) {
      // ─── Generate commission (called when a payment occurs) ───
      case "generate_commission": {
        if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: jsonHeaders });

        const { user_id, payment_amount } = params;
        if (!user_id || !payment_amount) throw new Error("user_id and payment_amount required");

        // Check if user has a referred_by affiliate
        const { data: profile } = await adminClient
          .from("profiles")
          .select("referred_by, user_id")
          .eq("user_id", user_id)
          .single();

        if (!profile?.referred_by) {
          return new Response(JSON.stringify({ skipped: true, reason: "No affiliate referral" }), { headers: jsonHeaders });
        }

        // Validate affiliate is active
        const { data: affiliate } = await adminClient
          .from("affiliates")
          .select("user_id, affiliate_id, is_active")
          .eq("affiliate_id", profile.referred_by)
          .single();

        if (!affiliate || !affiliate.is_active) {
          return new Response(JSON.stringify({ skipped: true, reason: "Affiliate inactive or not found" }), { headers: jsonHeaders });
        }

        // Anti-fraud: no self-referral
        if (affiliate.user_id === user_id) {
          return new Response(JSON.stringify({ skipped: true, reason: "Self-referral blocked" }), { headers: jsonHeaders });
        }

        // Get settings
        const { data: settings } = await adminClient
          .from("affiliate_settings")
          .select("*")
          .limit(1)
          .single();

        const percentage = settings?.commission_percentage || 15;
        const commissionType = settings?.commission_type || "first_only";

        // Check if first_only and already has a commission
        if (commissionType === "first_only") {
          const { data: existing } = await adminClient
            .from("commissions")
            .select("id")
            .eq("affiliate_id", affiliate.affiliate_id)
            .eq("user_id", user_id)
            .limit(1)
            .maybeSingle();

          if (existing) {
            return new Response(JSON.stringify({ skipped: true, reason: "Commission already generated (first_only mode)" }), { headers: jsonHeaders });
          }
        }

        const amount = parseFloat(payment_amount);
        const commissionAmount = Math.round(amount * (percentage / 100) * 100) / 100;

        const { data: commission, error } = await adminClient
          .from("commissions")
          .insert({
            affiliate_id: affiliate.affiliate_id,
            user_id,
            payment_amount: amount,
            commission_percentage: percentage,
            commission_amount: commissionAmount,
            status: "pending",
          })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, commission }), { headers: jsonHeaders });
      }

      // ─── List commissions (admin: all, affiliate: own) ───
      case "list_commissions": {
        const { affiliate_id, status: filterStatus, limit: queryLimit } = params;

        let query = adminClient
          .from("commissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (!isAdmin) {
          // Get caller's affiliate_id
          const { data: aff } = await adminClient
            .from("affiliates")
            .select("affiliate_id")
            .eq("user_id", callerUserId)
            .eq("is_active", true)
            .maybeSingle();

          if (!aff) {
            return new Response(JSON.stringify({ commissions: [] }), { headers: jsonHeaders });
          }
          query = query.eq("affiliate_id", aff.affiliate_id);
        } else {
          if (affiliate_id) query = query.eq("affiliate_id", affiliate_id);
          if (filterStatus && filterStatus !== "all") query = query.eq("status", filterStatus);
        }

        if (queryLimit) query = query.limit(queryLimit);

        const { data, error } = await query;
        if (error) throw error;
        return new Response(JSON.stringify({ commissions: data }), { headers: jsonHeaders });
      }

      // ─── Get commission summary (affiliate or admin) ───
      case "commission_summary": {
        const { affiliate_id: targetAffId } = params;
        let affId = targetAffId;

        if (!isAdmin) {
          const { data: aff } = await adminClient
            .from("affiliates")
            .select("affiliate_id")
            .eq("user_id", callerUserId)
            .eq("is_active", true)
            .maybeSingle();
          if (!aff) return new Response(JSON.stringify({ total: 0, pending: 0, approved: 0, paid: 0, count: 0 }), { headers: jsonHeaders });
          affId = aff.affiliate_id;
        }

        let query = adminClient.from("commissions").select("commission_amount, status");
        if (affId) query = query.eq("affiliate_id", affId);

        const { data, error } = await query;
        if (error) throw error;

        const summary = {
          total: 0, pending: 0, approved: 0, paid: 0, count: data?.length || 0,
        };
        data?.forEach((c: any) => {
          const amt = parseFloat(c.commission_amount);
          summary.total += amt;
          if (c.status === "pending") summary.pending += amt;
          else if (c.status === "approved") summary.approved += amt;
          else if (c.status === "paid") summary.paid += amt;
        });

        // Round
        summary.total = Math.round(summary.total * 100) / 100;
        summary.pending = Math.round(summary.pending * 100) / 100;
        summary.approved = Math.round(summary.approved * 100) / 100;
        summary.paid = Math.round(summary.paid * 100) / 100;

        return new Response(JSON.stringify(summary), { headers: jsonHeaders });
      }

      // ─── Update commission status (admin only) ───
      case "update_commission_status": {
        if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: jsonHeaders });

        const { commission_id, status: newStatus, payment_reference, notes } = params;
        if (!commission_id || !newStatus) throw new Error("commission_id and status required");

        const updateData: Record<string, any> = { status: newStatus };
        if (newStatus === "approved") updateData.approved_at = new Date().toISOString();
        if (newStatus === "paid") {
          updateData.paid_at = new Date().toISOString();
          if (payment_reference) updateData.payment_reference = payment_reference;
        }
        if (notes) updateData.notes = notes;

        const { error } = await adminClient
          .from("commissions")
          .update(updateData)
          .eq("id", commission_id);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
      }

      // ─── Bulk update status (admin only) ───
      case "bulk_update_status": {
        if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: jsonHeaders });

        const { commission_ids, status: bulkStatus } = params;
        if (!commission_ids?.length || !bulkStatus) throw new Error("commission_ids and status required");

        const updateData: Record<string, any> = { status: bulkStatus };
        if (bulkStatus === "approved") updateData.approved_at = new Date().toISOString();
        if (bulkStatus === "paid") updateData.paid_at = new Date().toISOString();

        const { error } = await adminClient
          .from("commissions")
          .update(updateData)
          .in("id", commission_ids);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
      }

      // ─── Get/update affiliate settings (admin) ───
      case "get_settings": {
        const { data, error } = await adminClient
          .from("affiliate_settings")
          .select("*")
          .limit(1)
          .single();
        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: jsonHeaders });
      }

      case "update_settings": {
        if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: jsonHeaders });

        const { commission_percentage, min_payout, commission_type } = params;
        const { data: current } = await adminClient
          .from("affiliate_settings")
          .select("id")
          .limit(1)
          .single();

        if (!current) throw new Error("Settings not found");

        const { error } = await adminClient
          .from("affiliate_settings")
          .update({
            commission_percentage: commission_percentage ?? 15,
            min_payout: min_payout ?? 50,
            commission_type: commission_type ?? "first_only",
            updated_at: new Date().toISOString(),
            updated_by: callerUserId,
          })
          .eq("id", current.id);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: jsonHeaders });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
