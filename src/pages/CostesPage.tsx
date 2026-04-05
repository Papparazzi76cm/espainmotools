import { useState, useMemo } from "react";
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
import { useCountry } from "@/contexts/CountryContext";

const comunidadesES = [
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

// Extract a numeric tax rate from a country's tax_config
function extractTransferTaxRate(taxConfig: Record<string, string | number>): number {
  // Look for common transfer tax keys
  const transferKeys = ["transferencia", "traspaso", "isai", "alcabala", "itp", "iti"];
  for (const key of transferKeys) {
    for (const [k, v] of Object.entries(taxConfig)) {
      if (k.toLowerCase().includes(key)) {
        const num = typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.]/g, ""));
        if (!isNaN(num) && num > 0 && num < 100) return num / 100;
      }
    }
  }
  return 0.03; // fallback 3%
}

function extractVATRate(taxConfig: Record<string, string | number>): number {
  const vatKeys = ["iva", "igv", "itbms", "itbis"];
  for (const key of vatKeys) {
    for (const [k, v] of Object.entries(taxConfig)) {
      if (k.toLowerCase() === key || k.toLowerCase().startsWith(key)) {
        const num = typeof v === "number" ? v : parseFloat(String(v));
        if (!isNaN(num) && num > 0 && num < 100) return num / 100;
      }
    }
  }
  return 0.10;
}

// Build a list of tax line items from tax_config for display
function buildTaxSummary(taxConfig: Record<string, string | number>): { key: string; label: string; detail: string }[] {
  return Object.entries(taxConfig).map(([key, value]) => ({
    key,
    label: key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    detail: typeof value === "number" ? `${value}%` : String(value),
  }));
}

