import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TrialLimits {
  "home-staging": { type: "total"; max: 30 };
  "consultor-legal": { type: "daily"; max: 3 };
  descripciones: { type: "daily"; max: 3 };
  informes: { type: "daily"; max: 3 };
  anuncios: { type: "daily"; max: 3 };
  entorno: { type: "daily"; max: 3 };
  guiones: { type: "daily"; max: 3 };
  captacion: { type: "daily"; max: 3 };
  costes: { type: "daily"; max: 10 };
  rentabilidad: { type: "daily"; max: 10 };
  contratos: { type: "daily"; max: 3 };
  roleplay: { type: "daily"; max: 3 };
}

export const TRIAL_LIMITS: TrialLimits = {
  "home-staging": { type: "total", max: 30 },
  "consultor-legal": { type: "daily", max: 3 },
  descripciones: { type: "daily", max: 3 },
  informes: { type: "daily", max: 3 },
  anuncios: { type: "daily", max: 3 },
  entorno: { type: "daily", max: 3 },
  guiones: { type: "daily", max: 3 },
  captacion: { type: "daily", max: 3 },
  costes: { type: "daily", max: 10 },
  rentabilidad: { type: "daily", max: 10 },
  contratos: { type: "daily", max: 3 },
  roleplay: { type: "daily", max: 3 },
};

// Monthly limits for paid users (only home-staging has one)
export const PAID_MONTHLY_LIMITS: Record<string, number> = {
  "home-staging": 150,
};

interface TrialData {
  trialStart: Date | null;
  trialEnd: Date | null;
  isPaid: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
}

interface UsageData {
  todayUsage: Record<string, number>;
  totalUsage: Record<string, number>;
  monthlyUsage: Record<string, number>;
}

// Daily limits for tester role (only home-staging)
export const TESTER_DAILY_LIMITS: Record<string, number> = {
  "home-staging": 10,
};

export function useTrial() {
  const { user } = useAuth();
  const [trial, setTrial] = useState<TrialData>({
    trialStart: null,
    trialEnd: null,
    isPaid: false,
    isTrialActive: false,
    isTrialExpired: false,
    daysRemaining: 0,
    hoursRemaining: 0,
    minutesRemaining: 0,
    secondsRemaining: 0,
  });
  const [usage, setUsage] = useState<UsageData>({ todayUsage: {}, totalUsage: {}, monthlyUsage: {} });
  const [loading, setLoading] = useState(true);

  const fetchTrial = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_trials")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      const end = new Date(data.trial_end);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      const isActive = diff > 0 && !data.is_paid;

      setTrial({
        trialStart: new Date(data.trial_start),
        trialEnd: end,
        isPaid: data.is_paid,
        isTrialActive: isActive,
        isTrialExpired: diff <= 0 && !data.is_paid,
        daysRemaining: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
        hoursRemaining: Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
        minutesRemaining: Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))),
        secondsRemaining: Math.max(0, Math.floor((diff % (1000 * 60)) / 1000)),
      });
    }
    setLoading(false);
  }, [user]);

  const fetchUsage = useCallback(async () => {
    if (!user) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Month start (1st of current month)
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Today's usage
    const { data: todayData } = await supabase
      .from("usage_logs")
      .select("tool_id")
      .eq("user_id", user.id)
      .gte("used_at", todayStart.toISOString());

    const todayUsage: Record<string, number> = {};
    todayData?.forEach((log) => {
      todayUsage[log.tool_id] = (todayUsage[log.tool_id] || 0) + 1;
    });

    // Monthly usage (for paid home-staging limit)
    const { data: monthlyData } = await supabase
      .from("usage_logs")
      .select("tool_id")
      .eq("user_id", user.id)
      .gte("used_at", monthStart.toISOString());

    const monthlyUsage: Record<string, number> = {};
    monthlyData?.forEach((log) => {
      monthlyUsage[log.tool_id] = (monthlyUsage[log.tool_id] || 0) + 1;
    });

    // Total usage (for trial limits)
    const { data: totalData } = await supabase
      .from("usage_logs")
      .select("tool_id")
      .eq("user_id", user.id);

    const totalUsage: Record<string, number> = {};
    totalData?.forEach((log) => {
      totalUsage[log.tool_id] = (totalUsage[log.tool_id] || 0) + 1;
    });

    setUsage({ todayUsage, totalUsage, monthlyUsage });
  }, [user]);

  // Countdown timer
  useEffect(() => {
    if (!trial.trialEnd || trial.isPaid) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = trial.trialEnd!.getTime() - now.getTime();

      if (diff <= 0) {
        setTrial((prev) => ({ ...prev, isTrialActive: false, isTrialExpired: true, daysRemaining: 0, hoursRemaining: 0, minutesRemaining: 0, secondsRemaining: 0 }));
        clearInterval(interval);
        return;
      }

      setTrial((prev) => ({
        ...prev,
        daysRemaining: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hoursRemaining: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutesRemaining: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secondsRemaining: Math.floor((diff % (1000 * 60)) / 1000),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [trial.trialEnd, trial.isPaid]);

  useEffect(() => {
    fetchTrial();
    fetchUsage();
  }, [fetchTrial, fetchUsage]);

  const canUseTool = (toolId: string, cost: number = 1): { allowed: boolean; used: number; max: number; limitType: string } => {
    // Paid users: only home-staging has a monthly limit
    if (trial.isPaid) {
      const monthlyMax = PAID_MONTHLY_LIMITS[toolId];
      if (monthlyMax) {
        const used = usage.monthlyUsage[toolId] || 0;
        return { allowed: used + cost <= monthlyMax, used, max: monthlyMax, limitType: "monthly" };
      }
      return { allowed: true, used: 0, max: Infinity, limitType: "none" };
    }

    // Trial expired
    if (trial.isTrialExpired) return { allowed: false, used: 0, max: 0, limitType: "expired" };

    // Trial limits
    const limit = TRIAL_LIMITS[toolId as keyof TrialLimits];
    if (!limit) return { allowed: true, used: 0, max: Infinity, limitType: "none" };

    if (limit.type === "daily") {
      const used = usage.todayUsage[toolId] || 0;
      return { allowed: used + cost <= limit.max, used, max: limit.max, limitType: "daily" };
    } else {
      const used = usage.totalUsage[toolId] || 0;
      return { allowed: used + cost <= limit.max, used, max: limit.max, limitType: "total" };
    }
  };

  const logUsage = async (toolId: string) => {
    if (!user) return false;

    const check = canUseTool(toolId);
    if (!check.allowed) return false;

    await supabase.from("usage_logs").insert({
      user_id: user.id,
      tool_id: toolId,
    });

    await fetchUsage();
    return true;
  };

  return { trial, usage, loading, canUseTool, logUsage, refetch: fetchUsage };
}
