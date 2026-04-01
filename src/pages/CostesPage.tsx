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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [tab, setTab] = useState("comprador");
  const [precio, setPrecio] = useState("");
  const [comunidad, setComunidad] = useState("general");
  const [esObraNueva, setEsObraNueva] = useState(false);
  const [resultadoComprador, setResultadoComprador] = useState<{ impuestos: number; impuestoLabel: string; notaria: number; registro: number; gestoria: number; total: number; } | null>(null);
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
    if (esObraNueva) { impuestosComprador = p * 0.10 + p * 0.015; impuestoLabel = "IVA (10%) + AJD (~1,5%)"; }
    else { impuestosComprador = p * itpPct; impuestoLabel = `ITP (${(itpPct * 100).toFixed(0)}% - ${ccaa?.label || "General"})`; }
    const notaria = Math.max(p * 0.004, 600);
    const registro = Math.max(p * 0.002, 400);
    const gestoria = 400;
    const res = { impuestos: impuestosComprador, impuestoLabel, notaria, registro, gestoria, total: impuestosComprador + notaria + registro + gestoria };
    setResultadoComprador(res);
    saveResult(`${t("costes.buyerCost")} — ${fmt(p)} — ${ccaa?.label || "General"}`, { tipo: "comprador", precio: p, comunidad, esObraNueva }, res);
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
      const aiResult = await generate("costes-vendedor", { precio_venta: String(pVenta), precio_adquisicion: String(pAdq), anio_adquisicion: String(anio), comunidad: ccaa?.label || "General", comision: String(comPct * 100) });
      if (aiResult) {
        const res = { ...aiResult, comision: comisionMonto, total: (aiResult.irpf_importe || 0) + (aiResult.plusvalia_estimada || 0) + comisionMonto, usedAI: true };
        setResultadoVendedor(res);
        saveResult(`${t("costes.sellerCost")} — ${fmt(pVenta)} — ${ccaa?.label || "General"}`, { tipo: "vendedor", precioVenta: pVenta, precioAdquisicion: pAdq, anioAdquisicion: anio, comunidad: comunidadVendedor, comision }, res);
      }
    } else {
      const plusvalia = pVenta * 0.02;
      const irpf = pVenta * 0.03;
      const res = { plusvalia_estimada: plusvalia, plusvalia_detalle: "", irpf_importe: irpf, irpf_detalle: "", comision: comisionMonto, total: plusvalia + irpf + comisionMonto, usedAI: false };
      setResultadoVendedor(res);
      saveResult(`${t("costes.sellerCost")} — ${fmt(pVenta)} — ${ccaa?.label || "General"}`, { tipo: "vendedor", precioVenta: pVenta, comunidad: comunidadVendedor, comision }, res);
    }
  };

  const handleLoadHistory = (entry: any) => {
    const input = entry.input_data;
    if (input?.tipo === "comprador") { setTab("comprador"); setResultadoComprador(entry.result_data); }
    else if (input?.tipo === "vendedor") { setTab("vendedor"); setResultadoVendedor(entry.result_data); }
    else { setTab("comprador"); setResultadoComprador(entry.result_data?.comprador || entry.result_data); }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="costes" />
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">{t("costes.title")}</h1>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="comprador" className="flex items-center gap-2"><ArrowDown className="h-4 w-4" /> {t("costes.buyerCost")}</TabsTrigger>
          <TabsTrigger value="vendedor" className="flex items-center gap-2"><ArrowUp className="h-4 w-4" /> {t("costes.sellerCost")}</TabsTrigger>
        </TabsList>
        <TabsContent value="comprador">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card className="glass-card">
                <CardHeader><CardTitle className="text-base">{t("costes.operationData")}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>{t("costes.propertyPrice")}</Label><Input type="number" placeholder="250.000" value={precio} onChange={(e) => setPrecio(e.target.value)} /></div>
                  <div>
                    <Label>{t("costes.autonomousCommunity")}</Label>
                    <Select value={comunidad} onValueChange={setComunidad}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{comunidades.map(c => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="obraNueva" checked={esObraNueva} onChange={(e) => setEsObraNueva(e.target.checked)} className="rounded border-border" />
                    <Label htmlFor="obraNueva" className="cursor-pointer text-sm">{t("costes.newBuild")}</Label>
                  </div>
                  <Button onClick={calcularComprador} className="w-full">{t("costes.calculateButton")}</Button>
                </CardContent>
              </Card>
              <ToolHistoryPanel history={history} loading={histLoading} onLoad={handleLoadHistory} onDelete={deleteEntry} />
            </div>
            {resultadoComprador ? (
              <Card className="glass-card">
                <CardHeader className="pb-2"><div className="flex items-center gap-2"><ArrowDown className="h-4 w-4 text-primary" /><CardTitle className="text-base">{t("costes.buyerCosts")}</CardTitle></div></CardHeader>
                <CardContent className="space-y-3">
                  <CostLine label={resultadoComprador.impuestoLabel} value={resultadoComprador.impuestos} fmt={fmt} />
                  <CostLine label={t("costes.notary")} value={resultadoComprador.notaria} fmt={fmt} />
                  <CostLine label={t("costes.propertyRegistry")} value={resultadoComprador.registro} fmt={fmt} />
                  <CostLine label={t("costes.management")} value={resultadoComprador.gestoria} fmt={fmt} />
                  <Separator />
                  <div className="flex justify-between font-semibold"><span>{t("costes.total")}</span><span className="text-primary">{fmt(resultadoComprador.total)}</span></div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground">
                <Calculator className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">{t("costes.emptyBuyer")}</p>
              </CardContent></Card>
            )}
          </div>
        </TabsContent>
        <TabsContent value="vendedor">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card className="glass-card">
                <CardHeader><CardTitle className="text-base">{t("costes.saleData")}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>{t("costes.salePrice")}</Label><Input type="number" placeholder="300.000" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} /></div>
                  <div>
                    <Label>{t("costes.autonomousCommunity")}</Label>
                    <Select value={comunidadVendedor} onValueChange={setComunidadVendedor}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{comunidades.map(c => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>{t("costes.agencyCommission")}</Label><Input type="number" placeholder="3" value={comision} onChange={(e) => setComision(e.target.value)} /></div>
                  <Separator />
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-start gap-2 mb-3"><Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><p className="text-xs text-muted-foreground">{t("costes.acquisitionInfo")}</p></div>
                    <div className="space-y-3">
                      <div><Label>{t("costes.acquisitionYear")}</Label><Input type="number" placeholder="2015" value={anioAdquisicion} onChange={(e) => setAnioAdquisicion(e.target.value)} /></div>
                      <div><Label>{t("costes.acquisitionPrice")}</Label><Input type="number" placeholder="180.000" value={precioAdquisicion} onChange={(e) => setPrecioAdquisicion(e.target.value)} /></div>
                    </div>
                  </div>
                  <Button onClick={calcularVendedor} className="w-full" disabled={aiLoading}>
                    {aiLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("costes.calculatingAI")}</> : t("costes.calculateButton")}
                  </Button>
                </CardContent>
              </Card>
              <ToolHistoryPanel history={history} loading={histLoading} onLoad={handleLoadHistory} onDelete={deleteEntry} />
            </div>
            {resultadoVendedor ? (
              <Card className="glass-card">
                <CardHeader className="pb-2"><div className="flex items-center gap-2"><ArrowUp className="h-4 w-4 text-primary" /><CardTitle className="text-base">{t("costes.sellerCosts")}</CardTitle></div></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <CostLine label={t("costes.irpfLabel")} value={resultadoVendedor.irpf_importe} fmt={fmt} />
                    {resultadoVendedor.irpf_detalle && <p className="text-xs text-muted-foreground pl-1">{resultadoVendedor.irpf_detalle}</p>}
                  </div>
                  <div className="space-y-1">
                    <CostLine label={t("costes.municipalSurplus")} value={resultadoVendedor.plusvalia_estimada} fmt={fmt} />
                    {resultadoVendedor.plusvalia_detalle && <p className="text-xs text-muted-foreground pl-1">{resultadoVendedor.plusvalia_detalle}</p>}
                  </div>
                  <CostLine label={t("costes.agencyCommissionLabel")} value={resultadoVendedor.comision} fmt={fmt} />
                  <Separator />
                  <div className="flex justify-between font-semibold"><span>{t("costes.totalEstimated")}</span><span className="text-primary">{fmt(resultadoVendedor.total)}</span></div>
                  {resultadoVendedor.usedAI && (
                    <div className="p-2 rounded bg-primary/10 border border-primary/20"><p className="text-xs text-primary">{t("costes.aiCalculation")}</p></div>
                  )}
                  {resultadoVendedor.notas && <p className="text-xs text-muted-foreground mt-2">{resultadoVendedor.notas}</p>}
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground">
                <Calculator className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">{t("costes.emptySeller")}</p>
                <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border text-left">
                  <div className="flex items-start gap-2"><Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><p className="text-xs text-muted-foreground">{t("costes.emptySellerTip")}</p></div>
                </div>
              </CardContent></Card>
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