const CostesPage = () => {
  const { t } = useTranslation();
  const { selectedCountry } = useCountry();
  const isSpain = selectedCountry?.country_code === "es";
  const currencyCode = selectedCountry?.currency_code || "EUR";
  const currencySymbol = selectedCountry?.currency_symbol || "€";
  const countryName = selectedCountry?.country_name || "España";
  const taxConfig = (selectedCountry?.tax_config || {}) as Record<string, string | number>;

  const [tab, setTab] = useState("comprador");
  const [precio, setPrecio] = useState("");
  const [comunidad, setComunidad] = useState("general");
  const [region, setRegion] = useState("");
  const [esObraNueva, setEsObraNueva] = useState(false);
  const [resultadoComprador, setResultadoComprador] = useState<any>(null);
  const [precioVenta, setPrecioVenta] = useState("");
  const [precioAdquisicion, setPrecioAdquisicion] = useState("");
  const [anioAdquisicion, setAnioAdquisicion] = useState("");
  const [comunidadVendedor, setComunidadVendedor] = useState("general");
  const [regionVendedor, setRegionVendedor] = useState("");
  const [comision, setComision] = useState("3");
  const [resultadoVendedor, setResultadoVendedor] = useState<any>(null);
  const { history, loading: histLoading, saveResult, deleteEntry } = useToolHistory("costes");
  const { generate, loading: aiLoading } = useInmoAI();

  const fmt = useMemo(() => {
    return (n: number) => {
      try {
        return new Intl.NumberFormat("es-ES", { style: "currency", currency: currencyCode, maximumFractionDigits: 0 }).format(n);
      } catch {
        return `${currencySymbol} ${n.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`;
      }
    };
  }, [currencyCode, currencySymbol]);

  const taxSummary = useMemo(() => buildTaxSummary(taxConfig), [taxConfig]);

  const calcularComprador = () => {
    const p = parseFloat(precio);
    if (!p || p <= 0) return;

    if (isSpain) {
      const ccaa = comunidadesES.find(c => c.value === comunidad);
      const itpPct = ccaa?.itp || 0.06;
      let impuestos: number;
      let impuestoLabel: string;
      if (esObraNueva) {
        impuestos = p * 0.10 + p * 0.015;
        impuestoLabel = "IVA (10%) + AJD (~1,5%)";
      } else {
        impuestos = p * itpPct;
        impuestoLabel = `ITP (${(itpPct * 100).toFixed(0)}% - ${ccaa?.label || "General"})`;
      }
      const notaria = Math.max(p * 0.004, 600);
      const registro = Math.max(p * 0.002, 400);
      const gestoria = 400;
      const res = { impuestos, impuestoLabel, notaria, registro, gestoria, total: impuestos + notaria + registro + gestoria };
      setResultadoComprador(res);
      saveResult(`${t("costes.buyerCost")} — ${fmt(p)} — ${ccaa?.label || "General"}`, { tipo: "comprador", precio: p, comunidad, esObraNueva }, res);
    } else {
      // Generic country calculation
      const transferRate = extractTransferTaxRate(taxConfig);
      const vatRate = extractVATRate(taxConfig);
      const transferTax = esObraNueva ? p * vatRate : p * transferRate;
      const transferLabel = esObraNueva
        ? `${Object.keys(taxConfig).find(k => ["iva", "igv", "itbms", "itbis"].some(v => k.toLowerCase().includes(v)))?.toUpperCase() || "IVA"} (${(vatRate * 100).toFixed(0)}%)`
        : `Impuesto de transferencia (${(transferRate * 100).toFixed(1)}%)`;
      const notaria = Math.max(p * 0.005, 300);
      const registro = Math.max(p * 0.003, 200);
      const res = { impuestos: transferTax, impuestoLabel: transferLabel, notaria, registro, gestoria: 0, total: transferTax + notaria + registro };
      setResultadoComprador(res);
      saveResult(`${t("costes.buyerCost")} — ${fmt(p)} — ${countryName}`, { tipo: "comprador", precio: p, pais: selectedCountry?.country_code }, res);
    }
  };

  const calcularVendedor = async () => {
    const pVenta = parseFloat(precioVenta);
    const pAdq = parseFloat(precioAdquisicion);
    const anio = parseInt(anioAdquisicion);
    if (!pVenta || pVenta <= 0) return;
    const comPct = parseFloat(comision) / 100;
    const comisionMonto = pVenta * comPct;

    const regionLabel = isSpain
      ? (comunidadesES.find(c => c.value === comunidadVendedor)?.label || "General")
      : (regionVendedor || countryName);

    if (pAdq && anio) {
      const aiResult = await generate("costes-vendedor", {
        precio_venta: String(pVenta),
        precio_adquisicion: String(pAdq),
        anio_adquisicion: String(anio),
        comunidad: regionLabel,
        comision: String(comPct * 100),
      });
      if (aiResult) {
        const mainTax = aiResult.irpf_importe || aiResult.impuesto_principal_importe || 0;
        const transferTax = aiResult.plusvalia_estimada || aiResult.impuesto_transferencia_estimado || 0;
        const res = {
          ...aiResult,
          irpf_importe: mainTax,
          irpf_detalle: aiResult.irpf_detalle || aiResult.impuesto_principal_detalle || "",
          plusvalia_estimada: transferTax,
          plusvalia_detalle: aiResult.plusvalia_detalle || aiResult.impuesto_transferencia_detalle || "",
          otros_costes: aiResult.otros_costes || "",
          comision: comisionMonto,
          total: mainTax + transferTax + comisionMonto,
          usedAI: true,
        };
        setResultadoVendedor(res);
        saveResult(`${t("costes.sellerCost")} — ${fmt(pVenta)} — ${regionLabel}`, { tipo: "vendedor", precioVenta: pVenta, precioAdquisicion: pAdq, anioAdquisicion: anio, region: regionLabel, comision }, res);
      }
    } else {
      const plusvalia = pVenta * 0.02;
      const irpf = pVenta * 0.03;
      const res = { plusvalia_estimada: plusvalia, plusvalia_detalle: "", irpf_importe: irpf, irpf_detalle: "", comision: comisionMonto, total: plusvalia + irpf + comisionMonto, usedAI: false };
      setResultadoVendedor(res);
      saveResult(`${t("costes.sellerCost")} — ${fmt(pVenta)} — ${regionLabel}`, { tipo: "vendedor", precioVenta: pVenta, region: regionLabel, comision }, res);
    }
  };

  const handleLoadHistory = (entry: any) => {
    const input = entry.input_data;
    if (input?.tipo === "comprador") { setTab("comprador"); setResultadoComprador(entry.result_data); }
    else if (input?.tipo === "vendedor") { setTab("vendedor"); setResultadoVendedor(entry.result_data); }
    else { setTab("comprador"); setResultadoComprador(entry.result_data?.comprador || entry.result_data); }
  };

  // Labels for seller results adapt to country
  const mainTaxLabel = isSpain ? t("costes.irpfLabel") : t("costes.mainTaxLabel", { defaultValue: "Impuesto sobre la ganancia" });
  const transferTaxLabel = isSpain ? t("costes.municipalSurplus") : t("costes.transferTaxLabel", { defaultValue: "Impuesto de transferencia" });
  const regionFieldLabel = isSpain ? t("costes.autonomousCommunity") : t("costes.regionLabel", { defaultValue: "Región / Estado / Provincia" });

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="costes" />
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">{t("costes.title")}</h1>
      </div>
      {/* Country tax reference */}
      {!isSpain && taxSummary.length > 0 && (
        <div className="mb-6 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-start gap-2 mb-2">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs font-medium">{t("costes.taxReference", { country: countryName, defaultValue: `Referencia fiscal de ${countryName}` })}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {taxSummary.map(item => (
              <p key={item.key} className="text-xs text-muted-foreground">
                <span className="font-medium">{item.label}:</span> {item.detail}
              </p>
            ))}
          </div>
        </div>
      )}
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
                  <div><Label>{t("costes.propertyPrice")} ({currencySymbol})</Label><Input type="number" placeholder="250000" value={precio} onChange={(e) => setPrecio(e.target.value)} /></div>
                  {isSpain ? (
                    <>
                      <div>
                        <Label>{regionFieldLabel}</Label>
                        <Select value={comunidad} onValueChange={setComunidad}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{comunidadesES.map(c => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="obraNueva" checked={esObraNueva} onChange={(e) => setEsObraNueva(e.target.checked)} className="rounded border-border" />
                        <Label htmlFor="obraNueva" className="cursor-pointer text-sm">{t("costes.newBuild")}</Label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label>{regionFieldLabel}</Label>
                        <Input placeholder={t("costes.regionPlaceholder", { defaultValue: "Ej: Ciudad de México, Bogotá..." })} value={region} onChange={(e) => setRegion(e.target.value)} />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="obraNueva" checked={esObraNueva} onChange={(e) => setEsObraNueva(e.target.checked)} className="rounded border-border" />
                        <Label htmlFor="obraNueva" className="cursor-pointer text-sm">{t("costes.newBuild")}</Label>
                      </div>
                    </>
                  )}
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
                  {resultadoComprador.gestoria > 0 && <CostLine label={t("costes.management")} value={resultadoComprador.gestoria} fmt={fmt} />}
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
                  <div><Label>{t("costes.salePrice")} ({currencySymbol})</Label><Input type="number" placeholder="300000" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} /></div>
                  {isSpain ? (
                    <div>
                      <Label>{regionFieldLabel}</Label>
                      <Select value={comunidadVendedor} onValueChange={setComunidadVendedor}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{comunidadesES.map(c => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div>
                      <Label>{regionFieldLabel}</Label>
                      <Input placeholder={t("costes.regionPlaceholder", { defaultValue: "Ej: Ciudad de México, Bogotá..." })} value={regionVendedor} onChange={(e) => setRegionVendedor(e.target.value)} />
                    </div>
                  )}
                  <div><Label>{t("costes.agencyCommission")}</Label><Input type="number" placeholder="3" value={comision} onChange={(e) => setComision(e.target.value)} /></div>
                  <Separator />
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-start gap-2 mb-3"><Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><p className="text-xs text-muted-foreground">{t("costes.acquisitionInfo")}</p></div>
                    <div className="space-y-3">
                      <div><Label>{t("costes.acquisitionYear")}</Label><Input type="number" placeholder="2015" value={anioAdquisicion} onChange={(e) => setAnioAdquisicion(e.target.value)} /></div>
                      <div><Label>{t("costes.acquisitionPrice")} ({currencySymbol})</Label><Input type="number" placeholder="180000" value={precioAdquisicion} onChange={(e) => setPrecioAdquisicion(e.target.value)} /></div>
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
                    <CostLine label={mainTaxLabel} value={resultadoVendedor.irpf_importe} fmt={fmt} />
                    {resultadoVendedor.irpf_detalle && <p className="text-xs text-muted-foreground pl-1">{resultadoVendedor.irpf_detalle}</p>}
                  </div>
                  <div className="space-y-1">
                    <CostLine label={transferTaxLabel} value={resultadoVendedor.plusvalia_estimada} fmt={fmt} />
                    {resultadoVendedor.plusvalia_detalle && <p className="text-xs text-muted-foreground pl-1">{resultadoVendedor.plusvalia_detalle}</p>}
                  </div>
                  {resultadoVendedor.otros_costes && (
                    <p className="text-xs text-muted-foreground pl-1">{resultadoVendedor.otros_costes}</p>
                  )}
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
