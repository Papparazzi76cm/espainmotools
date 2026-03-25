import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, FileSignature, Sparkles, Loader2, Download, FileDown } from "lucide-react";
import { toast } from "sonner";
import { useInmoAI } from "@/hooks/useInmoAI";
import { useAgencyProfile } from "@/hooks/useAgencyProfile";
import { exportContratoPdf } from "@/lib/exportContratoPdf";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";

const tiposContrato = [
  { value: "compraventa", label: "Compraventa de Inmueble" },
  { value: "alquiler", label: "Contrato de Arrendamiento (LAU)" },
  { value: "arras", label: "Contrato de Arras" },
  { value: "reserva", label: "Reserva de Inmueble" },
  { value: "opcion_compra", label: "Opción de Compra" },
  { value: "cesion", label: "Cesión de Derechos" },
  { value: "permuta", label: "Permuta de Inmuebles" },
  { value: "exclusividad", label: "Contrato de Exclusividad Inmobiliaria" },
  { value: "administracion", label: "Administración de Inmueble" },
  { value: "alquiler_temporal", label: "Alquiler de Temporada" },
];

const ContratosPage = () => {
  const [tipoContrato, setTipoContrato] = useState("");
  const [partes, setPartes] = useState("");
  const [inmueble, setInmueble] = useState("");
  const [condiciones, setCondiciones] = useState("");
  const [detallesAdicionales, setDetallesAdicionales] = useState("");
  const [resultado, setResultado] = useState<{
    contrato: string;
    clausulas_clave: string[];
    base_legal: string[];
    advertencias: string[];
    resumen: string;
  } | null>(null);
  const { generate, loading } = useInmoAI();
  const { profile } = useAgencyProfile();

  const generar = async () => {
    if (!tipoContrato || !partes.trim() || !inmueble.trim()) {
      toast.error("Completá el tipo de contrato, partes e inmueble como mínimo.");
      return;
    }
    const result = await generate("contratos", {
      tipo: tipoContrato,
      partes,
      inmueble,
      condiciones,
      detalles: detallesAdicionales,
    });
    if (result) setResultado(result);
  };

  const copiar = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  };

  const descargarTxt = () => {
    if (!resultado) return;
    const blob = new Blob([resultado.contrato], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contrato_${tipoContrato}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Contrato descargado");
  };

  const descargarPdf = async () => {
    if (!resultado) return;
    await exportContratoPdf(
      resultado,
      { tipo: tipoContrato, partes, inmueble, condiciones },
      profile || undefined
    );
    toast.success("PDF descargado");
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="contratos" />
      <div className="flex items-center gap-2 mb-6">
        <FileSignature className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">Generador de Contratos</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Datos del Contrato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tipo de contrato</Label>
              <Select value={tipoContrato} onValueChange={setTipoContrato}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná el tipo de contrato" />
                </SelectTrigger>
                <SelectContent>
                  {tiposContrato.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Partes involucradas</Label>
              <Textarea
                placeholder="Ej: Vendedor: Juan Pérez, DNI 12.345.678-A. Comprador: María López, DNI 23.456.789-B..."
                value={partes}
                onChange={(e) => setPartes(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label>Descripción del inmueble</Label>
              <Textarea
                placeholder="Ej: Piso de 3 habitaciones, 90 m², situado en Calle Gran Vía 45, 3ºA, Madrid. Ref. catastral 1234567..."
                value={inmueble}
                onChange={(e) => setInmueble(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label>Condiciones económicas</Label>
              <Input
                placeholder="Ej: Precio 250.000 €, pago mediante hipoteca con 20% de entrada..."
                value={condiciones}
                onChange={(e) => setCondiciones(e.target.value)}
              />
            </div>

            <div>
              <Label>Detalles adicionales (opcional)</Label>
              <Textarea
                placeholder="Cláusulas especiales, plazos, garantías, penalidades..."
                value={detallesAdicionales}
                onChange={(e) => setDetallesAdicionales(e.target.value)}
                rows={2}
              />
            </div>

            <Button onClick={generar} className="w-full" disabled={loading || !tipoContrato}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generando contrato...
                </>
              ) : (
                "Generar Contrato con IA"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        <div className="space-y-4">
          {resultado ? (
            <>
              {/* Resumen */}
              <Card className="glass-card border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">📋 Resumen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{resultado.resumen}</p>
                </CardContent>
              </Card>

              {/* Contrato completo */}
              <Card className="glass-card">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">📄 Contrato Generado</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => copiar(resultado.contrato, "Contrato")} className="h-8 w-8">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={descargarTxt} className="h-8 w-8" title="Descargar TXT">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={descargarPdf} className="h-8 w-8" title="Descargar PDF">
                      <FileDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] overflow-y-auto">
                    <p className="text-sm whitespace-pre-line leading-relaxed">{resultado.contrato}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Cláusulas clave */}
              {resultado.clausulas_clave?.length > 0 && (
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">🔑 Cláusulas Clave</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {resultado.clausulas_clave.map((c, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Base legal */}
              {resultado.base_legal?.length > 0 && (
                <Card className="glass-card border-blue-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">⚖️ Base Legal Paraguaya</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {resultado.base_legal.map((b, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">§</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Advertencias */}
              {resultado.advertencias?.length > 0 && (
                <Card className="glass-card border-amber-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">⚠️ Advertencias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {resultado.advertencias.map((a, i) => (
                        <li key={i} className="text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2">
                          <span className="mt-0.5">!</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileSignature className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  Generá contratos inmobiliarios completos adaptados a la legislación paraguaya.
                </p>
                <p className="text-xs mt-2 text-muted-foreground/60">
                  Código Civil, Ley de Locaciones, normativa catastral y más.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContratosPage;
