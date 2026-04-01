import { useTranslation } from "react-i18next";
import { useTrialContext } from "@/contexts/TrialContext";
import { Clock, Crown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrialCountdown() {
  const { t } = useTranslation();
  const { trial, loading } = useTrialContext();

  if (loading || trial.isPaid) return null;

  const isUrgent = trial.daysRemaining <= 7;
  const isExpired = trial.isTrialExpired;

  if (isExpired) {
    return (
      <div className="mx-3 mb-3 p-3 rounded-xl bg-destructive/10 border border-destructive/30">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-xs font-semibold text-destructive">{t("trialCountdown.expired")}</span>
        </div>
        <p className="text-[10px] text-muted-foreground mb-2">{t("trialCountdown.expiredDesc")}</p>
        <Button size="sm" className="w-full text-xs h-8 bg-gradient-to-r from-blue-600 via-primary to-cyan-500 border-0 shadow-sm">
          <Crown className="h-3 w-3 mr-1" /> {t("trialCountdown.activatePlan")}
        </Button>
      </div>
    );
  }

  return (
    <div className={`mx-3 mb-3 p-3 rounded-xl border ${isUrgent ? "bg-warning/10 border-warning/30" : "bg-primary/5 border-primary/20"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Clock className={`h-3.5 w-3.5 ${isUrgent ? "text-warning" : "text-primary"}`} />
        <span className={`text-[10px] font-semibold ${isUrgent ? "text-warning" : "text-primary"}`}>{t("trialCountdown.trialMode")}</span>
      </div>
      <div className="grid grid-cols-4 gap-1 mb-2">
        {[
          { value: trial.daysRemaining, label: t("trialCountdown.days") },
          { value: trial.hoursRemaining, label: t("trialCountdown.hrs") },
          { value: trial.minutesRemaining, label: t("trialCountdown.min") },
          { value: trial.secondsRemaining, label: t("trialCountdown.sec") },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <div className={`text-sm font-bold tabular-nums ${isUrgent ? "text-warning" : "text-primary"}`}>{String(item.value).padStart(2, "0")}</div>
            <div className="text-[9px] text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>
      <Button size="sm" variant="outline" className="w-full text-[10px] h-7 border-primary/30 text-primary hover:bg-primary/10">
        <Crown className="h-3 w-3 mr-1" /> {t("trialCountdown.goPremium")}
      </Button>
    </div>
  );
}
