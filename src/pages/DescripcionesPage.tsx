import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, FileText, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useInmoAI } from "@/hooks/useInmoAI";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";

const estilos = [
  { value: "formal", label: "Formal" },
  { value: "comercial", label: "Comercial" },
  { value: "directo", label: "Directo" },
  { value: "emocional", label: "Emocional" },
  { value: "lujo", label: "Lujo" },
];

interface Resultado {
  corta: string;
  larga: string;
  redes: string;
  facebook: string;
  instagram: string;
  portal: string;
}

const DescripcionesPage = () => {
  const [tipo, setTipo] = useState("");
  const [estilo, setEstilo] = useState("comercial");
  const [habitaciones, setHabitaciones] = useState("");
  const [superficie, setSuperficie] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [precio, setPrecio] = useState("");
  const [extras, setExtras] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const { generate, loading } = useInmoAI();

  const generar = async () => {
    const result = await generate("descripciones", {
      tipo, estilo, habitaciones, superficie, ubicacion, precio, extras,
    });
    if (result) {
      setResultado({
        corta: result.corta || "",
        larga: result.larga || "",
        redes: result.redes || "",
        facebook: result.facebook || "",
        instagram: result.instagram || "",
        portal: result.portal || "",
      });
    }
  };

  const copiar = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiada al portapapeles`);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="descripciones" />
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">Generador de Textos</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Datos del Inmueble</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tipo de inmueble</Label>
              <Input placeholder="Casa, piso, local..." value={tipo} onChange={(e) => setTipo(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Habitaciones</Label>
                <Input type="number" placeholder="3" value={habitaciones} onChange={(e) => setHabitaciones(e.target.value)} />
              </div>
              <div>
                <Label>Superficie (m²)</Label>
                <Input type="number" placeholder="120" value={superficie} onChange={(e) => setSuperficie(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Ubicación</Label>
              <Input placeholder="Madrid, Barrio de Salamanca..." value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
            </div>
            <div>
              <Label>Precio</Label>
              <Input placeholder="250.000 €" value={precio} onChange={(e) => setPrecio(e.target.value)} />
            </div>
            <div>
              <Label>Estilo de redacción</Label>
              <Select value={estilo} onValueChange={setEstilo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {estilos.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Extras / Características</Label>
              <Textarea placeholder="Piscina, garaje doble, vista panorámica..." value={extras} onChange={(e) => setExtras(e.target.value)} rows={3} />
            </div>
            <Button onClick={generar} className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generando con IA...</> : "Generar con IA"}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {resultado ? (
            <>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Descripciones</h3>
              <ResultCard title="Versión Corta" text={resultado.corta} onCopy={() => copiar(resultado.corta, "Versión corta")} />
              <ResultCard title="Versión Larga" text={resultado.larga} onCopy={() => copiar(resultado.larga, "Versión larga")} />
              <ResultCard title="Redes Sociales" text={resultado.redes} onCopy={() => copiar(resultado.redes, "Versión redes")} />
              
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pt-2">Anuncios</h3>
              <ResultCard title="Facebook Ads" text={resultado.facebook} onCopy={() => copiar(resultado.facebook, "Facebook")} />
              <ResultCard title="Instagram" text={resultado.instagram} onCopy={() => copiar(resultado.instagram, "Instagram")} />
              <ResultCard title="Portal Inmobiliario" text={resultado.portal} onCopy={() => copiar(resultado.portal, "Portal")} />
            </>
          ) : (
            <Card className="glass-card h-full flex items-center justify-center min-h-[300px]">
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm mb-1">Genera descripciones y anuncios profesionales</p>
                <p className="text-xs opacity-60">Completa los datos y presiona "Generar" para crear textos optimizados para portales, redes sociales y más.</p>
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
        <Button variant="ghost" size="icon" onClick={onCopy} className="h-8 w-8">
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{text}</p>
      </CardContent>
    </Card>
  );
}

export default DescripcionesPage;
