import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCommissions, Commission } from "@/hooks/useCommissions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link2, Copy, Check, Share2, DollarSign, TrendingUp, Clock, CircleCheck } from "lucide-react";
import { toast } from "sonner";

interface AffiliateData {
  affiliate_id: string;
  link_afiliado: string;
  is_active: boolean;
  activated_at: string;
}

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  approved: { label: "Aprobada", variant: "outline" },
  paid: { label: "Pagada", variant: "default" },
};

export default function AffiliatePage() {
  const { user } = useAuth();
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const { commissions, summary, loading: comLoading, fetchCommissions, fetchSummary } = useCommissions();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: aff } = await supabase
        .from("affiliates")
        .select("affiliate_id, link_afiliado, is_active, activated_at")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();
      setData(aff as AffiliateData | null);
      setLoading(false);

      if (aff) {
        fetchCommissions();
        fetchSummary();
      }
    })();
  }, [user, fetchCommissions, fetchSummary]);

  const copyLink = async () => {
    if (!data?.link_afiliado) return;
    await navigator.clipboard.writeText(data.link_afiliado);
    setCopied(true);
    toast.success("Enlace copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!data?.link_afiliado) return;
    const text = encodeURIComponent(`¡Prueba Ace-Inmotools, la mejor suite de IA para inmobiliarias! ${data.link_afiliado}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareEmail = () => {
    if (!data?.link_afiliado) return;
    const subject = encodeURIComponent("Te invito a probar Ace-Inmotools");
    const body = encodeURIComponent(`Hola,\n\nTe recomiendo Ace-Inmotools, la suite de IA para el sector inmobiliario.\n\nRegístrate aquí: ${data.link_afiliado}\n\n¡Saludos!`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  if (loading) return <div className="text-muted-foreground p-8">Cargando...</div>;

  if (!data) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-4">
        <Link2 className="h-12 w-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-semibold text-foreground">Panel de Afiliado</h2>
        <p className="text-muted-foreground">No tienes el rol de afiliado activo. Contacta con el administrador para activarlo.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link2 className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel de Afiliado</h1>
          <p className="text-sm text-muted-foreground">Gestiona tu enlace y sigue tus comisiones</p>
        </div>
      </div>

      <Tabs defaultValue="link">
        <TabsList>
          <TabsTrigger value="link" className="gap-1.5">
            <Link2 className="h-4 w-4" /> Mi Enlace
          </TabsTrigger>
          <TabsTrigger value="commissions" className="gap-1.5">
            <DollarSign className="h-4 w-4" /> Comisiones
          </TabsTrigger>
        </TabsList>

        {/* LINK TAB */}
        <TabsContent value="link" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Tu enlace único</CardTitle>
                <Badge variant="default" className="text-xs">
                  <Link2 className="h-3 w-3 mr-1" /> Activo
                </Badge>
              </div>
              <CardDescription>
                ID: <span className="font-mono text-foreground">{data.affiliate_id}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input readOnly value={data.link_afiliado} className="font-mono text-sm bg-muted/50" />
                <Button onClick={copyLink} variant="outline" className="gap-1.5 shrink-0">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button onClick={shareWhatsApp} variant="outline" className="gap-2 flex-1">
                  <Share2 className="h-4 w-4" /> WhatsApp
                </Button>
                <Button onClick={shareEmail} variant="outline" className="gap-2 flex-1">
                  <Share2 className="h-4 w-4" /> Email
                </Button>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                Afiliado desde: {new Date(data.activated_at).toLocaleDateString("es-ES")}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMMISSIONS TAB */}
        <TabsContent value="commissions" className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Total generado</span>
                </div>
                <div className="text-xl font-bold text-primary">{summary.total.toFixed(2)} €</div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Pendiente</span>
                </div>
                <div className="text-xl font-bold text-muted-foreground">{summary.pending.toFixed(2)} €</div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CircleCheck className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Aprobado</span>
                </div>
                <div className="text-xl font-bold text-primary">{summary.approved.toFixed(2)} €</div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Cobrado</span>
                </div>
                <div className="text-xl font-bold text-primary">{summary.paid.toFixed(2)} €</div>
              </CardContent>
            </Card>
          </div>

          {/* Commission history */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Historial de comisiones</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Importe pago</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>Comisión</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Cargando...</TableCell></TableRow>
                  ) : commissions.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aún no tienes comisiones</TableCell></TableRow>
                  ) : (
                    commissions.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-sm">{new Date(c.created_at).toLocaleDateString("es-ES")}</TableCell>
                        <TableCell className="text-sm">{Number(c.payment_amount).toFixed(2)} €</TableCell>
                        <TableCell className="text-sm">{Number(c.commission_percentage)}%</TableCell>
                        <TableCell className="text-sm font-medium">{Number(c.commission_amount).toFixed(2)} €</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_BADGE[c.status]?.variant || "secondary"} className="text-xs">
                            {STATUS_BADGE[c.status]?.label || c.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
