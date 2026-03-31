import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, Megaphone, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useInmoAI } from "@/hooks/useInmoAI";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";
import { useToolHistory } from "@/hooks/useToolHistory";
import { ToolHistoryPanel } from "@/components/ToolHistoryPanel";

const AnunciosPage = () => {
  const [tipo, setTipo] = useState("");
  const [precio, setPrecio] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [caracteristicas, setCaracteristicas] = useState("");
  const [resultado, setResultado] = useState<{ facebook: string; instagram: string; portal: string } | null>(null);
  const { generate, loading } = useInmoAI();
  const { history, loading: histLoading, saveResult, deleteEntry } = useToolHistory("anuncios");

  const generar = async () => {
    const result = await generate("anuncios", { tipo, precio, ubicacion, caracteristicas });
    if (result) {
      const res = { facebook: result.facebook || "", instagram: result.instagram || "", portal: result.portal || "" };
      setResultado(res);
      const title = [tipo, ubicacion].filter(Boolean).join(" — ") || "Anuncio";
      await saveResult(title, { tipo, precio, ubicacion, caracteristicas }, res);
    }
  };

  const copiar = (text: string, label: string) => { navigator.clipboard.writeText(text); toast.success(`${label} copiado`); };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="anuncios" />
      <div className="flex items-center gap-2 mb-6">
        <Megaphone className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">Generador de Anuncios</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Datos del Inmueble</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Tipo</Label><Input placeholder="Casa, departamento..." value={tipo} onChange={(e) => setTipo(e.target.value)} /></div>
              <div><Label>Precio</Label><Input placeholder="85.000 €" value={precio} onChange={(e) => setPrecio(e.target.value)} /></div>
              <div><Label>Ubicación</Label><Input placeholder="Barrio, ciudad..." value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} /></div>
              <div><Label>Características</Label><Textarea placeholder="3 hab, 2 baños, piscina..." value={caracteristicas} onChange={(e) => setCaracteristicas(e.target.value)} rows={3} /></div>
              <Button onClick={generar} className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generando...</> : "Generar Anuncios con IA"}
              </Button>
            </CardContent>
          </Card>
          <ToolHistoryPanel history={history} loading={histLoading} onLoad={(e) => setResultado(e.result_data)} onDelete={deleteEntry} />
        </div>
        <div className="space-y-4">
          {resultado ? (
            <>
              <ResultBlock title="Facebook Ads" text={resultado.facebook} onCopy={() => copiar(resultado.facebook, "Facebook")} />
              <ResultBlock title="Instagram" text={resultado.instagram} onCopy={() => copiar(resultado.instagram, "Instagram")} />
              <ResultBlock title="Portal Inmobiliario" text={resultado.portal} onCopy={() => copiar(resultado.portal, "Portal")} />
            </>
          ) : (
            <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground">
              <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">Genera anuncios optimizados para cada plataforma.</p>
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

export default AnunciosPage;
