import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

export default function AffiliatePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    pending: { label: t("affiliate.statusPending"), variant: "secondary" },
    approved: { label: t("affiliate.statusApproved"), variant: "outline" },
    paid: { label: t("affiliate.statusPaid"), variant: "default" },
  };

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
    toast.success(t("affiliate.linkCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!data?.link_afiliado) return;
    const text = encodeURIComponent(`${data.link_afiliado}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareEmail = () => {
    if (!data?.link_afiliado) return;
    const subject = encodeURIComponent("Ace-Inmotools");
    const body = encodeURIComponent(`${data.link_afiliado}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  if (loading) return <div className="text-muted-foreground p-8">{t("common.loading")}</div>;

  if (!data) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-4">
        <Link2 className="h-12 w-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-semibold text-foreground">{t("affiliate.panelTitle")}</h2>
        <p className="text-muted-foreground">{t("affiliate.noAffiliate")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link2 className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("affiliate.panelTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("affiliate.manageLink")}</p>
        </div>
      </div>

      <Tabs defaultValue="link">
        <TabsList>
          <TabsTrigger value="link" className="gap-1.5">
            <Link2 className="h-4 w-4" /> {t("affiliate.myLink")}
          </TabsTrigger>
          <TabsTrigger value="commissions" className="gap-1.5">
            <DollarSign className="h-4 w-4" /> {t("affiliate.commissions")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="link" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t("affiliate.uniqueLink")}</CardTitle>
                <Badge variant="default" className="text-xs">
                  <Link2 className="h-3 w-3 mr-1" /> {t("affiliate.active")}
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
                  {copied ? t("affiliate.copied") : t("affiliate.copy")}
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
                {t("affiliate.affiliateSince")} {new Date(data.activated_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{t("affiliate.totalGenerated")}</span>
                </div>
                <div className="text-xl font-bold text-primary">{summary.total.toFixed(2)} €</div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t("affiliate.pending")}</span>
                </div>
                <div className="text-xl font-bold text-muted-foreground">{summary.pending.toFixed(2)} €</div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CircleCheck className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{t("affiliate.approved")}</span>
                </div>
                <div className="text-xl font-bold text-primary">{summary.approved.toFixed(2)} €</div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{t("affiliate.collected")}</span>
                </div>
                <div className="text-xl font-bold text-primary">{summary.paid.toFixed(2)} €</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">{t("affiliate.commissionHistory")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("affiliate.date")}</TableHead>
                    <TableHead>{t("affiliate.paymentAmount")}</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>{t("affiliate.commission")}</TableHead>
                    <TableHead>{t("affiliate.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t("common.loading")}</TableCell></TableRow>
                  ) : commissions.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t("affiliate.noCommissions")}</TableCell></TableRow>
                  ) : (
                    commissions.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-sm">{new Date(c.created_at).toLocaleDateString()}</TableCell>
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
