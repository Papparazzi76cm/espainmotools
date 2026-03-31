import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, ArrowDown, ArrowUp, Info, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";
import { useToolHistory } from "@/hooks/useToolHistory";
import { ToolHistoryPanel } from "@/components/ToolHistoryPanel";
import { useInmoAI } from "@/hooks/useInmoAI";

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
  const [tab, setTab] = useState("comprador");

  // Comprador state
  const [precio, setPrecio] = useState("");
  const [comunidad, setComunidad] = useState("general");
  const [esObraNueva, setEsObraNueva] = useState(false);
  const [resultadoComprador, setResultadoComprador] = useState<{
    impuestos: number; impuestoLabel: string; notaria: number; registro: number; gestoria: number; total: number;
  } | null>(null);

  // Vendedor state
  const [precioVenta, setPrecioVenta] = useState("");
  const [precioAdquisicion, setPrecioAdquisicion] = useState("");
  const [anioAdquisicion, setAnioAdquisicion] = useState("");
  const [comunidadVendedor, setComunidadVendedor] = useState("general");
  const [comision, setComision] = useState("3");
  const [resultadoVendedor, setResultadoVendedor] = useState<any>(null);

  const { history, loading: histLoading, saveResult, deleteEntry } = useToolHistory("costes");
  const { generate, loading: aiLoading } = useInmoAI();

  const fmt = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const calcularComprador = () => {
    const p = parseFloat(precio);
    if (!p || p <= 0) return;
    const ccaa = comunidades.find(c => c.value === comunidad);
    const itpPct = ccaa?.itp || 0.06;
    let impuestosComprador: number;
    let impuestoLabel: string;
    if (esObraNueva) {
      impuestosComprador = p * 0.10 + p * 0.015;
      impuestoLabel = "IVA (10%) + AJD (~1,5%)";
    } else {
      impuestosComprador = p * itpPct;
      impuestoLabel = `ITP (${(itpPct * 100).toFixed(0)}% - ${ccaa?.label || "General"})`;
    }
    const notaria = Math.max(p * 0.004, 600);
    const registro = Math.max(p * 0.002, 400);
    const gestoria = 400;
    const res = { impuestos: impuestosComprador, impuestoLabel, notaria, registro, gestoria, total: impuestosComprador + notaria + registro + gestoria };
    setResultadoComprador(res);
    saveResult(`Comprador — ${fmt(p)} — ${ccaa?.label || "General"}`, { tipo: "comprador", precio: p, comunidad, esObraNueva }, res);
  };

  const calcularVendedor = async () => {
    const pVenta = parseFloat(precioVenta);
    const pAdq = parseFloat(precioAdquisicion);
    const anio = parseInt(anioAdquisicion);
    if (!pVenta || pVenta <= 0) return;
    const ccaa = comunidades.find(c => c.value === comunidadVendedor);
    const comPct = parseFloat(comision) / 100;
    const comisionMonto = pVenta * comPct;

    if (pAdq && anio) {
      // Use AI for precise calculation
      const aiResult = await generate("costes-vendedor", {
        precio_venta: String(pVenta),
        precio_adquisicion: String(pAdq),
        anio_adquisicion: String(anio),
        comunidad: ccaa?.label || "General",
        comision: String(comPct * 100),
      });
      if (aiResult) {
        const res = {
          ...aiResult,
          comision: comisionMonto,
          total: (aiResult.irpf_importe || 0) + (aiResult.plusvalia_estimada || 0) + comisionMonto,
          usedAI: true,
        };
        setResultadoVendedor(res);
        saveResult(`Vendedor — ${fmt(pVenta)} — ${ccaa?.label || "General"}`, { tipo: "vendedor", precioVenta: pVenta, precioAdquisicion: pAdq, anioAdquisicion: anio, comunidad: comunidadVendedor, comision }, res);
      }
    } else {
      // Fallback simple calculation
      const plusvalia = pVenta * 0.02;
      const irpf = pVenta * 0.03;
      const res = {
        plusvalia_estimada: plusvalia,
        plusvalia_detalle: "Estimación genérica (2% del precio de venta). Introduce el año y precio de adquisición para un cálculo más preciso.",
        irpf_importe: irpf,
        irpf_detalle: "Estimación genérica (3% del precio de venta). Introduce los datos de adquisición para calcular la ganancia patrimonial real.",
        comision: comisionMonto,
        total: plusvalia + irpf + comisionMonto,
        usedAI: false,
      };
      setResultadoVendedor(res);
      saveResult(`Vendedor — ${fmt(pVenta)} — ${ccaa?.label || "General"}`, { tipo: "vendedor", precioVenta: pVenta, comunidad: comunidadVendedor, comision }, res);
    }
  };

  const handleLoadHistory = (entry: any) => {
    const input = entry.input_data;
    if (input?.tipo === "comprador") {
      setTab("comprador");
      setResultadoComprador(entry.result_data);
    } else if (input?.tipo === "vendedor") {
      setTab("vendedor");
      setResultadoVendedor(entry.result_data);
    } else {
      // Legacy entries
      setTab("comprador");
      setResultadoComprador(entry.result_data?.comprador || entry.result_data);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="costes" />
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">Calculadora de Costes</h1>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="comprador" className="flex items-center gap-2">
            <ArrowDown className="h-4 w-4" /> Coste Comprador
          </TabsTrigger>
          <TabsTrigger value="vendedor" className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4" /> Coste Vendedor
          </TabsTrigger>
        </TabsList>

        {/* COMPRADOR */}
        <TabsContent value="comprador">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card className="glass-card">
                <CardHeader><CardTitle className="text-base">Datos de la Operación</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Precio del inmueble (€)</Label><Input type="number" placeholder="250.000" value={precio} onChange={(e) => setPrecio(e.target.value)} /></div>
                  <div>
                    <Label>Comunidad Autónoma</Label>
                    <Select value={comunidad} onValueChange={setComunidad}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{comunidades.map(c => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="obraNueva" checked={esObraNueva} onChange={(e) => setEsObraNueva(e.target.checked)} className="rounded border-border" />
                    <Label htmlFor="obraNueva" className="cursor-pointer text-sm">Obra nueva (IVA en vez de ITP)</Label>
                  </div>
                  <Button onClick={calcularComprador} className="w-full">Calcular Costes</Button>
                </CardContent>
              </Card>
              <ToolHistoryPanel history={history} loading={histLoading} onLoad={handleLoadHistory} onDelete={deleteEntry} />
            </div>
            {resultadoComprador ? (
              <Card className="glass-card">
                <CardHeader className="pb-2"><div className="flex items-center gap-2"><ArrowDown className="h-4 w-4 text-primary" /><CardTitle className="text-base">Costes del Comprador</CardTitle></div></CardHeader>
                <CardContent className="space-y-3">
                  <CostLine label={resultadoComprador.impuestoLabel} value={resultadoComprador.impuestos} fmt={fmt} />
                  <CostLine label="Notaría" value={resultadoComprador.notaria} fmt={fmt} />
                  <CostLine label="Registro de la Propiedad" value={resultadoComprador.registro} fmt={fmt} />
                  <CostLine label="Gestoría" value={resultadoComprador.gestoria} fmt={fmt} />
                  <Separator />
                  <div className="flex justify-between font-semibold"><span>Total</span><span className="text-primary">{fmt(resultadoComprador.total)}</span></div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Calculator className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Introduce el precio y pulsa "Calcular" para ver el desglose de costes del comprador.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* VENDEDOR */}
        <TabsContent value="vendedor">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card className="glass-card">
                <CardHeader><CardTitle className="text-base">Datos de la Venta</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Precio de venta (€)</Label><Input type="number" placeholder="300.000" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} /></div>
                  <div>
                    <Label>Comunidad Autónoma</Label>
                    <Select value={comunidadVendedor} onValueChange={setComunidadVendedor}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{comunidades.map(c => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Comisión inmobiliaria (%)</Label><Input type="number" placeholder="3" value={comision} onChange={(e) => setComision(e.target.value)} /></div>
                  <Separator />
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-start gap-2 mb-3">
                      <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">Introduce los datos de adquisición para que la IA calcule con precisión el IRPF por ganancia patrimonial y la plusvalía municipal.</p>
                    </div>
                    <div className="space-y-3">
                      <div><Label>Año de adquisición</Label><Input type="number" placeholder="2015" value={anioAdquisicion} onChange={(e) => setAnioAdquisicion(e.target.value)} /></div>
                      <div><Label>Precio de adquisición (€)</Label><Input type="number" placeholder="180.000" value={precioAdquisicion} onChange={(e) => setPrecioAdquisicion(e.target.value)} /></div>
                    </div>
                  </div>
                  <Button onClick={calcularVendedor} className="w-full" disabled={aiLoading}>
                    {aiLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Calculando con IA...</> : "Calcular Costes"}
                  </Button>
                </CardContent>
              </Card>
              <ToolHistoryPanel history={history} loading={histLoading} onLoad={handleLoadHistory} onDelete={deleteEntry} />
            </div>
            {resultadoVendedor ? (
              <Card className="glass-card">
                <CardHeader className="pb-2"><div className="flex items-center gap-2"><ArrowUp className="h-4 w-4 text-primary" /><CardTitle className="text-base">Costes del Vendedor</CardTitle></div></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <CostLine label="IRPF — Ganancia patrimonial" value={resultadoVendedor.irpf_importe} fmt={fmt} />
                    {resultadoVendedor.irpf_detalle && <p className="text-xs text-muted-foreground pl-1">{resultadoVendedor.irpf_detalle}</p>}
                  </div>
                  <div className="space-y-1">
                    <CostLine label="Plusvalía municipal (est.)" value={resultadoVendedor.plusvalia_estimada} fmt={fmt} />
                    {resultadoVendedor.plusvalia_detalle && <p className="text-xs text-muted-foreground pl-1">{resultadoVendedor.plusvalia_detalle}</p>}
                  </div>
                  <CostLine label="Comisión inmobiliaria" value={resultadoVendedor.comision} fmt={fmt} />
                  <Separator />
                  <div className="flex justify-between font-semibold"><span>Total estimado</span><span className="text-primary">{fmt(resultadoVendedor.total)}</span></div>
                  {resultadoVendedor.usedAI && (
                    <div className="p-2 rounded bg-primary/10 border border-primary/20">
                      <p className="text-xs text-primary">✨ Cálculo realizado con IA basado en los datos de adquisición proporcionados.</p>
                    </div>
                  )}
                  {resultadoVendedor.notas && <p className="text-xs text-muted-foreground mt-2">{resultadoVendedor.notas}</p>}
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Calculator className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Introduce los datos de la venta y pulsa "Calcular" para ver el desglose de costes del vendedor.</p>
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border text-left">
                    <div className="flex items-start gap-2"><Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><p className="text-xs text-muted-foreground">Si indicas el año y precio de compra, la IA calculará con más precisión el IRPF y la plusvalía.</p></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function CostLine({ label, value, fmt }: { label: string; value: number; fmt: (n: number) => string }) {
  return (<div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span>{fmt(value)}</span></div>);
}

export default CostesPage;
