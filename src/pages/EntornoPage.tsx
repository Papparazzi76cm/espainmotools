import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Sparkles, Loader2, Navigation, Copy, TrendingUp, TrendingDown, Minus, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useInmoAI } from "@/hooks/useInmoAI";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";
import { supabase } from "@/integrations/supabase/client";
import { useToolHistory } from "@/hooks/useToolHistory";
import { ToolHistoryPanel } from "@/components/ToolHistoryPanel";
import { useTranslation } from "react-i18next";

interface PrecioRango { tipo: string; rango_min: number; rango_max: number; moneda: string; }
interface PreciosZona { resumen: string; rangos: PrecioRango[]; tendencia: string; nivel: string; }
interface EntornoResult { descripcion: string; servicios: string[]; estilo_vida: string; atractivos: string[]; precios_zona?: PreciosZona; }

const nivelColors: Record<string, string> = { economico: "bg-emerald-500", medio: "bg-blue-500", "medio-alto": "bg-indigo-500", alto: "bg-purple-500", premium: "bg-amber-500" };

const EntornoPage = () => {
  const { t } = useTranslation();
  const [zona, setZona] = useState("");
  const [detalles, setDetalles] = useState("");
  const [geolocating, setGeolocating] = useState(false);
  const [mapQuery, setMapQuery] = useState("");
  const [resultado, setResultado] = useState<EntornoResult | null>(null);
  const { generate, loading } = useInmoAI();
  const { history, loading: histLoading, saveResult, deleteEntry } = useToolHistory("entorno");

  const generar = async () => {
    if (!zona.trim()) return;
    const result = await generate("entorno", { zona, detalles });
    if (result) { setResultado(result); setMapQuery(zona); await saveResult(zona, { zona, detalles }, result); }
  };

  const geolocalizarme = () => {
    if (!navigator.geolocation) { toast.error(t("entorno.geoUnsupported")); return; }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { data } = await supabase.functions.invoke("geocode", { body: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
          if (data?.address) { setZona(data.address); toast.success(t("entorno.geoSuccess")); }
          else setZona(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        } catch { setZona(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`); }
        finally { setGeolocating(false); }
      },
      () => { toast.error(t("entorno.geoError")); setGeolocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const copiarTodo = () => {
    if (!resultado) return;
    let text = `${t("entorno.description").toUpperCase()} — ${zona}\n\n${resultado.descripcion}\n\n${t("entorno.lifestyle").toUpperCase()}\n${resultado.estilo_vida}\n\n${t("entorno.services").toUpperCase()}\n${resultado.servicios.map(s => `• ${s}`).join("\n")}\n\n${t("entorno.attractions").toUpperCase()}\n${resultado.atractivos.map(a => `• ${a}`).join("\n")}`;
    if (resultado.precios_zona) {
      text += `\n\n${t("entorno.areaPrices").toUpperCase()}\n${resultado.precios_zona.resumen}\n`;
      resultado.precios_zona.rangos.forEach(r => { text += `• ${r.tipo}: ${r.rango_min.toLocaleString()} - ${r.rango_max.toLocaleString()} ${r.moneda}\n`; });
    }
    navigator.clipboard.writeText(text); toast.success(t("common.copySuccess", { item: t("entorno.title") }));
  };

  const mapEmbedUrl = mapQuery ? `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}&q=${encodeURIComponent(mapQuery)}&zoom=15&language=es` : "";

  const TendenciaIcon = ({ tendencia }: { tendencia: string }) => {
    if (tendencia === "alza") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (tendencia === "baja") return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="entorno" />
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">{t("entorno.title")}</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">{t("entorno.zoneAddress")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t("entorno.zoneLabel")}</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input placeholder={t("entorno.zonePlaceholder")} value={zona} onChange={(e) => setZona(e.target.value)} className="flex-1" />
                  <Button variant="outline" size="icon" onClick={geolocalizarme} disabled={geolocating}>
                    {geolocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{t("entorno.zoneHint")}</p>
              </div>
              <div><Label>{t("entorno.additionalDetails")}</Label><Textarea placeholder={t("entorno.additionalPlaceholder")} value={detalles} onChange={(e) => setDetalles(e.target.value)} rows={3} className="mt-1.5" /></div>
              <Button onClick={generar} className="w-full" disabled={loading || !zona.trim()}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("common.generating")}</> : <><Sparkles className="h-4 w-4 mr-2" /> {t("entorno.generateButton")}</>}
              </Button>
              {mapQuery && mapEmbedUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border">
                  <iframe title="Map" src={mapEmbedUrl} width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
              )}
            </CardContent>
          </Card>
          <ToolHistoryPanel history={history} loading={histLoading} onLoad={(e) => { setResultado(e.result_data); if (e.input_data?.zona) setMapQuery(e.input_data.zona); }} onDelete={deleteEntry} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          {resultado ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">{t("entorno.result")}</span>
                <Button variant="outline" size="sm" onClick={copiarTodo}><Copy className="h-3.5 w-3.5 mr-1.5" /> {t("entorno.copyAll")}</Button>
              </div>
              <Card className="glass-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm">{t("entorno.description")}</CardTitle></CardHeader>
                <CardContent><p className="text-sm whitespace-pre-line leading-relaxed">{resultado.descripcion}</p></CardContent>
              </Card>
              {resultado.precios_zona && (
                <Card className="glass-card border-primary/20">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> {t("entorno.areaPrices")}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{resultado.precios_zona.resumen}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{t("entorno.priceLevel")}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${nivelColors[resultado.precios_zona.nivel] || "bg-muted"}`}>{t(`entorno.levels.${resultado.precios_zona.nivel}`, resultado.precios_zona.nivel)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">{t("entorno.priceTrend")}</span>
                        <TendenciaIcon tendencia={resultado.precios_zona.tendencia} />
                        <span className="text-xs font-medium capitalize">{resultado.precios_zona.tendencia}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {resultado.precios_zona.rangos.map((rango, i) => {
                        const maxVal = Math.max(...resultado.precios_zona!.rangos.map(r => r.rango_max));
                        const widthMin = (rango.rango_min / maxVal) * 100;
                        const widthMax = (rango.rango_max / maxVal) * 100;
                        return (
                          <div key={i}>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs font-medium">{rango.tipo}</span>
                              <span className="text-xs text-muted-foreground">{rango.rango_min.toLocaleString()} – {rango.rango_max.toLocaleString()} {rango.moneda}</span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                              <div className="absolute h-full rounded-full bg-gradient-to-r from-primary/40 to-primary" style={{ left: `${widthMin}%`, width: `${widthMax - widthMin}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
              <Card className="glass-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm">{t("entorno.lifestyle")}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{resultado.estilo_vida}</p></CardContent>
              </Card>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="glass-card">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">{t("entorno.services")}</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-1">{resultado.servicios?.map((s, i) => (<li key={i} className="text-sm flex gap-1"><span className="text-primary">•</span>{s}</li>))}</ul></CardContent>
                </Card>
                <Card className="glass-card">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">{t("entorno.attractions")}</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-1">{resultado.atractivos?.map((a, i) => (<li key={i} className="text-sm flex gap-1"><span className="text-primary">•</span>{a}</li>))}</ul></CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="glass-card h-full flex items-center justify-center min-h-[300px]">
              <CardContent className="p-8 text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm mb-1">{t("entorno.emptyTitle")}</p>
                <p className="text-xs opacity-60">{t("entorno.emptyDesc")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntornoPage;
