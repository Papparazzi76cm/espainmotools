import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, UserPlus, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useInmoAI } from "@/hooks/useInmoAI";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";
import { useToolHistory } from "@/hooks/useToolHistory";
import { ToolHistoryPanel } from "@/components/ToolHistoryPanel";
import { useTranslation } from "react-i18next";

const CaptacionPage = () => {
  const { t } = useTranslation();
  const [zona, setZona] = useState("");
  const [tipo, setTipo] = useState("");
  const [contexto, setContexto] = useState("");
  const [resultado, setResultado] = useState<{
    script_llamada: string; script_puerta: string; argumentario: string;
    objeciones: { objecion: string; respuesta: string }[];
  } | null>(null);
  const { generate, loading } = useInmoAI();
  const { history, loading: histLoading, saveResult, deleteEntry } = useToolHistory("captacion");

  const generar = async () => {
    if (!zona.trim()) return;
    const result = await generate("captacion", { zona, tipo, contexto });
    if (result) { setResultado(result); await saveResult(zona, { zona, tipo, contexto }, result); }
  };

  const copiar = (text: string, label: string) => { navigator.clipboard.writeText(text); toast.success(t("common.copySuccess", { item: label })); };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="captacion" />
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">{t("captacion.title")}</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">{t("captacion.context")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>{t("captacion.targetZone")}</Label><Input placeholder={t("captacion.targetZonePlaceholder")} value={zona} onChange={(e) => setZona(e.target.value)} /></div>
              <div><Label>{t("captacion.propertyType")}</Label><Input placeholder={t("captacion.propertyTypePlaceholder")} value={tipo} onChange={(e) => setTipo(e.target.value)} /></div>
              <div><Label>{t("captacion.additionalContext")}</Label><Textarea placeholder={t("captacion.additionalContextPlaceholder")} value={contexto} onChange={(e) => setContexto(e.target.value)} rows={3} /></div>
              <Button onClick={generar} className="w-full" disabled={loading || !zona.trim()}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("common.generating")}</> : t("captacion.generateButton")}
              </Button>
            </CardContent>
          </Card>
          <ToolHistoryPanel history={history} loading={histLoading} onLoad={(e) => setResultado(e.result_data)} onDelete={deleteEntry} />
        </div>
        <div className="space-y-4">
          {resultado ? (
            <>
              <ScriptCard title={t("captacion.callScript")} text={resultado.script_llamada} onCopy={() => copiar(resultado.script_llamada, "Script")} />
              <ScriptCard title={t("captacion.doorScript")} text={resultado.script_puerta} onCopy={() => copiar(resultado.script_puerta, "Script")} />
              <ScriptCard title={t("captacion.talkingPoints")} text={resultado.argumentario} onCopy={() => copiar(resultado.argumentario, "Script")} />
              {resultado.objeciones?.length > 0 && (
                <Card className="glass-card border-primary/20">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">{t("captacion.objectionHandling")}</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {resultado.objeciones.map((o, i) => (
                      <div key={i} className="text-sm">
                        <p className="font-medium text-destructive">"{o.objecion}"</p>
                        <p className="text-muted-foreground mt-1">→ {o.respuesta}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground">
              <UserPlus className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">{t("captacion.emptyDesc")}</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
};

function ScriptCard({ title, text, onCopy }: { title: string; text: string; onCopy: () => void }) {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCopy} className="h-8 w-8"><Copy className="h-3.5 w-3.5" /></Button>
      </CardHeader>
      <CardContent><p className="text-sm whitespace-pre-line leading-relaxed">{text}</p></CardContent>
    </Card>
  );
}

export default CaptacionPage;
