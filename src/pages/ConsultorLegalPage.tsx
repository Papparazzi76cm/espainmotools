import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Scale, Sparkles, Loader2, Send, Info } from "lucide-react";
import { useInmoAI } from "@/hooks/useInmoAI";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";
import { useToolHistory } from "@/hooks/useToolHistory";
import { ToolHistoryPanel } from "@/components/ToolHistoryPanel";
import { useTranslation } from "react-i18next";
import { useCountry } from "@/contexts/CountryContext";

const ConsultorLegalPage = () => {
  const { t } = useTranslation();
  const { selectedCountry } = useCountry();
  const countryName = selectedCountry?.country_name || "España";
  const legislation = (selectedCountry?.legislation || {}) as Record<string, string>;
  const legalRefs = selectedCountry?.legal_references || "";
  const [consulta, setConsulta] = useState("");
  const [resultado, setResultado] = useState<{ respuesta: string; resumen: string; recomendaciones: string[] } | null>(null);
  const { generate, loading } = useInmoAI();
  const { history, loading: histLoading, saveResult, deleteEntry } = useToolHistory("consultor-legal");

  const consultar = async () => {
    if (!consulta.trim()) return;
    const result = await generate("consultor-legal", { consulta });
    if (result) {
      const res = { respuesta: result.respuesta || "", resumen: result.resumen || "", recomendaciones: result.recomendaciones || [] };
      setResultado(res);
      await saveResult(consulta.slice(0, 60), { consulta }, res);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="consultor-legal" />
      <div className="flex items-center gap-2 mb-6">
        <Scale className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">{t("consultorLegal.title")}</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Country legal context banner */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-2 mb-2">
              <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs font-medium">{t("consultorLegal.legalFramework", { country: countryName, defaultValue: `Marco jurídico de ${countryName}` })}</p>
            </div>
            <div className="space-y-0.5">
              {Object.values(legislation).slice(0, 5).map((law, i) => (
                <p key={i} className="text-[11px] text-muted-foreground">• {law}</p>
              ))}
              {legalRefs && <p className="text-[10px] text-muted-foreground/60 mt-1 italic">{legalRefs}</p>}
            </div>
          </div>
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">{t("consultorLegal.yourQuery")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Textarea placeholder={t("consultorLegal.queryPlaceholder")} value={consulta} onChange={(e) => setConsulta(e.target.value)} rows={8} />
              <Button onClick={consultar} className="w-full" disabled={loading || !consulta.trim()}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("consultorLegal.consultingButton")}</> : <><Send className="h-4 w-4 mr-2" /> {t("consultorLegal.consultButton")}</>}
              </Button>
              <p className="text-[11px] text-muted-foreground">{t("consultorLegal.disclaimer")}</p>
            </CardContent>
          </Card>
          <ToolHistoryPanel history={history} loading={histLoading} onLoad={(e) => setResultado(e.result_data)} onDelete={deleteEntry} />
        </div>
        <div className="space-y-4">
          {resultado ? (
            <>
              <Card className="glass-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm">{t("consultorLegal.response")}</CardTitle></CardHeader>
                <CardContent><p className="text-sm whitespace-pre-line leading-relaxed">{resultado.respuesta}</p></CardContent>
              </Card>
              {resultado.resumen && (
                <Card className="glass-card">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">{t("consultorLegal.summary")}</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground whitespace-pre-line">{resultado.resumen}</p></CardContent>
                </Card>
              )}
              {resultado.recomendaciones.length > 0 && (
                <Card className="glass-card border-primary/20">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">{t("consultorLegal.recommendations")}</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-2">{resultado.recomendaciones.map((r, i) => (<li key={i} className="text-sm flex gap-2"><span className="text-primary">→</span> {r}</li>))}</ul></CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Scale className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{t("consultorLegal.emptyDesc")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultorLegalPage;
