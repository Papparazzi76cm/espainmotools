import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useCountryCurrency } from "@/hooks/useCountryCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, Sparkles, Loader2, Copy, Download, Printer, Upload, X, Camera, FileText } from "lucide-react";
import { toast } from "sonner";
import { useInmoAI } from "@/hooks/useInmoAI";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";
import { exportInformePdf } from "@/lib/exportInformePdf";
import { AgencySettingsCard } from "@/components/AgencySettingsCard";
import { useAgencyProfile } from "@/hooks/useAgencyProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToolHistory, fetchToolHistoryByTool } from "@/hooks/useToolHistory";
import { ToolHistoryPanel } from "@/components/ToolHistoryPanel";
import type { ToolHistoryEntry } from "@/hooks/useToolHistory";

const PROPERTY_TYPES = ["casa", "departamento", "terreno", "local", "oficina", "duplex", "edificio", "galpon"] as const;
const CONSERVATION_STATES = ["nuevo", "excelente", "bueno", "regular", "reformar"] as const;

interface InformeResult {
  resumen_ejecutivo: string;
  analisis_mercado: string;
  valoracion_estimada: string;
  factores_positivos: string[];
  factores_negativos: string[];
  recomendaciones: string[];
  metodologia: string;
  disclaimer: string;
  analisis_visual?: string;
}

