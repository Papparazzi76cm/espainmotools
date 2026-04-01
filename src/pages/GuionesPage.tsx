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
import { useTranslation } from "react-i18next";

const toneKeys = ["profesional", "cercano", "energetico", "lujo"] as const;
const durationKeys = ["30", "60", "90", "120", "150", "180", "210", "240", "270", "300"] as const;

const GuionesPage = () => {
  const { t } = useTranslation();
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
      const title = [tipo, ubicacion].filter(Boolean).join(" — ") || t("guiones.title");
      await saveResult(title, { tipo, ubicacion, precio, caracteristicas, tono, duracion }, res);
    }
  };

  const copiar = (text: string, label: string) => { navigator.clipboard.writeText(text); toast.success(t("common.copySuccess", { item: label })); };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="guiones" />
      <div className="flex items-center gap-2 mb-6">
        <Video className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">{t("guiones.title")}</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">{t("guiones.propertyData")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>{t("guiones.type")}</Label><Input placeholder={t("guiones.typePlaceholder")} value={tipo} onChange={(e) => setTipo(e.target.value)} /></div>
              <div><Label>{t("guiones.location")}</Label><Input placeholder={t("guiones.locationPlaceholder")} value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} /></div>
              <div><Label>{t("guiones.price")}</Label><Input placeholder={t("guiones.pricePlaceholder")} value={precio} onChange={(e) => setPrecio(e.target.value)} /></div>
              <div><Label>{t("guiones.features")}</Label><Textarea placeholder={t("guiones.featuresPlaceholder")} value={caracteristicas} onChange={(e) => setCaracteristicas(e.target.value)} rows={3} /></div>
              <div>
                <Label>{t("guiones.tone")}</Label>
                <Select value={tono} onValueChange={setTono}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{toneKeys.map((k) => (<SelectItem key={k} value={k}>{t(`guiones.tones.${k}`)}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("guiones.videoDuration")}</Label>
                <Select value={duracion} onValueChange={setDuracion}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{durationKeys.map((k) => (<SelectItem key={k} value={k}>{t(`guiones.durations.${k}`)}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <Button onClick={generar} className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("common.generating")}</> : t("guiones.generateButton")}
              </Button>
            </CardContent>
          </Card>
          <ToolHistoryPanel history={history} loading={histLoading} onLoad={(e) => setResultado(e.result_data)} onDelete={deleteEntry} />
        </div>
        <div className="space-y-4">
          {resultado ? (
            <>
              <ResultBlock title={t("guiones.reelTitle")} text={resultado.reel} onCopy={() => copiar(resultado.reel, "Reel")} />
              <ResultBlock title={t("guiones.tiktokTitle")} text={resultado.tiktok} onCopy={() => copiar(resultado.tiktok, "TikTok")} />
              <ResultBlock title={t("guiones.youtubeTitle")} text={resultado.youtube} onCopy={() => copiar(resultado.youtube, "YouTube")} />
            </>
          ) : (
            <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground">
              <Video className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">{t("guiones.emptyDesc")}</p>
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
