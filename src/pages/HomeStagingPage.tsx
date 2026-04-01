import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Sparkles, Loader2, Upload, Download, ArrowLeftRight, Zap, Crown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";
import { useTrialContext } from "@/contexts/TrialContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useTranslation } from "react-i18next";

const estiloKeys = ["moderno", "clasico", "nordico", "industrial", "boho", "lujo", "vacio"] as const;
const interiorKeys = ["salon", "comedor", "cocina", "dormitorio", "bano", "aseo", "garaje", "trastero", "oficina", "pasillo"] as const;
const exteriorKeys = ["fachada", "quincho", "jardin", "piscina", "zonas-comunes", "parque-infantil", "terraza", "patio"] as const;

const HomeStagingPage = () => {
  const { t } = useTranslation();
  const [style, setStyle] = useState("moderno");
  const [quality, setQuality] = useState<"fast" | "premium">("fast");
  const [tipoEspacio, setTipoEspacio] = useState<"interior" | "exterior">("interior");
  const [estancia, setEstancia] = useState("salon");
  const [customPrompt, setCustomPrompt] = useState("");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { canUseTool, logUsage, trial } = useTrialContext();
  const { role, isTester } = useUserRole();

  const usageCost = quality === "premium" ? 3 : 1;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error(t("homeStaging.errorUpload")); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error(t("homeStaging.errorSize")); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setOriginalImage(ev.target?.result as string); setResultImage(null); setShowComparison(false); };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!originalImage) { toast.error(t("homeStaging.errorNoImage")); return; }
    const check = canUseTool("home-staging", usageCost, role);
    if (!check.allowed) {
      toast.error(t("homeStaging.errorLimit"));
      return;
    }
    setLoading(true);
    setResultImage(null);
    try {
      const { data, error } = await supabase.functions.invoke("home-staging", {
        body: { imageBase64: originalImage, style, tipoEspacio, estancia, quality, customPrompt: customPrompt.trim() || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.result?.imageUrl) {
        setResultImage(data.result.imageUrl);
        setShowComparison(true);
        for (let i = 0; i < usageCost; i++) await logUsage("home-staging");
        toast.success(t("homeStaging.successToast"));
      } else {
        throw new Error("No image received");
      }
    } catch (e: any) {
      toast.error(e.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `home-staging-${style}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="home-staging" />
      <div className="flex items-center gap-2 mb-6">
        <Image className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">{t("homeStaging.title")}</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card lg:col-span-1">
          <CardHeader><CardTitle className="text-base">{t("homeStaging.config")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("homeStaging.roomPhoto")}</Label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button variant="outline" className="w-full mt-1.5 h-auto py-6 border-dashed flex flex-col gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{originalImage ? t("common.changeImage") : t("homeStaging.uploadMax")}</span>
              </Button>
              {originalImage && !showComparison && (
                <div className="mt-3 rounded-lg overflow-hidden border border-border"><img src={originalImage} alt="Original" className="w-full h-auto" /></div>
              )}
            </div>
            <div>
              <Label>{t("homeStaging.spaceType")}</Label>
              <Select value={tipoEspacio} onValueChange={(v: "interior" | "exterior") => { setTipoEspacio(v); setEstancia(v === "interior" ? "salon" : "fachada"); }}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="interior">{t("homeStaging.interior")}</SelectItem>
                  <SelectItem value="exterior">{t("homeStaging.exterior")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("homeStaging.roomType")}</Label>
              <Select value={estancia} onValueChange={setEstancia}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(tipoEspacio === "interior" ? interiorKeys : exteriorKeys).map((key) => (
                    <SelectItem key={key} value={key}>{t(`homeStaging.${tipoEspacio === "interior" ? "interiorTypes" : "exteriorTypes"}.${key}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("homeStaging.decorStyle")}</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {estiloKeys.map((key) => (<SelectItem key={key} value={key}>{t(`homeStaging.styles.${key}`)}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("homeStaging.generationQuality")}</Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <Button type="button" variant={quality === "fast" ? "default" : "outline"} className={`h-auto py-3 flex flex-col gap-1 ${quality === "fast" ? "" : "border-border"}`} onClick={() => setQuality("fast")}>
                  <Zap className="h-4 w-4" /><span className="text-xs font-medium">{t("homeStaging.fast")}</span><span className="text-[10px] text-muted-foreground">1 {t("homeStaging.usage")}</span>
                </Button>
                <Button type="button" variant={quality === "premium" ? "default" : "outline"} className={`h-auto py-3 flex flex-col gap-1 ${quality === "premium" ? "bg-gradient-to-r from-primary to-accent border-0" : "border-border"}`} onClick={() => setQuality("premium")}>
                  <Crown className="h-4 w-4" /><span className="text-xs font-medium">{t("homeStaging.premium")}</span><span className="text-[10px] text-muted-foreground">3 {t("homeStaging.usages")}</span>
                </Button>
              </div>
            </div>
            <div>
              <Label>{t("homeStaging.additionalInstructions")}</Label>
              <Textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder={t("homeStaging.additionalPlaceholder")} className="mt-1.5 min-h-[80px] text-sm" maxLength={500} />
              <p className="text-xs text-muted-foreground mt-1">{customPrompt.length}/500</p>
            </div>
            <Button onClick={generate} className="w-full" disabled={loading || !originalImage}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("common.generating")}</> : <><Sparkles className="h-4 w-4 mr-2" /> {t("homeStaging.generateButton")}</>}
            </Button>
            {loading && <p className="text-xs text-muted-foreground text-center">{t("homeStaging.loadingTime")}</p>}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {showComparison && originalImage && resultImage ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><ArrowLeftRight className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{t("homeStaging.comparison")}</span></div>
                <Button variant="outline" size="sm" onClick={downloadImage}><Download className="h-3.5 w-3.5 mr-1.5" /> {t("common.download")}</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="glass-card overflow-hidden">
                  <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">{t("homeStaging.original")}</CardTitle></CardHeader>
                  <CardContent className="p-2"><img src={originalImage} alt="Original" className="w-full h-auto rounded-lg" /></CardContent>
                </Card>
                <Card className="glass-card overflow-hidden border-primary/30">
                  <CardHeader className="pb-2"><CardTitle className="text-xs text-primary">{t("homeStaging.result")}</CardTitle></CardHeader>
                  <CardContent className="p-2"><img src={resultImage} alt="Home Staging" className="w-full h-auto rounded-lg" /></CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="glass-card h-full flex items-center justify-center min-h-[300px]">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm mb-1">{t("homeStaging.emptyTitle")}</p>
                <p className="text-xs opacity-60">{t("homeStaging.emptyDesc")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeStagingPage;
