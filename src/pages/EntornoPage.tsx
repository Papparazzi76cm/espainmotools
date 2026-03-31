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

interface PrecioRango { tipo: string; rango_min: number; rango_max: number; moneda: string; }
interface PreciosZona { resumen: string; rangos: PrecioRango[]; tendencia: string; nivel: string; }
interface EntornoResult { descripcion: string; servicios: string[]; estilo_vida: string; atractivos: string[]; precios_zona?: PreciosZona; }

const nivelColors: Record<string, string> = { economico: "bg-emerald-500", medio: "bg-blue-500", "medio-alto": "bg-indigo-500", alto: "bg-purple-500", premium: "bg-amber-500" };
const nivelLabels: Record<string, string> = { economico: "Económico", medio: "Medio", "medio-alto": "Medio-Alto", alto: "Alto", premium: "Premium" };

const EntornoPage = () => {
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
    if (result) {
      setResultado(result);
      setMapQuery(zona);
      await saveResult(zona, { zona, detalles }, result);
    }
  };

  const geolocalizarme = () => {
    if (!navigator.geolocation) { toast.error("Tu navegador no soporta geolocalización."); return; }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { data } = await supabase.functions.invoke("geocode", { body: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
          if (data?.address) { setZona(data.address); toast.success("Dirección detectada correctamente"); }
          else setZona(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        } catch { setZona(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`); }
        finally { setGeolocating(false); }
      },
      () => { toast.error("No se pudo obtener tu ubicación."); setGeolocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const copiarTodo = () => {
    if (!resultado) return;
    let text = `DESCRIPCIÓN DE ENTORNO — ${zona}\n\n` +
      `DESCRIPCIÓN\n${resultado.descripcion}\n\nESTILO DE VIDA\n${resultado.estilo_vida}\n\n` +
      `SERVICIOS\n${resultado.servicios.map(s => `• ${s}`).join("\n")}\n\nATRACTIVOS\n${resultado.atractivos.map(a => `• ${a}`).join("\n")}`;
    if (resultado.precios_zona) {
      text += `\n\nPRECIOS DE LA ZONA\n${resultado.precios_zona.resumen}\n`;
      resultado.precios_zona.rangos.forEach(r => { text += `• ${r.tipo}: ${r.rango_min.toLocaleString()} - ${r.rango_max.toLocaleString()} ${r.moneda}\n`; });
    }
    navigator.clipboard.writeText(text); toast.success("Informe de entorno copiado");
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
        <h1 className="text-2xl font-semibold">Descripción de Entorno</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Zona o Dirección</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Zona / Barrio / Dirección</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input placeholder="Salamanca, Madrid" value={zona} onChange={(e) => setZona(e.target.value)} className="flex-1" />
                  <Button variant="outline" size="icon" onClick={geolocalizarme} disabled={geolocating} title="Usar mi ubicación">
                    {geolocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Escribe una dirección o pulsa el icono para geolocalizarte</p>
              </div>
              <div><Label>Detalles adicionales (opcional)</Label><Textarea placeholder="Cerca de shopping, zona residencial..." value={detalles} onChange={(e) => setDetalles(e.target.value)} rows={3} className="mt-1.5" /></div>
              <Button onClick={generar} className="w-full" disabled={loading || !zona.trim()}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generando...</> : <><Sparkles className="h-4 w-4 mr-2" /> Describir Entorno con IA</>}
              </Button>
              {mapQuery && mapEmbedUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border">
                  <iframe title="Mapa" src={mapEmbedUrl} width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
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
                <span className="text-sm font-medium text-primary">Resultado</span>
                <Button variant="outline" size="sm" onClick={copiarTodo}><Copy className="h-3.5 w-3.5 mr-1.5" /> Copiar todo</Button>
              </div>
              <Card className="glass-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Descripción</CardTitle></CardHeader>
                <CardContent><p className="text-sm whitespace-pre-line leading-relaxed">{resultado.descripcion}</p></CardContent>
              </Card>
              {resultado.precios_zona && (
                <Card className="glass-card border-primary/20">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Mapa de Precios de la Zona</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{resultado.precios_zona.resumen}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Nivel:</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${nivelColors[resultado.precios_zona.nivel] || "bg-muted"}`}>{nivelLabels[resultado.precios_zona.nivel] || resultado.precios_zona.nivel}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Tendencia:</span>
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
                <CardHeader className="pb-2"><CardTitle className="text-sm">Estilo de Vida</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{resultado.estilo_vida}</p></CardContent>
              </Card>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="glass-card">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Servicios</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-1">{resultado.servicios?.map((s, i) => (<li key={i} className="text-sm flex gap-1"><span className="text-primary">•</span>{s}</li>))}</ul></CardContent>
                </Card>
                <Card className="glass-card">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Atractivos</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-1">{resultado.atractivos?.map((a, i) => (<li key={i} className="text-sm flex gap-1"><span className="text-primary">•</span>{a}</li>))}</ul></CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="glass-card h-full flex items-center justify-center min-h-[300px]">
              <CardContent className="p-8 text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm mb-1">Ingresa la zona para generar una descripción</p>
                <p className="text-xs opacity-60">La IA analizará el entorno, precios y generará una descripción atractiva</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntornoPage;
