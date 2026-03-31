import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTrialContext } from "@/contexts/TrialContext";

export function useInmoAI() {
  const [loading, setLoading] = useState(false);
  const { canUseTool, logUsage, trial } = useTrialContext();

  const generate = async (tool: string, data: Record<string, string>, images?: string[]) => {
    // Check trial limits
    if (!trial.isPaid) {
      const check = canUseTool(tool);
      if (!check.allowed) {
        if (trial.isTrialExpired) {
          toast.error("Tu período de prueba ha expirado. Activa tu plan para seguir usando las herramientas.");
        } else {
          toast.error(`Has alcanzado el límite ${check.limitType === "daily" ? "diario" : "total"} para esta herramienta (${check.used}/${check.max}).`);
        }
        return null;
      }
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

      // Log usage after successful generation
      if (!trial.isPaid) {
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
