import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCommissions, Commission } from "@/hooks/useCommissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, TrendingUp, Clock, CircleCheck, Settings, Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminCommissionsTab() {
  const { t } = useTranslation();
  const {
    commissions,
    summary,
    settings,
    loading,
    fetchCommissions,
    fetchSummary,
    fetchSettings,
    updateCommissionStatus,
    bulkUpdateStatus,
    updateSettings,
    generateCommission,
  } = useCommissions();

  const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> =
    {
      pending: { label: t("adminCommissions.statusPending"), variant: "secondary" },
      approved: { label: t("adminCommissions.statusApproved"), variant: "outline" },
      paid: { label: t("adminCommissions.statusPaid"), variant: "default" },
    };

  const [statusFilter, setStatusFilter] = useState("all");
  const [affiliateSearch, setAffiliateSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editPercentage, setEditPercentage] = useState("15");
  const [editMinPayout, setEditMinPayout] = useState("50");
  const [editType, setEditType] = useState("first_only");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualUserId, setManualUserId] = useState("");
  const [manualAmount, setManualAmount] = useState("");

  useEffect(() => {
    fetchCommissions({ status: statusFilter !== "all" ? statusFilter : undefined });
    fetchSummary();
    fetchSettings();
  }, [fetchCommissions, fetchSummary, fetchSettings, statusFilter]);

  useEffect(() => {
    if (settings) {
      setEditPercentage(String(settings.commission_percentage));
      setEditMinPayout(String(settings.min_payout));
      setEditType(settings.commission_type);
    }
  }, [settings]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateCommissionStatus(id, newStatus);
      toast.success(t("adminCommissions.statusUpdated"));
      fetchCommissions({ status: statusFilter !== "all" ? statusFilter : undefined });
      fetchSummary();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const handleBulkAction = async (status: string) => {
    if (selected.size === 0) return;
    try {
      await bulkUpdateStatus(Array.from(selected), status);
      toast.success(t("adminCommissions.commissionsUpdated", { count: selected.size }));
      setSelected(new Set());
      fetchCommissions({ status: statusFilter !== "all" ? statusFilter : undefined });
      fetchSummary();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const saveSettings = async () => {
    try {
      await updateSettings({
        commission_percentage: parseFloat(editPercentage),
        min_payout: parseFloat(editMinPayout),
        commission_type: editType,
      });
      toast.success(t("adminCommissions.settingsSaved"));
      setSettingsOpen(false);
      fetchSettings();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const handleGenerateManual = async () => {
    if (!manualUserId || !manualAmount) return;
    try {
      const result = await generateCommission(manualUserId, parseFloat(manualAmount));
      if (result.skipped) {
        toast.info(t("adminCommissions.commissionSkipped") + " " + result.reason);
      } else {
        toast.success(t("adminCommissions.commissionGenerated"));
      }
      setManualOpen(false);
      setManualUserId("");
      setManualAmount("");
      fetchCommissions({ status: statusFilter !== "all" ? statusFilter : undefined });
      fetchSummary();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const filteredCommissions = commissions.filter(
    (c) => !affiliateSearch || c.affiliate_id.toLowerCase().includes(affiliateSearch.toLowerCase()),
  );

  const toggleAll = () => {
    if (selected.size === filteredCommissions.length) setSelected(new Set());
    else setSelected(new Set(filteredCommissions.map((c) => c.id)));
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{t("adminCommissions.totalGenerated")}</span>
            </div>
            <div className="text-xl font-bold text-primary">{summary.total.toFixed(2)} €</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t("adminCommissions.pending")}</span>
            </div>
            <div className="text-xl font-bold text-muted-foreground">{summary.pending.toFixed(2)} €</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CircleCheck className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{t("adminCommissions.approved")}</span>
            </div>
            <div className="text-xl font-bold text-primary">{summary.approved.toFixed(2)} €</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{t("adminCommissions.paid")}</span>
            </div>
            <div className="text-xl font-bold text-primary">{summary.paid.toFixed(2)} €</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("adminCommissions.searchAffiliate")}
            value={affiliateSearch}
            onChange={(e) => setAffiliateSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t("adminCommissions.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("adminCommissions.allStatuses")}</SelectItem>
            <SelectItem value="pending">{t("adminCommissions.statusPending")}</SelectItem>
            <SelectItem value="approved">{t("adminCommissions.statusApproved")}</SelectItem>
            <SelectItem value="paid">{t("adminCommissions.statusPaid")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)} className="gap-1.5">
          <Settings className="h-4 w-4" /> {t("adminCommissions.settings")}
        </Button>
        <Button size="sm" onClick={() => setManualOpen(true)} className="gap-1.5">
          <DollarSign className="h-4 w-4" /> {t("adminCommissions.generateCommission")}
        </Button>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">
          <span className="text-sm text-muted-foreground">
            {t("adminCommissions.selected", { count: selected.size })}
          </span>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("approved")} className="text-xs">
            {t("adminCommissions.approve")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("paid")} className="text-xs">
            {t("adminCommissions.markPaid")}
          </Button>
        </div>
      )}

      {/* Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selected.size === filteredCommissions.length && filteredCommissions.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>{t("adminCommissions.date")}</TableHead>
                <TableHead>{t("adminCommissions.affiliate")}</TableHead>
                <TableHead>{t("adminCommissions.paymentAmount")}</TableHead>
                <TableHead>%</TableHead>
                <TableHead>{t("adminCommissions.commission")}</TableHead>
                <TableHead>{t("adminCommissions.status")}</TableHead>
                <TableHead className="text-right">{t("adminCommissions.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {t("adminCommissions.loading")}
                  </TableCell>
                </TableRow>
              ) : filteredCommissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {t("adminCommissions.noCommissions")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCommissions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} />
                    </TableCell>
                    <TableCell className="text-sm">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm font-mono">{c.affiliate_id}</TableCell>
                    <TableCell className="text-sm">{Number(c.payment_amount).toFixed(2)} €</TableCell>
                    <TableCell className="text-sm">{Number(c.commission_percentage)}%</TableCell>
                    <TableCell className="text-sm font-medium">{Number(c.commission_amount).toFixed(2)} €</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[c.status]?.variant || "secondary"} className="text-xs">
                        {STATUS_BADGE[c.status]?.label || c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select value={c.status} onValueChange={(v) => handleStatusChange(c.id, v)}>
                        <SelectTrigger className="h-7 w-[120px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t("adminCommissions.statusPending")}</SelectItem>
                          <SelectItem value="approved">{t("adminCommissions.statusApproved")}</SelectItem>
                          <SelectItem value="paid">{t("adminCommissions.statusPaid")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* SETTINGS DIALOG */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminCommissions.settingsTitle")}</DialogTitle>
            <DialogDescription>{t("adminCommissions.settingsDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("adminCommissions.commissionPercentage")}</Label>
              <Input
                type="number"
                value={editPercentage}
                onChange={(e) => setEditPercentage(e.target.value)}
                min="0"
                max="100"
                step="0.5"
              />
            </div>
            <div>
              <Label>{t("adminCommissions.minPayout")}</Label>
              <Input
                type="number"
                value={editMinPayout}
                onChange={(e) => setEditMinPayout(e.target.value)}
                min="0"
                step="5"
              />
            </div>
            <div>
              <Label>{t("adminCommissions.commissionType")}</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_only">{t("adminCommissions.firstOnly")}</SelectItem>
                  <SelectItem value="recurring">{t("adminCommissions.recurring")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              {t("adminCommissions.cancel")}
            </Button>
            <Button onClick={saveSettings}>{t("adminCommissions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MANUAL COMMISSION DIALOG */}
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminCommissions.manualTitle")}</DialogTitle>
            <DialogDescription>{t("adminCommissions.manualDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("adminCommissions.userId")}</Label>
              <Input
                value={manualUserId}
                onChange={(e) => setManualUserId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            <div>
              <Label>{t("adminCommissions.paymentAmountLabel")}</Label>
              <Input
                type="number"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="49.99"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualOpen(false)}>
              {t("adminCommissions.cancel")}
            </Button>
            <Button onClick={handleGenerateManual}>{t("adminCommissions.generate")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
