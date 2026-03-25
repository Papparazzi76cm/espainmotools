import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, ArrowDown, ArrowUp, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";

const comunidades = [
  { value: "general", label: "General (tipo medio)", itp: 0.06 },
  { value: "andalucia", label: "Andalucía", itp: 0.07 },
  { value: "aragon", label: "Aragón", itp: 0.08 },
  { value: "asturias", label: "Asturias", itp: 0.08 },
  { value: "baleares", label: "Islas Baleares", itp: 0.08 },
  { value: "canarias", label: "Canarias", itp: 0.065 },
  { value: "cantabria", label: "Cantabria", itp: 0.10 },
  { value: "castilla_leon", label: "Castilla y León", itp: 0.08 },
  { value: "castilla_mancha", label: "Castilla-La Mancha", itp: 0.09 },
  { value: "cataluna", label: "Cataluña", itp: 0.10 },
  { value: "extremadura", label: "Extremadura", itp: 0.08 },
  { value: "galicia", label: "Galicia", itp: 0.09 },
  { value: "madrid", label: "Comunidad de Madrid", itp: 0.06 },
  { value: "murcia", label: "Región de Murcia", itp: 0.08 },
  { value: "navarra", label: "Navarra", itp: 0.06 },
  { value: "pais_vasco", label: "País Vasco", itp: 0.04 },
  { value: "rioja", label: "La Rioja", itp: 0.07 },
  { value: "valencia", label: "Comunidad Valenciana", itp: 0.10 },
];

const CostesPage = () => {
  const [precio, setPrecio] = useState("");
  const [operacion, setOperacion] = useState("compraventa");
  const [comunidad, setComunidad] = useState("general");
  const [esObraNueva, setEsObraNueva] = useState(false);
  const [comision, setComision] = useState("3");
  const [resultado, setResultado] = useState<{
    comprador: { impuestos: number; impuestoLabel: string; notaria: number; registro: number; gestoria: number; total: number };
    vendedor: { plusvalia: number; irpf: number; comision: number; total: number };
  } | null>(null);

  const calcular = () => {
    const p = parseFloat(precio);
    if (!p || p <= 0) return;

    const comPct = parseFloat(comision) / 100;
    const ccaa = comunidades.find(c => c.value === comunidad);
    const itpPct = ccaa?.itp || 0.06;

    // Costes del comprador (España)
    let impuestosComprador: number;
    let impuestoLabel: string;
    if (esObraNueva) {
      // Obra nueva: IVA 10% + AJD ~1.5%
      impuestosComprador = p * 0.10 + p * 0.015;
      impuestoLabel = "IVA (10%) + AJD (~1,5%)";
    } else {
      // Segunda mano: ITP (varía por CCAA)
      impuestosComprador = p * itpPct;
      impuestoLabel = `ITP (${(itpPct * 100).toFixed(0)}% - ${ccaa?.label || "General"})`;
    }
    // Notaría: ~0.3-0.5% del precio
    const notaria = Math.max(p * 0.004, 600);
    // Registro de la Propiedad: ~0.1-0.25%
    const registro = Math.max(p * 0.002, 400);
    // Gestoría: tarifa fija aprox
    const gestoria = 400;

    // Costes del vendedor
    // Plusvalía municipal (estimación)
    const plusvalia = p * 0.02;
    // IRPF sobre ganancia patrimonial (estimación ~19-23%)
    const irpf = p * 0.03;
    const comisionMonto = p * comPct;

    setResultado({
      comprador: {
        impuestos: impuestosComprador,
        impuestoLabel,
        notaria,
        registro,
        gestoria,
        total: impuestosComprador + notaria + registro + gestoria,
      },
      vendedor: {
        plusvalia,
        irpf,
        comision: comisionMonto,
        total: plusvalia + irpf + comisionMonto,
      },
    });
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="costes" />
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">Calculadora de Costes</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Datos de la Operación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Precio del inmueble (€)</Label>
              <Input type="number" placeholder="250.000" value={precio} onChange={(e) => setPrecio(e.target.value)} />
            </div>
            <div>
              <Label>Tipo de operación</Label>
              <Select value={operacion} onValueChange={setOperacion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compraventa">Compraventa</SelectItem>
                  <SelectItem value="alquiler">Alquiler</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Comunidad Autónoma</Label>
              <Select value={comunidad} onValueChange={setComunidad}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {comunidades.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="obraNueva"
                checked={esObraNueva}
                onChange={(e) => setEsObraNueva(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="obraNueva" className="cursor-pointer text-sm">Obra nueva (IVA en vez de ITP)</Label>
            </div>
            <div>
              <Label>Comisión inmobiliaria (%)</Label>
              <Input type="number" placeholder="3" value={comision} onChange={(e) => setComision(e.target.value)} />
            </div>
            <Button onClick={calcular} className="w-full">
              Calcular Costes
            </Button>
          </CardContent>
        </Card>

        {resultado ? (
          <>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Comprador</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CostLine label={resultado.comprador.impuestoLabel} value={resultado.comprador.impuestos} fmt={fmt} />
                <CostLine label="Notaría" value={resultado.comprador.notaria} fmt={fmt} />
                <CostLine label="Registro de la Propiedad" value={resultado.comprador.registro} fmt={fmt} />
                <CostLine label="Gestoría" value={resultado.comprador.gestoria} fmt={fmt} />
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <div className="text-right">
                    <div className="text-primary">{fmt(resultado.comprador.total)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Vendedor</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CostLine label="Plusvalía municipal (est.)" value={resultado.vendedor.plusvalia} fmt={fmt} />
                <CostLine label="IRPF ganancia patrimonial (est.)" value={resultado.vendedor.irpf} fmt={fmt} />
                <CostLine label="Comisión inmobiliaria" value={resultado.vendedor.comision} fmt={fmt} />
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <div className="text-right">
                    <div className="text-primary">{fmt(resultado.vendedor.total)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="glass-card lg:col-span-2">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Calculator className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Introduce el precio y pulsa "Calcular" para ver el desglose de costes.</p>
              <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border text-left">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Los cálculos son estimaciones basadas en la fiscalidad española vigente. El ITP varía según la Comunidad Autónoma. Consulta con un asesor fiscal para datos exactos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

function CostLine({
  label,
  value,
  fmt,
}: {
  label: string;
  value: number;
  fmt: (n: number) => string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right">
        <div>{fmt(value)}</div>
      </div>
    </div>
  );
}

export default CostesPage;
