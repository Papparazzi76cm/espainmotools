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

const DescripcionesPage = () => {
  const [tipo, setTipo] = useState("");
  const [estilo, setEstilo] = useState("comercial");
  const [habitaciones, setHabitaciones] = useState("");
  const [superficie, setSuperficie] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [extras, setExtras] = useState("");
  const [resultado, setResultado] = useState<{ corta: string; larga: string; redes: string } | null>(null);
  const { generate, loading } = useInmoAI();

  const generar = async () => {
    const result = await generate("descripciones", {
      tipo, estilo, habitaciones, superficie, ubicacion, extras,
    });
    if (result) {
      setResultado({
        corta: result.corta || "",
        larga: result.larga || "",
        redes: result.redes || "",
      });
    }
  };

  const copiar = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiada al portapapeles`);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="descripciones" />
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">Generador de Descripciones</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Datos del Inmueble</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tipo de inmueble</Label>
              <Input placeholder="Casa, departamento, terreno..." value={tipo} onChange={(e) => setTipo(e.target.value)} />
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

        <div className="space-y-4">
          {resultado ? (
            <>
              <ResultCard title="Versión Corta" text={resultado.corta} onCopy={() => copiar(resultado.corta, "Versión corta")} />
              <ResultCard title="Versión Larga" text={resultado.larga} onCopy={() => copiar(resultado.larga, "Versión larga")} />
              <ResultCard title="Redes Sociales" text={resultado.redes} onCopy={() => copiar(resultado.redes, "Versión redes")} />
            </>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Completa los datos y presiona "Generar" para crear descripciones con IA.</p>
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