const InformesPage = () => {
  const { t } = useTranslation();
  const [tipo, setTipo] = useState("casa");
  const [ubicacion, setUbicacion] = useState("");
  const [superficie, setSuperficie] = useState("");
  const [superficieTerreno, setSuperficieTerreno] = useState("");
  const [habitaciones, setHabitaciones] = useState("");
  const [banos, setBanos] = useState("");
  const [antiguedad, setAntiguedad] = useState("");
  const [estado, setEstado] = useState("bueno");
  const [extras, setExtras] = useState("");
  const [precioReferencia, setPrecioReferencia] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [resultado, setResultado] = useState<InformeResult | null>(null);
  const [descripcionSeleccionada, setDescripcionSeleccionada] = useState("");
  const [descripcionesHistorial, setDescripcionesHistorial] = useState<ToolHistoryEntry[]>([]);
  const [loadingDescripciones, setLoadingDescripciones] = useState(false);
  const [showDescripciones, setShowDescripciones] = useState(false);
  const { generate, loading } = useInmoAI();
  const { profile } = useAgencyProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzingPhotos, setAnalyzingPhotos] = useState(false);
  const { history, loading: histLoading, saveResult, deleteEntry } = useToolHistory("informes");

  const cargarDescripciones = async () => {
    if (descripcionesHistorial.length > 0) { setShowDescripciones(!showDescripciones); return; }
    setLoadingDescripciones(true);
    const entries = await fetchToolHistoryByTool("descripciones");
    setDescripcionesHistorial(entries);
    setShowDescripciones(true);
    setLoadingDescripciones(false);
  };

  const seleccionarDescripcion = (entry: ToolHistoryEntry) => {
    const data = entry.result_data;
    const desc = data?.larga || data?.corta || data?.portal || "";
    setDescripcionSeleccionada(desc);
    setShowDescripciones(false);
    toast.success(t("informes.selectedDescription"));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (fotos.length + files.length > 5) { toast.error("Máximo 5 fotos"); return; }
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} > 5MB`); return; }
      const reader = new FileReader();
      reader.onload = (ev) => { setFotos((prev) => [...prev, ev.target?.result as string]); };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = "";
  };

  const removePhoto = (index: number) => setFotos((prev) => prev.filter((_, i) => i !== index));

  const generar = async () => {
    if (!ubicacion.trim()) { toast.error(t("informes.location")); return; }
    const inputData: any = { tipo, ubicacion, superficie, superficieTerreno, habitaciones, banos, antiguedad, estado, extras, precioReferencia };
    if (descripcionSeleccionada) inputData.descripcion_inmueble = descripcionSeleccionada;
    const result = await generate("informes", inputData);
    if (!result) return;

    let analisisVisual = "";
    if (fotos.length > 0) {
      setAnalyzingPhotos(true);
      try {
        const { data, error } = await supabase.functions.invoke("analyze-photos", { body: { images: fotos, tipo, ubicacion } });
        if (!error && data?.result) analisisVisual = data.result;
      } catch {}
      setAnalyzingPhotos(false);
    }

    const res: InformeResult = {
      resumen_ejecutivo: result.resumen_ejecutivo || "",
      analisis_mercado: result.analisis_mercado || "",
      valoracion_estimada: result.valoracion_estimada || "",
      factores_positivos: result.factores_positivos || [],
      factores_negativos: result.factores_negativos || [],
      recomendaciones: result.recomendaciones || [],
      metodologia: result.metodologia || "",
      disclaimer: result.disclaimer || "",
      analisis_visual: analisisVisual,
    };
    setResultado(res);
    const title = [tipo, ubicacion].filter(Boolean).join(" — ") || "Informe";
    await saveResult(title, inputData, res);
  };

  const copiarInforme = () => {
    if (!resultado) return;
    let text = `${t("informes.executiveSummary").toUpperCase()}\n${resultado.resumen_ejecutivo}\n\n${t("informes.marketAnalysis").toUpperCase()}\n${resultado.analisis_mercado}\n\n${t("informes.estimatedValuation").toUpperCase()}\n${resultado.valoracion_estimada}\n\n${t("informes.positiveFactors").toUpperCase()}\n${resultado.factores_positivos.map(f => `• ${f}`).join("\n")}\n\n${t("informes.negativeFactors").toUpperCase()}\n${resultado.factores_negativos.map(f => `• ${f}`).join("\n")}\n\n${t("informes.recommendationsTitle").toUpperCase()}\n${resultado.recomendaciones.map(r => `• ${r}`).join("\n")}\n\n`;
    if (resultado.analisis_visual) text += `${t("informes.visualAnalysis").toUpperCase()}\n${resultado.analisis_visual}\n\n`;
    text += `${t("informes.methodology").toUpperCase()}\n${resultado.metodologia}\n\n${t("informes.legalNote").toUpperCase()}\n${resultado.disclaimer}`;
    navigator.clipboard.writeText(text);
    toast.success(t("common.copySuccess", { item: t("informes.title") }));
  };

  const descargarPdf = async () => {
    if (!resultado) return;
    try {
      await exportInformePdf(resultado, { tipo, ubicacion, superficie, superficieTerreno, habitaciones, banos, antiguedad, estado }, {
        agency_name: profile.agency_name, agency_phone: profile.agency_phone, agency_email: profile.agency_email, agency_logo_url: profile.agency_logo_url,
      });
      toast.success("PDF OK");
    } catch { toast.error("Error PDF"); }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="informes" />
      <div className="flex items-center gap-2 mb-6">
        <FileSpreadsheet className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">{t("informes.title")}</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">{t("informes.propertyData")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t("informes.propertyType")}</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{PROPERTY_TYPES.map((v) => (<SelectItem key={v} value={v}>{t(`informes.propertyTypes.${v}`)}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><Label>{t("informes.location")}</Label><Input placeholder={t("informes.locationPlaceholder")} value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className="mt-1.5" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("informes.builtArea")}</Label><Input type="number" placeholder="120" value={superficie} onChange={(e) => setSuperficie(e.target.value)} className="mt-1.5" /></div>
                <div><Label>{t("informes.landArea")}</Label><Input type="number" placeholder="300" value={superficieTerreno} onChange={(e) => setSuperficieTerreno(e.target.value)} className="mt-1.5" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>{t("informes.rooms")}</Label><Input type="number" placeholder="3" value={habitaciones} onChange={(e) => setHabitaciones(e.target.value)} className="mt-1.5" /></div>
                <div><Label>{t("informes.bathrooms")}</Label><Input type="number" placeholder="2" value={banos} onChange={(e) => setBanos(e.target.value)} className="mt-1.5" /></div>
                <div><Label>{t("informes.age")}</Label><Input type="number" placeholder="5" value={antiguedad} onChange={(e) => setAntiguedad(e.target.value)} className="mt-1.5" /></div>
              </div>
              <div>
                <Label>{t("informes.conservationState")}</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{CONSERVATION_STATES.map((v) => (<SelectItem key={v} value={v}>{t(`informes.conservationStates.${v}`)}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><Label>{t("informes.referencePrice")}</Label><Input placeholder={t("informes.referencePricePlaceholder")} value={precioReferencia} onChange={(e) => setPrecioReferencia(e.target.value)} className="mt-1.5" /></div>
              <div><Label>{t("informes.extrasLabel")}</Label><Textarea placeholder={t("informes.extrasPlaceholder")} value={extras} onChange={(e) => setExtras(e.target.value)} rows={2} className="mt-1.5" /></div>

              <div>
                <Button variant="outline" size="sm" className="w-full border-dashed" onClick={cargarDescripciones} disabled={loadingDescripciones}>
                  {loadingDescripciones ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <FileText className="h-3.5 w-3.5 mr-1.5" />}
                  {t("informes.useDescription")}
                </Button>
                {descripcionSeleccionada && (
                  <div className="mt-2 p-2 rounded-md bg-primary/10 border border-primary/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-primary">{t("informes.selectedDescription")}</span>
                      <button onClick={() => setDescripcionSeleccionada("")} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-3">{descripcionSeleccionada}</p>
                  </div>
                )}
                {showDescripciones && (
                  <div className="mt-2 space-y-1.5 max-h-[200px] overflow-y-auto border border-border rounded-md p-2 bg-background">
                    {descripcionesHistorial.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">{t("informes.noDescriptions")}</p>
                    ) : (
                      descripcionesHistorial.map((entry) => (
                        <button key={entry.id} className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border" onClick={() => seleccionarDescripcion(entry)}>
                          <p className="text-xs font-medium truncate">{entry.title}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-1.5"><Camera className="h-3.5 w-3.5" /> {t("informes.photos")}</Label>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                <Button variant="outline" size="sm" className="w-full mt-1.5 border-dashed" onClick={() => fileInputRef.current?.click()} disabled={fotos.length >= 5}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  {fotos.length > 0 ? `${fotos.length}/5` : t("informes.uploadPhotos")}
                </Button>
                {fotos.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {fotos.map((f, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border">
                        <img src={f} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                        <button onClick={() => removePhoto(i)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">{t("informes.photoAnalysis")}</p>
              </div>

              <Button onClick={generar} className="w-full" disabled={loading || analyzingPhotos || !ubicacion.trim()}>
                {loading || analyzingPhotos ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {analyzingPhotos ? t("informes.analyzingPhotos") : t("informes.generatingReport")}</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> {t("informes.generateButton")}</>
                )}
              </Button>
            </CardContent>
          </Card>
          <ToolHistoryPanel history={history} loading={histLoading} onLoad={(e) => setResultado(e.result_data)} onDelete={deleteEntry} />
          <AgencySettingsCard />
        </div>

        <div className="lg:col-span-2 print:col-span-3">
          {resultado ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between print:hidden">
                <span className="text-sm font-medium text-primary">{t("informes.reportGenerated")}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copiarInforme}><Copy className="h-3.5 w-3.5 mr-1.5" /> {t("informes.copyReport")}</Button>
                  <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-3.5 w-3.5 mr-1.5" /> {t("informes.printReport")}</Button>
                  <Button size="sm" onClick={descargarPdf} className="bg-primary"><Download className="h-3.5 w-3.5 mr-1.5" /> {t("informes.downloadPdf")}</Button>
                </div>
              </div>
              <Card className="glass-card"><CardHeader className="pb-2"><CardTitle className="text-sm text-primary">{t("informes.executiveSummary")}</CardTitle></CardHeader><CardContent><p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{resultado.resumen_ejecutivo}</p></CardContent></Card>
              <Card className="glass-card border-primary/20"><CardHeader className="pb-2"><CardTitle className="text-sm text-primary">{t("informes.estimatedValuation")}</CardTitle></CardHeader><CardContent><p className="text-sm text-foreground whitespace-pre-line leading-relaxed font-medium">{resultado.valoracion_estimada}</p></CardContent></Card>
              <Card className="glass-card"><CardHeader className="pb-2"><CardTitle className="text-sm">{t("informes.marketAnalysis")}</CardTitle></CardHeader><CardContent><p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{resultado.analisis_mercado}</p></CardContent></Card>
              {resultado.analisis_visual && (
                <Card className="glass-card border-accent/30">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><Camera className="h-3.5 w-3.5 text-accent-foreground" /> {t("informes.visualAnalysis")}</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{resultado.analisis_visual}</p></CardContent>
                </Card>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="glass-card"><CardHeader className="pb-2"><CardTitle className="text-sm text-green-500">{t("informes.positiveFactors")}</CardTitle></CardHeader><CardContent><ul className="space-y-1.5">{resultado.factores_positivos.map((f, i) => (<li key={i} className="text-sm text-foreground flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> {f}</li>))}</ul></CardContent></Card>
                <Card className="glass-card"><CardHeader className="pb-2"><CardTitle className="text-sm text-destructive">{t("informes.negativeFactors")}</CardTitle></CardHeader><CardContent><ul className="space-y-1.5">{resultado.factores_negativos.map((f, i) => (<li key={i} className="text-sm text-foreground flex items-start gap-2"><span className="text-destructive mt-0.5">✗</span> {f}</li>))}</ul></CardContent></Card>
              </div>
              <Card className="glass-card"><CardHeader className="pb-2"><CardTitle className="text-sm">{t("informes.recommendationsTitle")}</CardTitle></CardHeader><CardContent><ul className="space-y-1.5">{resultado.recomendaciones.map((r, i) => (<li key={i} className="text-sm text-foreground flex items-start gap-2"><span className="text-primary mt-0.5">→</span> {r}</li>))}</ul></CardContent></Card>
              <Card className="glass-card"><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">{t("informes.methodology")}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{resultado.metodologia}</p></CardContent></Card>
              <div className="p-3 rounded-lg bg-muted/50 border border-border"><p className="text-[10px] text-muted-foreground leading-relaxed">{resultado.disclaimer}</p></div>
            </div>
          ) : (
            <Card className="glass-card h-full flex items-center justify-center min-h-[300px]">
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm mb-1">{t("informes.propertyData")}</p>
                <p className="text-xs opacity-60">{t("informes.emptyDesc")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InformesPage;
