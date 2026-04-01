import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Commission {
  id: string;
  affiliate_id: string;
  user_id: string;
  payment_amount: number;
  commission_percentage: number;
  commission_amount: number;
  status: string;
  created_at: string;
  approved_at: string | null;
  paid_at: string | null;
  payment_reference: string | null;
  notes: string | null;
}

export interface CommissionSummary {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  count: number;
}

export interface AffiliateSettings {
  id: string;
  commission_percentage: number;
  min_payout: number;
  commission_type: string;
  updated_at: string;
}

async function callCommissions(action: string, params: Record<string, unknown> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await supabase.functions.invoke("affiliate-commissions", {
    body: { action, ...params },
  });

  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export function useCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary>({ total: 0, pending: 0, approved: 0, paid: 0, count: 0 });
  const [settings, setSettings] = useState<AffiliateSettings | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCommissions = useCallback(async (filters?: { affiliate_id?: string; status?: string }) => {
    setLoading(true);
    try {
      const data = await callCommissions("list_commissions", filters || {});
      setCommissions(data.commissions || []);
    } catch (e: any) {
      console.error("Error fetching commissions:", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async (affiliate_id?: string) => {
    try {
      const data = await callCommissions("commission_summary", affiliate_id ? { affiliate_id } : {});
      setSummary(data);
    } catch (e: any) {
      console.error("Error fetching summary:", e.message);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await callCommissions("get_settings");
      setSettings(data);
    } catch (e: any) {
      console.error("Error fetching settings:", e.message);
    }
  }, []);

  const updateCommissionStatus = async (commission_id: string, status: string, extras?: { payment_reference?: string; notes?: string }) => {
    await callCommissions("update_commission_status", { commission_id, status, ...extras });
  };

  const bulkUpdateStatus = async (commission_ids: string[], status: string) => {
    await callCommissions("bulk_update_status", { commission_ids, status });
  };

  const updateSettings = async (data: Partial<AffiliateSettings>) => {
    await callCommissions("update_settings", data);
  };

  const generateCommission = async (user_id: string, payment_amount: number) => {
    return await callCommissions("generate_commission", { user_id, payment_amount });
  };

  return {
    commissions, summary, settings, loading,
    fetchCommissions, fetchSummary, fetchSettings,
    updateCommissionStatus, bulkUpdateStatus, updateSettings, generateCommission,
  };
}
