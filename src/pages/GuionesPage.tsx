import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Video, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useInmoAI } from "@/hooks/useInmoAI";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";
import { useToolHistory } from "@/hooks/useToolHistory";
import { ToolHistoryPanel } from "@/components/ToolHistoryPanel";

const GuionesPage = () => {
  const [tipo, setTipo] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [precio, setPrecio] = useState("");
  const [caracteristicas, setCaracteristicas] = useState("");
  const [tono, setTono] = useState("profesional");
  const [duracion, setDuracion] = useState("60");
  const [resultado, setResultado] = useState<{ reel: string; tiktok: string; youtube: string } | null>(null);
  const { generate, loading } = useInmoAI();
  const { history, loading: histLoading, saveResult, deleteEntry } = useToolHistory("guiones");

  const generar = async () => {
    const result = await generate("guiones", { tipo, ubicacion, precio, caracteristicas, tono, duracion: `${duracion} segundos` });
    if (result) {
      const res = { reel: result.reel || "", tiktok: result.tiktok || "", youtube: result.youtube || "" };
      setResultado(res);
      const title = [tipo, ubicacion].filter(Boolean).join(" — ") || "Guión";
      await saveResult(title, { tipo, ubicacion, precio, caracteristicas, tono, duracion }, res);
    }
  };

  const copiar = (text: string, label: string) => { navigator.clipboard.writeText(text); toast.success(`${label} copiado`); };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="guiones" />
      <div className="flex items-center gap-2 mb-6">
        <Video className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">Guiones de Vídeo</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Datos del Inmueble</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Tipo</Label><Input placeholder="Casa, departamento..." value={tipo} onChange={(e) => setTipo(e.target.value)} /></div>
              <div><Label>Ubicación</Label><Input placeholder="Barrio, ciudad..." value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} /></div>
              <div><Label>Precio</Label><Input placeholder="USD 85.000" value={precio} onChange={(e) => setPrecio(e.target.value)} /></div>
              <div><Label>Características</Label><Textarea placeholder="3 hab, 2 baños..." value={caracteristicas} onChange={(e) => setCaracteristicas(e.target.value)} rows={3} /></div>
              <div>
                <Label>Tono</Label>
                <Select value={tono} onValueChange={setTono}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profesional">Profesional</SelectItem>
                    <SelectItem value="cercano">Cercano y amigable</SelectItem>
                    <SelectItem value="energetico">Enérgico</SelectItem>
                    <SelectItem value="lujo">Lujo / Exclusivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duración del vídeo</Label>
                <Select value={duracion} onValueChange={setDuracion}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 segundos</SelectItem>
                    <SelectItem value="60">1 minuto</SelectItem>
                    <SelectItem value="90">1 min 30 seg</SelectItem>
                    <SelectItem value="120">2 minutos</SelectItem>
                    <SelectItem value="150">2 min 30 seg</SelectItem>
                    <SelectItem value="180">3 minutos</SelectItem>
                    <SelectItem value="210">3 min 30 seg</SelectItem>
                    <SelectItem value="240">4 minutos</SelectItem>
                    <SelectItem value="270">4 min 30 seg</SelectItem>
                    <SelectItem value="300">5 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generar} className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generando...</> : "Generar Guiones con IA"}
              </Button>
            </CardContent>
          </Card>
          <ToolHistoryPanel history={history} loading={histLoading} onLoad={(e) => setResultado(e.result_data)} onDelete={deleteEntry} />
        </div>
        <div className="space-y-4">
          {resultado ? (
            <>
              <ResultBlock title="📱 Instagram Reel" text={resultado.reel} onCopy={() => copiar(resultado.reel, "Reel")} />
              <ResultBlock title="🎵 TikTok" text={resultado.tiktok} onCopy={() => copiar(resultado.tiktok, "TikTok")} />
              <ResultBlock title="▶️ YouTube" text={resultado.youtube} onCopy={() => copiar(resultado.youtube, "YouTube")} />
            </>
          ) : (
            <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground">
              <Video className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">Genera guiones para tus vídeos inmobiliarios.</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
};

function ResultBlock({ title, text, onCopy }: { title: string; text: string; onCopy: () => void }) {
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

export default GuionesPage;
