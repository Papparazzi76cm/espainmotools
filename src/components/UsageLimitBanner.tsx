import { useTrialContext } from "@/contexts/TrialContext";
import { TRIAL_LIMITS, PAID_MONTHLY_LIMITS, TESTER_DAILY_LIMITS, type TrialLimits } from "@/hooks/useTrial";
import { useUserRole } from "@/hooks/useUserRole";
import { Shield, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsageLimitBannerProps {
  toolId: string;
}

export function UsageLimitBanner({ toolId }: UsageLimitBannerProps) {
  const { trial, canUseTool } = useTrialContext();
  const { role, isTester } = useUserRole();

  // Tester: only show banner for home-staging
  if (isTester) {
    const testerMax = TESTER_DAILY_LIMITS[toolId];
    if (!testerMax) return null;

    const { used, max } = canUseTool(toolId, 1, role);
    const percentage = max > 0 ? (used / max) * 100 : 0;
    const isNearLimit = percentage >= 66;

    return (
      <div className={`mb-4 p-3 rounded-xl border flex items-center justify-between ${isNearLimit ? "bg-warning/10 border-warning/30" : "bg-primary/5 border-primary/20"}`}>
        <div className="flex items-center gap-3">
          <Shield className={`h-4 w-4 ${isNearLimit ? "text-warning" : "text-primary"}`} />
          <p className="text-xs font-medium text-foreground">
            Tester — {used}/{max} usos hoy
          </p>
        </div>
        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${percentage >= 100 ? "bg-destructive" : isNearLimit ? "bg-warning" : "bg-primary"}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  }

  // For paid users, show banner only if tool has monthly limit
  if (trial.isPaid) {
    const monthlyMax = PAID_MONTHLY_LIMITS[toolId];
    if (!monthlyMax) return null;

    const { used, max } = canUseTool(toolId);
    const percentage = max > 0 ? (used / max) * 100 : 0;
    const isNearLimit = percentage >= 66;

    return (
      <div className={`mb-4 p-3 rounded-xl border flex items-center justify-between ${isNearLimit ? "bg-warning/10 border-warning/30" : "bg-primary/5 border-primary/20"}`}>
        <div className="flex items-center gap-3">
          <Shield className={`h-4 w-4 ${isNearLimit ? "text-warning" : "text-primary"}`} />
          <p className="text-xs font-medium text-foreground">
            {used}/{max} usos este mes
          </p>
        </div>
        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${percentage >= 100 ? "bg-destructive" : isNearLimit ? "bg-warning" : "bg-primary"}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  }

  const limit = TRIAL_LIMITS[toolId as keyof TrialLimits];
  if (!limit) return null;

  const { allowed, used, max, limitType } = canUseTool(toolId);

  if (trial.isTrialExpired) {
    return (
      <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Prueba expirada</p>
            <p className="text-xs text-muted-foreground">Activa tu plan para seguir usando esta herramienta.</p>
          </div>
        </div>
        <Button size="sm" className="bg-gradient-to-r from-blue-600 via-primary to-cyan-500 border-0">
          <Crown className="h-3.5 w-3.5 mr-1" />
          Activar
        </Button>
      </div>
    );
  }

  const percentage = max > 0 ? (used / max) * 100 : 0;
  const isNearLimit = percentage >= 66;

  return (
    <div className={`mb-4 p-3 rounded-xl border flex items-center justify-between ${isNearLimit ? "bg-warning/10 border-warning/30" : "bg-primary/5 border-primary/20"}`}>
      <div className="flex items-center gap-3">
        <Shield className={`h-4 w-4 ${isNearLimit ? "text-warning" : "text-primary"}`} />
        <div>
          <p className="text-xs font-medium text-foreground">
            Modo Prueba — {used}/{max} usos {limitType === "daily" ? "hoy" : "totales"}
          </p>
          {!allowed && (
            <p className="text-[10px] text-destructive">Límite alcanzado. {limitType === "daily" ? "Volvé mañana o" : ""} pasá a Premium.</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${percentage >= 100 ? "bg-destructive" : isNearLimit ? "bg-warning" : "bg-primary"}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {!allowed && (
          <Button size="sm" variant="outline" className="text-[10px] h-7 border-primary/30 text-primary">
            <Crown className="h-3 w-3 mr-1" /> Premium
          </Button>
        )}
      </div>
    </div>
  );
}
