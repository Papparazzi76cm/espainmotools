import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, TrendingUp, Home, Building } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";

const RentabilidadPage = () => {
  const [precioCompra, setPrecioCompra] = useState("");
  const [alquilerTradicional, setAlquilerTradicional] = useState("");
  const [alquilerTemporal, setAlquilerTemporal] = useState("");
  const [ocupacionTemporal, setOcupacionTemporal] = useState("60");
  const [gastosAnuales, setGastosAnuales] = useState("");
  const [resultado, setResultado] = useState<{
    tradicional: { bruta: number; neta: number; ingresoAnual: number };
    temporal: { bruta: number; neta: number; ingresoAnual: number };
  } | null>(null);

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

    setResultado({
      tradicional: { bruta: brutaTrad, neta: netaTrad, ingresoAnual: ingresoTradAnual },
      temporal: { bruta: brutaTemp, neta: netaTemp, ingresoAnual: ingresoTempAnual },
    });
  };

  const fmtPct = (n: number) => `${n.toFixed(2)}%`;
  const fmtEur = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="rentabilidad" />
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">Calculadora de Rentabilidad</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Datos de la Inversión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Precio de compra (€)</Label>
              <Input type="number" placeholder="250.000" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} />
            </div>
            <Separator />
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Home className="h-4 w-4" /> Alquiler Tradicional
            </div>
            <div>
              <Label>Alquiler mensual (€)</Label>
              <Input type="number" placeholder="900" value={alquilerTradicional} onChange={(e) => setAlquilerTradicional(e.target.value)} />
            </div>
            <Separator />
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building className="h-4 w-4" /> Alquiler Temporal (Airbnb)
            </div>
            <div>
              <Label>Precio por noche (€)</Label>
              <Input type="number" placeholder="80" value={alquilerTemporal} onChange={(e) => setAlquilerTemporal(e.target.value)} />
            </div>
            <div>
              <Label>Ocupación estimada (%)</Label>
              <Input type="number" placeholder="60" value={ocupacionTemporal} onChange={(e) => setOcupacionTemporal(e.target.value)} />
            </div>
            <Separator />
            <div>
              <Label>Gastos anuales estimados (€)</Label>
              <Input type="number" placeholder="3.000" value={gastosAnuales} onChange={(e) => setGastosAnuales(e.target.value)} />
            </div>
            <Button onClick={calcular} className="w-full">
              Calcular Rentabilidad
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {resultado ? (
            <>
              <RentCard
                title="Alquiler Tradicional"
                icon={Home}
                bruta={resultado.tradicional.bruta}
                neta={resultado.tradicional.neta}
                ingresoAnual={resultado.tradicional.ingresoAnual}
                fmtPct={fmtPct}
                fmtCurrency={fmtEur}
              />
              <RentCard
                title="Alquiler Temporal"
                icon={Building}
                bruta={resultado.temporal.bruta}
                neta={resultado.temporal.neta}
                ingresoAnual={resultado.temporal.ingresoAnual}
                fmtPct={fmtPct}
                fmtCurrency={fmtEur}
              />
              {resultado.tradicional.bruta > 0 && resultado.temporal.bruta > 0 && (
                <Card className="glass-card border-primary/30">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Comparativa</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {resultado.temporal.neta > resultado.tradicional.neta
                        ? `El alquiler temporal genera ${fmtPct(resultado.temporal.neta - resultado.tradicional.neta)} más de rentabilidad neta, aunque con mayor gestión operativa.`
                        : `El alquiler tradicional es ${fmtPct(resultado.tradicional.neta - resultado.temporal.neta)} más rentable en neto, con menor esfuerzo de gestión.`}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Introduce los datos de inversión para ver el análisis de rentabilidad.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

function RentCard({
  title,
  icon: Icon,
  bruta,
  neta,
  ingresoAnual,
  fmtPct,
  fmtCurrency,
}: {
  title: string;
  icon: typeof Home;
  bruta: number;
  neta: number;
  ingresoAnual: number;
  fmtPct: (n: number) => string;
  fmtCurrency: (n: number) => string;
}) {
  const color = neta >= 8 ? "text-success" : neta >= 5 ? "text-warning" : "text-destructive";

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Ingreso anual</span>
          <span className="font-medium">{fmtCurrency(ingresoAnual)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Rentabilidad bruta</span>
          <span className="font-medium">{fmtPct(bruta)}</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="font-medium">Rentabilidad neta</span>
          <span className={`font-bold text-lg ${color}`}>{fmtPct(neta)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default RentabilidadPage;
