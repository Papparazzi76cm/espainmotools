import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link2, Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

interface AffiliateData {
  affiliate_id: string;
  link_afiliado: string;
  is_active: boolean;
  activated_at: string;
}

export default function AffiliatePage() {
  const { user } = useAuth();
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
    })();
  }, [user]);

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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link2 className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Enlace de Afiliado</h1>
          <p className="text-sm text-muted-foreground">Comparte tu enlace y gana comisiones por cada registro</p>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Tu enlace único</CardTitle>
            <Badge variant="default" className="text-xs">
              <Link2 className="h-3 w-3 mr-1" /> Activo
            </Badge>
          </div>
          <CardDescription>
            ID de afiliado: <span className="font-mono text-foreground">{data.affiliate_id}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              readOnly
              value={data.link_afiliado}
              className="font-mono text-sm bg-muted/50"
            />
            <Button onClick={copyLink} variant="outline" className="gap-1.5 shrink-0">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
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
    </div>
  );
}
