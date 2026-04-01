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

const estilos = [
  { value: "moderno", label: "Moderno / Minimalista" },
  { value: "clasico", label: "Clásico / Elegante" },
  { value: "nordico", label: "Nórdico / Escandinavo" },
  { value: "industrial", label: "Industrial" },
  { value: "boho", label: "Bohemio" },
  { value: "lujo", label: "Lujo / Premium" },
  { value: "vacio", label: "Vaciar espacio" },
];

const tiposInterior = [
  { value: "salon", label: "Salón" },
  { value: "comedor", label: "Comedor" },
  { value: "cocina", label: "Cocina" },
  { value: "dormitorio", label: "Dormitorio" },
  { value: "bano", label: "Baño" },
  { value: "aseo", label: "Aseo" },
  { value: "garaje", label: "Garaje" },
  { value: "trastero", label: "Trastero" },
  { value: "oficina", label: "Oficina / Despacho" },
  { value: "pasillo", label: "Pasillo / Recibidor" },
];

const tiposExterior = [
  { value: "fachada", label: "Fachada" },
  { value: "quincho", label: "Quincho / Parrilla" },
  { value: "jardin", label: "Jardín" },
  { value: "piscina", label: "Piscina" },
  { value: "zonas-comunes", label: "Zonas comunes" },
  { value: "parque-infantil", label: "Parque de juegos infantiles" },
  { value: "terraza", label: "Terraza / Balcón" },
  { value: "patio", label: "Patio" },
];

const HomeStagingPage = () => {
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

  const usageCost = quality === "premium" ? 3 : 1;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, sube una imagen válida.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setOriginalImage(ev.target?.result as string);
      setResultImage(null);
      setShowComparison(false);
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!originalImage) {
      toast.error("Sube una imagen primero.");
      return;
    }

    // Check usage limits (trial or paid monthly)
    const check = canUseTool("home-staging", usageCost);
    if (!check.allowed) {
      if (!trial.isPaid && trial.isTrialExpired) {
        toast.error("Tu período de prueba ha expirado. Activá tu plan para seguir usando las herramientas.");
      } else if (trial.isPaid) {
        toast.error(`Has alcanzado el límite mensual de Home Staging (${check.used}/${check.max} usos).`);
      } else {
        toast.error(`Has alcanzado el límite ${check.limitType === "daily" ? "diario" : "total"} para esta herramienta (${check.used}/${check.max}).`);
      }
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

        // Log usage (costs 1 or 3 depending on quality)
        for (let i = 0; i < usageCost; i++) {
          await logUsage("home-staging");
        }

        toast.success("¡Home staging generado con éxito!");
      } else {
        throw new Error("No se recibió imagen del servidor.");
      }
    } catch (e: any) {
      toast.error(e.message || "Error al generar home staging.");
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
        <h1 className="text-2xl font-semibold">Home Staging IA</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Foto de la habitación</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full mt-1.5 h-auto py-6 border-dashed flex flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {originalImage ? "Cambiar imagen" : "Subir imagen (máx 10MB)"}
                </span>
              </Button>
              {originalImage && !showComparison && (
                <div className="mt-3 rounded-lg overflow-hidden border border-border">
                  <img src={originalImage} alt="Original" className="w-full h-auto" />
                </div>
              )}
            </div>

            <div>
              <Label>Tipo de espacio</Label>
              <Select value={tipoEspacio} onValueChange={(v: "interior" | "exterior") => {
                setTipoEspacio(v);
                setEstancia(v === "interior" ? "salon" : "fachada");
              }}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interior">Interior</SelectItem>
                  <SelectItem value="exterior">Exterior</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo de estancia</Label>
              <Select value={estancia} onValueChange={setEstancia}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(tipoEspacio === "interior" ? tiposInterior : tiposExterior).map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estilo de decoración</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {estilos.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Calidad de generación</Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <Button
                  type="button"
                  variant={quality === "fast" ? "default" : "outline"}
                  className={`h-auto py-3 flex flex-col gap-1 ${quality === "fast" ? "" : "border-border"}`}
                  onClick={() => setQuality("fast")}
                >
                  <Zap className="h-4 w-4" />
                  <span className="text-xs font-medium">Rápida</span>
                  <span className="text-[10px] text-muted-foreground">1 uso</span>
                </Button>
                <Button
                  type="button"
                  variant={quality === "premium" ? "default" : "outline"}
                  className={`h-auto py-3 flex flex-col gap-1 ${quality === "premium" ? "bg-gradient-to-r from-primary to-accent border-0" : "border-border"}`}
                  onClick={() => setQuality("premium")}
                >
                  <Crown className="h-4 w-4" />
                  <span className="text-xs font-medium">Premium</span>
                  <span className="text-[10px] text-muted-foreground">3 usos</span>
                </Button>
              </div>
            </div>

            <div>
              <Label>Instrucciones adicionales (opcional)</Label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ej: Añade una chimenea moderna, cambia el suelo a madera clara, pon cortinas blancas..."
                className="mt-1.5 min-h-[80px] text-sm"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">{customPrompt.length}/500</p>
            </div>

            <Button onClick={generate} className="w-full" disabled={loading || !originalImage}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" /> Generar Home Staging
                </>
              )}
            </Button>

            {loading && (
              <p className="text-xs text-muted-foreground text-center">
                Esto puede tardar 15-30 segundos...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2">
          {showComparison && originalImage && resultImage ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Comparación</span>
                </div>
                <Button variant="outline" size="sm" onClick={downloadImage}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Descargar
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="glass-card overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">Original</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <img src={originalImage} alt="Original" className="w-full h-auto rounded-lg" />
                  </CardContent>
                </Card>
                <Card className="glass-card overflow-hidden border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-primary">Home Staging IA</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <img src={resultImage} alt="Home Staging" className="w-full h-auto rounded-lg" />
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="glass-card h-full flex items-center justify-center min-h-[300px]">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm mb-1">Sube una foto de una habitación</p>
                <p className="text-xs opacity-60">
                  La IA redecorará el espacio manteniendo la estructura original
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeStagingPage;
