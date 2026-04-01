import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, FileText, Sparkles, Loader2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { useInmoAI } from "@/hooks/useInmoAI";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";
import { useToolHistory } from "@/hooks/useToolHistory";
import { ToolHistoryPanel } from "@/components/ToolHistoryPanel";
import { useTranslation } from "react-i18next";

const styleKeys = ["formal", "comercial", "directo", "emocional", "lujo"] as const;

interface Resultado { corta: string; larga: string; redes: string; facebook: string; instagram: string; portal: string; }

const MAX_IMAGES = 20;

const DescripcionesPage = () => {
  const { t } = useTranslation();
  const [tipo, setTipo] = useState("");
  const [estilo, setEstilo] = useState("comercial");
  const [habitaciones, setHabitaciones] = useState("");
  const [superficie, setSuperficie] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [precio, setPrecio] = useState("");
  const [extras, setExtras] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { generate, loading } = useInmoAI();
  const { history, loading: histLoading, saveResult, deleteEntry } = useToolHistory("descripciones");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    const filesToProcess = Array.from(files).slice(0, remaining);
    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = () => { setImages((prev) => prev.length >= MAX_IMAGES ? prev : [...prev, reader.result as string]); };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const generar = async () => {
    const result = await generate("descripciones", { tipo, estilo, habitaciones, superficie, ubicacion, precio, extras }, images.length > 0 ? images : undefined);
    if (result) {
      const res: Resultado = { corta: result.corta || "", larga: result.larga || "", redes: result.redes || "", facebook: result.facebook || "", instagram: result.instagram || "", portal: result.portal || "" };
      setResultado(res);
      const title = [tipo, ubicacion].filter(Boolean).join(" — ") || t("descripciones.title");
      await saveResult(title, { tipo, estilo, habitaciones, superficie, ubicacion, precio, extras }, res);
    }
  };

  const copiar = (text: string, label: string) => { navigator.clipboard.writeText(text); toast.success(t("common.copySuccess", { item: label })); };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="descripciones" />
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">{t("descripciones.title")}</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">{t("descripciones.propertyData")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>{t("descripciones.propertyType")}</Label><Input placeholder={t("descripciones.propertyTypePlaceholder")} value={tipo} onChange={(e) => setTipo(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("descripciones.rooms")}</Label><Input type="number" placeholder="3" value={habitaciones} onChange={(e) => setHabitaciones(e.target.value)} /></div>
                <div><Label>{t("descripciones.area")}</Label><Input type="number" placeholder="120" value={superficie} onChange={(e) => setSuperficie(e.target.value)} /></div>
              </div>
              <div><Label>{t("descripciones.location")}</Label><Input placeholder={t("descripciones.locationPlaceholder")} value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} /></div>
              <div><Label>{t("descripciones.price")}</Label><Input placeholder={t("descripciones.pricePlaceholder")} value={precio} onChange={(e) => setPrecio(e.target.value)} /></div>
              <div>
                <Label>{t("descripciones.writingStyle")}</Label>
                <Select value={estilo} onValueChange={setEstilo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{styleKeys.map((k) => (<SelectItem key={k} value={k}>{t(`descripciones.styles.${k}`)}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><Label>{t("descripciones.extras")}</Label><Textarea placeholder={t("descripciones.extrasPlaceholder")} value={extras} onChange={(e) => setExtras(e.target.value)} rows={3} /></div>
              <div>
                <Label className="flex items-center gap-1.5 mb-2"><ImagePlus className="h-3.5 w-3.5" /> {t("descripciones.photos")} ({images.length}/{MAX_IMAGES})</Label>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative group aspect-square rounded-md overflow-hidden border border-border">
                        <img src={img} alt={`${i + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
                {images.length < MAX_IMAGES && (
                  <Button type="button" variant="outline" size="sm" className="w-full text-xs" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus className="h-3.5 w-3.5 mr-1.5" /> {t("descripciones.addPhotos")}
                  </Button>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">{t("descripciones.photoAnalysis")}</p>
              </div>
              <Button onClick={generar} className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("descripciones.generatingButton")}</> : t("descripciones.generateButton")}
              </Button>
            </CardContent>
          </Card>
          <ToolHistoryPanel history={history} loading={histLoading} onLoad={(entry) => setResultado(entry.result_data)} onDelete={deleteEntry} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          {resultado ? (
            <>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("descripciones.descriptions")}</h3>
              <ResultCard title={t("descripciones.shortVersion")} text={resultado.corta} onCopy={() => copiar(resultado.corta, t("descripciones.shortVersion"))} />
              <ResultCard title={t("descripciones.longVersion")} text={resultado.larga} onCopy={() => copiar(resultado.larga, t("descripciones.longVersion"))} />
              <ResultCard title={t("descripciones.socialMedia")} text={resultado.redes} onCopy={() => copiar(resultado.redes, t("descripciones.socialMedia"))} />
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pt-2">{t("descripciones.ads")}</h3>
              <ResultCard title={t("descripciones.facebookAds")} text={resultado.facebook} onCopy={() => copiar(resultado.facebook, "Facebook")} />
              <ResultCard title={t("descripciones.instagram")} text={resultado.instagram} onCopy={() => copiar(resultado.instagram, "Instagram")} />
              <ResultCard title={t("descripciones.realEstatePortal")} text={resultado.portal} onCopy={() => copiar(resultado.portal, "Portal")} />
            </>
          ) : (
            <Card className="glass-card h-full flex items-center justify-center min-h-[300px]">
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm mb-1">{t("descripciones.emptyTitle")}</p>
                <p className="text-xs opacity-60">{t("descripciones.emptyDesc")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

function ResultCard({ title, text, onCopy }: { title: string; text: string; onCopy: () => void }) {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCopy} className="h-8 w-8"><Copy className="h-3.5 w-3.5" /></Button>
      </CardHeader>
      <CardContent><p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{text}</p></CardContent>
    </Card>
  );
}

export default DescripcionesPage;
