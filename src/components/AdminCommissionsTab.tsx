import { useEffect, useState } from "react";
import { useCommissions, Commission } from "@/hooks/useCommissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, TrendingUp, Clock, CircleCheck, Settings, Search } from "lucide-react";
import { toast } from "sonner";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  approved: { label: "Aprobada", variant: "outline" },
  paid: { label: "Pagada", variant: "default" },
};

export default function AdminCommissionsTab() {
  const {
    commissions, summary, settings, loading,
    fetchCommissions, fetchSummary, fetchSettings,
    updateCommissionStatus, bulkUpdateStatus, updateSettings, generateCommission,
  } = useCommissions();

  const [statusFilter, setStatusFilter] = useState("all");
  const [affiliateSearch, setAffiliateSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editPercentage, setEditPercentage] = useState("15");
  const [editMinPayout, setEditMinPayout] = useState("50");
  const [editType, setEditType] = useState("first_only");

  // Manual commission dialog
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
      toast.success("Estado actualizado");
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
      toast.success(`${selected.size} comisiones actualizadas`);
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
      toast.success("Configuración guardada");
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
        toast.info("Comisión no generada: " + result.reason);
      } else {
        toast.success("Comisión generada correctamente");
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

  const toggleAll = () => {
    if (selected.size === filteredCommissions.length) setSelected(new Set());
    else setSelected(new Set(filteredCommissions.map(c => c.id)));
  };

  const filteredCommissions = commissions.filter(c =>
    !affiliateSearch || c.affiliate_id.toLowerCase().includes(affiliateSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Summary */}
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
              <span className="text-xs text-muted-foreground">Pagado</span>
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
            placeholder="Buscar por ID afiliado..."
            value={affiliateSearch}
            onChange={(e) => setAffiliateSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="approved">Aprobada</SelectItem>
            <SelectItem value="paid">Pagada</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)} className="gap-1.5">
          <Settings className="h-4 w-4" /> Configuración
        </Button>
        <Button size="sm" onClick={() => setManualOpen(true)} className="gap-1.5">
          <DollarSign className="h-4 w-4" /> Generar comisión
        </Button>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">
          <span className="text-sm text-muted-foreground">{selected.size} seleccionadas</span>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("approved")} className="text-xs">
            Aprobar
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("paid")} className="text-xs">
            Marcar pagadas
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
                <TableHead>Fecha</TableHead>
                <TableHead>Afiliado</TableHead>
                <TableHead>Importe pago</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Comisión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Cargando...</TableCell></TableRow>
              ) : filteredCommissions.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Sin comisiones</TableCell></TableRow>
              ) : (
                filteredCommissions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} />
                    </TableCell>
                    <TableCell className="text-sm">{new Date(c.created_at).toLocaleDateString("es-ES")}</TableCell>
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
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="approved">Aprobada</SelectItem>
                          <SelectItem value="paid">Pagada</SelectItem>
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
            <DialogTitle>Configuración de comisiones</DialogTitle>
            <DialogDescription>Ajusta los parámetros del programa de afiliados</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Porcentaje de comisión (%)</Label>
              <Input type="number" value={editPercentage} onChange={(e) => setEditPercentage(e.target.value)} min="0" max="100" step="0.5" />
            </div>
            <div>
              <Label>Importe mínimo de pago (€)</Label>
              <Input type="number" value={editMinPayout} onChange={(e) => setEditMinPayout(e.target.value)} min="0" step="5" />
            </div>
            <div>
              <Label>Tipo de comisión</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_only">Solo primer pago</SelectItem>
                  <SelectItem value="recurring">Recurrente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancelar</Button>
            <Button onClick={saveSettings}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MANUAL COMMISSION DIALOG */}
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar comisión manual</DialogTitle>
            <DialogDescription>Genera una comisión para un pago de un usuario referido</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ID de usuario (UUID)</Label>
              <Input value={manualUserId} onChange={(e) => setManualUserId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
            </div>
            <div>
              <Label>Importe del pago (€)</Label>
              <Input type="number" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} placeholder="49.99" min="0" step="0.01" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualOpen(false)}>Cancelar</Button>
            <Button onClick={handleGenerateManual}>Generar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
