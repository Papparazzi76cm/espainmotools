import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTrialContext } from "@/contexts/TrialContext";
import { useUserRole } from "@/hooks/useUserRole";
import { TESTER_DAILY_LIMITS } from "@/hooks/useTrial";

export function useInmoAI() {
  const [loading, setLoading] = useState(false);
  const { canUseTool, logUsage, trial } = useTrialContext();
  const { role, isTester } = useUserRole();

  const generate = async (tool: string, data: Record<string, string>, images?: string[]) => {
    // Check limits based on role
    const check = canUseTool(tool, 1, role);
    if (!check.allowed) {
      if (isTester) {
        toast.error(`Has alcanzado el límite diario de Home Staging (${check.used}/${check.max}).`);
      } else if (trial.isTrialExpired) {
        toast.error("Tu período de prueba ha expirado. Activa tu plan para seguir usando las herramientas.");
      } else if (!trial.isPaid) {
        toast.error(`Has alcanzado el límite ${check.limitType === "daily" ? "diario" : "total"} para esta herramienta (${check.used}/${check.max}).`);
      }
      return null;
    }

    setLoading(true);
    try {
      const body: Record<string, any> = { tool, data };
      if (images && images.length > 0) {
        body.images = images;
      }

      const { data: result, error } = await supabase.functions.invoke("inmo-ai", {
        body,
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      // Log usage for trial users always, and for testers on home-staging
      const shouldLog = !trial.isPaid || (isTester && TESTER_DAILY_LIMITS[tool]);
      if (shouldLog) {
        await logUsage(tool);
      }

      return result.result;
    } catch (e: any) {
      toast.error(e.message || "Error al generar con IA");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading };
}
