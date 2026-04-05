import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, TrendingUp, Home, Building } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";
import { useToolHistory } from "@/hooks/useToolHistory";
import { ToolHistoryPanel } from "@/components/ToolHistoryPanel";
import { useTranslation } from "react-i18next";
import { useCountryCurrency } from "@/hooks/useCountryCurrency";

const RentabilidadPage = () => {
  const { t } = useTranslation();
  const { fmt: fmtCurrency, currencySymbol } = useCountryCurrency();
  const [precioCompra, setPrecioCompra] = useState("");
  const [alquilerTradicional, setAlquilerTradicional] = useState("");
  const [alquilerTemporal, setAlquilerTemporal] = useState("");
  const [ocupacionTemporal, setOcupacionTemporal] = useState("60");
  const [gastosAnuales, setGastosAnuales] = useState("");
  const [resultado, setResultado] = useState<{
    tradicional: { bruta: number; neta: number; ingresoAnual: number };
    temporal: { bruta: number; neta: number; ingresoAnual: number };
  } | null>(null);
  const { history, loading: histLoading, saveResult, deleteEntry } = useToolHistory("rentabilidad");

  const fmtPct = (n: number) => `${n.toFixed(2)}%`;

  const calcular = () => {
    const precio = parseFloat(precioCompra);
    const trad = parseFloat(alquilerTradicional);
    const temp = parseFloat(alquilerTemporal);
    const ocup = parseFloat(ocupacionTemporal) / 100;
    const gastos = parseFloat(gastosAnuales) || 0;
    if (!precio || precio <= 0) return;
    const ingresoTradAnual = (trad || 0) * 12;
    const ingresoTempAnual = (temp || 0) * 30 * 12 * ocup;
    const brutaTrad = trad ? (ingresoTradAnual / precio) * 100 : 0;
    const netaTrad = trad ? ((ingresoTradAnual - gastos) / precio) * 100 : 0;
    const brutaTemp = temp ? (ingresoTempAnual / precio) * 100 : 0;
    const netaTemp = temp ? ((ingresoTempAnual - gastos * 1.3) / precio) * 100 : 0;
    const res = { tradicional: { bruta: brutaTrad, neta: netaTrad, ingresoAnual: ingresoTradAnual }, temporal: { bruta: brutaTemp, neta: netaTemp, ingresoAnual: ingresoTempAnual } };
    setResultado(res);
    saveResult(`${fmtCurrency(precio)}`, { precioCompra: precio, alquilerTradicional: trad, alquilerTemporal: temp, ocupacionTemporal: ocup, gastosAnuales: gastos }, res);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="rentabilidad" />
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">{t("rentabilidad.title")}</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">{t("rentabilidad.investmentData")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>{t("rentabilidad.purchasePrice")}</Label><Input type="number" placeholder="250.000" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} /></div>
              <Separator />
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Home className="h-4 w-4" /> {t("rentabilidad.traditionalRental")}</div>
              <div><Label>{t("rentabilidad.monthlyRent")}</Label><Input type="number" placeholder="900" value={alquilerTradicional} onChange={(e) => setAlquilerTradicional(e.target.value)} /></div>
              <Separator />
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Building className="h-4 w-4" /> {t("rentabilidad.temporaryRental")}</div>
              <div><Label>{t("rentabilidad.nightlyPrice")}</Label><Input type="number" placeholder="80" value={alquilerTemporal} onChange={(e) => setAlquilerTemporal(e.target.value)} /></div>
              <div><Label>{t("rentabilidad.estimatedOccupancy")}</Label><Input type="number" placeholder="60" value={ocupacionTemporal} onChange={(e) => setOcupacionTemporal(e.target.value)} /></div>
              <Separator />
              <div><Label>{t("rentabilidad.annualExpenses")}</Label><Input type="number" placeholder="3.000" value={gastosAnuales} onChange={(e) => setGastosAnuales(e.target.value)} /></div>
              <Button onClick={calcular} className="w-full">{t("rentabilidad.calculateButton")}</Button>
            </CardContent>
          </Card>
          <ToolHistoryPanel history={history} loading={histLoading} onLoad={(e) => setResultado(e.result_data)} onDelete={deleteEntry} />
        </div>
        <div className="space-y-4">
          {resultado ? (
            <>
              <RentCard title={t("rentabilidad.traditionalRental")} icon={Home} bruta={resultado.tradicional.bruta} neta={resultado.tradicional.neta} ingresoAnual={resultado.tradicional.ingresoAnual} fmtPct={fmtPct} fmtCurrency={fmtEur} t={t} />
              <RentCard title={t("rentabilidad.temporaryRental")} icon={Building} bruta={resultado.temporal.bruta} neta={resultado.temporal.neta} ingresoAnual={resultado.temporal.ingresoAnual} fmtPct={fmtPct} fmtCurrency={fmtEur} t={t} />
              {resultado.tradicional.bruta > 0 && resultado.temporal.bruta > 0 && (
                <Card className="glass-card border-primary/30">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4 text-primary" /><span className="font-medium text-sm">{t("rentabilidad.comparison")}</span></div>
                    <p className="text-sm text-muted-foreground">
                      {resultado.temporal.neta > resultado.tradicional.neta
                        ? t("rentabilidad.temporalBetter", { diff: fmtPct(resultado.temporal.neta - resultado.tradicional.neta) })
                        : t("rentabilidad.traditionalBetter", { diff: fmtPct(resultado.tradicional.neta - resultado.temporal.neta) })}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground">
              <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">{t("rentabilidad.emptyDesc")}</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
};

function RentCard({ title, icon: Icon, bruta, neta, ingresoAnual, fmtPct, fmtCurrency, t }: { title: string; icon: typeof Home; bruta: number; neta: number; ingresoAnual: number; fmtPct: (n: number) => string; fmtCurrency: (n: number) => string; t: (key: string) => string }) {
  const color = neta >= 8 ? "text-success" : neta >= 5 ? "text-warning" : "text-destructive";
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /><CardTitle className="text-base">{title}</CardTitle></div></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("rentabilidad.annualIncome")}</span><span className="font-medium">{fmtCurrency(ingresoAnual)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("rentabilidad.grossYield")}</span><span className="font-medium">{fmtPct(bruta)}</span></div>
        <Separator />
        <div className="flex justify-between"><span className="font-medium">{t("rentabilidad.netYield")}</span><span className={`font-bold text-lg ${color}`}>{fmtPct(neta)}</span></div>
      </CardContent>
    </Card>
  );
}

export default RentabilidadPage;
