import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, FileSignature, Sparkles, Loader2, Download, FileDown } from "lucide-react";
import { toast } from "sonner";
import { useInmoAI } from "@/hooks/useInmoAI";
import { useAgencyProfile } from "@/hooks/useAgencyProfile";
import { exportContratoPdf } from "@/lib/exportContratoPdf";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";
import { useToolHistory } from "@/hooks/useToolHistory";
import { ToolHistoryPanel } from "@/components/ToolHistoryPanel";
import { useTranslation } from "react-i18next";

const contractTypeKeys = ["compraventa", "alquiler", "arras", "reserva", "opcion_compra", "cesion", "permuta", "exclusividad", "administracion", "alquiler_temporal"] as const;

const ContratosPage = () => {
  const { t } = useTranslation();
  const [tipoContrato, setTipoContrato] = useState("");
  const [partes, setPartes] = useState("");
  const [inmueble, setInmueble] = useState("");
  const [condiciones, setCondiciones] = useState("");
  const [detallesAdicionales, setDetallesAdicionales] = useState("");
  const [resultado, setResultado] = useState<{ contrato: string; clausulas_clave: string[]; base_legal: string[]; advertencias: string[]; resumen: string; } | null>(null);
  const { generate, loading } = useInmoAI();
  const { profile } = useAgencyProfile();
  const { history, loading: histLoading, saveResult, deleteEntry } = useToolHistory("contratos");

  const generar = async () => {
    if (!tipoContrato || !partes.trim() || !inmueble.trim()) { toast.error(t("contratos.errorMinFields")); return; }
    const result = await generate("contratos", { tipo: tipoContrato, partes, inmueble, condiciones, detalles: detallesAdicionales });
    if (result) {
      setResultado(result);
      const label = t(`contratos.types.${tipoContrato}`);
      await saveResult(label, { tipo: tipoContrato, partes, inmueble, condiciones, detalles: detallesAdicionales }, result);
    }
  };

  const copiar = (text: string, label: string) => { navigator.clipboard.writeText(text); toast.success(t("common.copySuccess", { item: label })); };

  const descargarTxt = () => {
    if (!resultado) return;
    const blob = new Blob([resultado.contrato], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `contrato_${tipoContrato}_${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const descargarPdf = async () => {
    if (!resultado) return;
    await exportContratoPdf(resultado, { tipo: tipoContrato, partes, inmueble, condiciones }, profile || undefined);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="contratos" />
      <div className="flex items-center gap-2 mb-6">
        <FileSignature className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">{t("contratos.title")}</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">{t("contratos.contractData")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t("contratos.contractType")}</Label>
                <Select value={tipoContrato} onValueChange={setTipoContrato}>
                  <SelectTrigger><SelectValue placeholder={t("contratos.contractTypePlaceholder")} /></SelectTrigger>
                  <SelectContent>{contractTypeKeys.map((k) => (<SelectItem key={k} value={k}>{t(`contratos.types.${k}`)}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><Label>{t("contratos.parties")}</Label><Textarea placeholder={t("contratos.partiesPlaceholder")} value={partes} onChange={(e) => setPartes(e.target.value)} rows={3} /></div>
              <div><Label>{t("contratos.propertyDescription")}</Label><Textarea placeholder={t("contratos.propertyDescPlaceholder")} value={inmueble} onChange={(e) => setInmueble(e.target.value)} rows={3} /></div>
              <div><Label>{t("contratos.economicConditions")}</Label><Input placeholder={t("contratos.economicPlaceholder")} value={condiciones} onChange={(e) => setCondiciones(e.target.value)} /></div>
              <div><Label>{t("contratos.additionalDetails")}</Label><Textarea placeholder={t("contratos.additionalPlaceholder")} value={detallesAdicionales} onChange={(e) => setDetallesAdicionales(e.target.value)} rows={2} /></div>
              <Button onClick={generar} className="w-full" disabled={loading || !tipoContrato}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("contratos.generatingButton")}</> : t("contratos.generateButton")}
              </Button>
            </CardContent>
          </Card>
          <ToolHistoryPanel history={history} loading={histLoading} onLoad={(e) => setResultado(e.result_data)} onDelete={deleteEntry} />
        </div>
        <div className="space-y-4">
          {resultado ? (
            <>
              <Card className="glass-card border-primary/20">
                <CardHeader className="pb-2"><CardTitle className="text-sm">{t("contratos.summary")}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{resultado.resumen}</p></CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">{t("contratos.generatedContract")}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => copiar(resultado.contrato, t("contratos.title"))} className="h-8 w-8"><Copy className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={descargarTxt} className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={descargarPdf} className="h-8 w-8"><FileDown className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardHeader>
                <CardContent><div className="max-h-[400px] overflow-y-auto"><p className="text-sm whitespace-pre-line leading-relaxed">{resultado.contrato}</p></div></CardContent>
              </Card>
              {resultado.clausulas_clave?.length > 0 && (
                <Card className="glass-card">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">{t("contratos.keyClauses")}</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-1.5">{resultado.clausulas_clave.map((c, i) => (<li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{c}</li>))}</ul></CardContent>
                </Card>
              )}
              {resultado.base_legal?.length > 0 && (
                <Card className="glass-card border-blue-500/20">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">{t("contratos.legalBasis")}</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-1.5">{resultado.base_legal.map((b, i) => (<li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-blue-500 mt-0.5">§</span>{b}</li>))}</ul></CardContent>
                </Card>
              )}
              {resultado.advertencias?.length > 0 && (
                <Card className="glass-card border-amber-500/20">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">{t("contratos.warnings")}</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-1.5">{resultado.advertencias.map((a, i) => (<li key={i} className="text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2"><span className="mt-0.5">!</span>{a}</li>))}</ul></CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground">
              <FileSignature className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t("contratos.emptyDesc")}</p>
              <p className="text-xs mt-2 text-muted-foreground/60">{t("contratos.emptyLegalRefs")}</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContratosPage;
