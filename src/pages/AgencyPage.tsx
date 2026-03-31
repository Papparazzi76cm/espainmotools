import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAgencyManagement, Agent } from "@/hooks/useAgencyManagement";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, UserPlus, Users, Trash2, Settings2, Copy, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";
import { tools } from "@/lib/tools";

export default function AgencyPage() {
  const { role, loading: roleLoading } = useUserRole();
  const isAgency = role === "agencia" || role === "agencia_xl" || role === "admin";
  const isAdmin = role === "admin";
  const {
    agency, agents, loading,
    allAgencies, selectedAgencyId, setSelectedAgencyId,
    fetchAllAgencies, fetchAgencyInfo, fetchAgents,
    inviteAgent, removeAgent, updateAgentPermissions,
  } = useAgencyManagement();

  // Invite dialog
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteResult, setInviteResult] = useState<{ temp_password?: string; message?: string } | null>(null);

  // Permissions dialog
  const [permAgent, setPermAgent] = useState<Agent | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  // Remove confirm
  const [removeConfirm, setRemoveConfirm] = useState<Agent | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchAllAgencies();
    }
  }, [isAdmin, fetchAllAgencies]);

  useEffect(() => {
    if (isAgency && (selectedAgencyId || !isAdmin)) {
      fetchAgencyInfo();
      fetchAgents();
    }
  }, [isAgency, selectedAgencyId, fetchAgencyInfo, fetchAgents]);

  if (roleLoading) return <div className="text-muted-foreground p-8">Cargando...</div>;
  if (!isAgency) return <Navigate to="/" replace />;

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    const result = await inviteAgent(inviteEmail.trim(), inviteName.trim() || undefined);
    if (result) {
      setInviteResult(result);
      if (!result.temp_password) {
        setInviteOpen(false);
        setInviteEmail("");
        setInviteName("");
        setInviteResult(null);
      }
    }
  };

  const openPermissions = (agent: Agent) => {
    setPermAgent(agent);
    setSelectedPerms(agent.permissions || []);
  };

  const togglePerm = (toolId: string) => {
    setSelectedPerms(prev =>
      prev.includes(toolId) ? prev.filter(p => p !== toolId) : [...prev, toolId]
    );
  };

  const savePermissions = async () => {
    if (!permAgent) return;
    await updateAgentPermissions(permAgent.user_id, selectedPerms);
    setPermAgent(null);
  };

  return (
    <div className="space-y-6">
      {/* Admin agency selector */}
      {isAdmin && (
        <Card className="bg-card border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Vista de administrador — Selecciona una agencia</Label>
                <Select value={selectedAgencyId || ""} onValueChange={(v) => setSelectedAgencyId(v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona una agencia..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allAgencies.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(!isAdmin || selectedAgencyId) && (<>
      <div className="flex items-center gap-3">
        <Building2 className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isAdmin ? agency?.name || "Agencia" : "Mi Agencia"}</h1>
          <p className="text-sm text-muted-foreground">Gestiona los agentes del equipo</p>
        </div>
      </div>

      {/* Agency info + stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-lg font-semibold text-foreground">{agency?.name || "—"}</div>
            <div className="text-xs text-muted-foreground mt-1">{agency?.contact_email}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{agents.length}</div>
            <div className="text-xs text-muted-foreground">
              de {agency?.max_agents || "—"} agentes
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${agency?.max_agents ? (agents.length / agency.max_agents) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Contrato hasta</div>
            <div className="text-lg font-semibold text-foreground">
              {agency?.contract_end
                ? new Date(agency.contract_end).toLocaleDateString("es-ES")
                : "Indefinido"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents list */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Agentes
          </CardTitle>
          <Button
            onClick={() => { setInviteOpen(true); setInviteResult(null); setInviteEmail(""); setInviteName(""); }}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            size="sm"
          >
            <UserPlus className="h-4 w-4 mr-2" /> Invitar Agente
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead>Acceso hasta</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Cargando...</TableCell>
                </TableRow>
              ) : agents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay agentes. Invita al primero.
                  </TableCell>
                </TableRow>
              ) : (
                agents.map((agent) => (
                  <TableRow key={agent.user_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{agent.full_name || "Sin nombre"}</div>
                        <div className="text-xs text-muted-foreground">{agent.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={agent.status === "active" ? "default" : "secondary"} className="text-xs">
                        {agent.status === "active" ? "Activo" : agent.status === "inactive" ? "Inactivo" : "Suspendido"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {agent.permissions.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Todas</span>
                        ) : (
                          agent.permissions.slice(0, 3).map(p => (
                            <Badge key={p} variant="outline" className="text-[10px] border-primary/30 text-primary">{p}</Badge>
                          ))
                        )}
                        {agent.permissions.length > 3 && (
                          <Badge variant="outline" className="text-[10px]">+{agent.permissions.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {agent.access_end
                        ? new Date(agent.access_end).toLocaleDateString("es-ES")
                        : agent.trial_end
                        ? new Date(agent.trial_end).toLocaleDateString("es-ES")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openPermissions(agent)} title="Permisos">
                          <Settings2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setRemoveConfirm(agent)} title="Quitar">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* INVITE DIALOG */}
      <Dialog open={inviteOpen} onOpenChange={(open) => { if (!open) { setInviteOpen(false); setInviteResult(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar Agente</DialogTitle>
            <DialogDescription>
              Introduce el email del agente. Si ya tiene cuenta se le asignará a tu agencia; si no, se creará una cuenta nueva.
            </DialogDescription>
          </DialogHeader>
          {inviteResult?.temp_password ? (
            <div className="space-y-4">
              <p className="text-sm text-foreground">{inviteResult.message}</p>
              <div className="p-3 rounded-lg bg-muted">
                <Label className="text-xs text-muted-foreground">Contraseña temporal</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm font-mono text-primary flex-1 break-all">{inviteResult.temp_password}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => { navigator.clipboard.writeText(inviteResult.temp_password!); toast.success("Copiado"); }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Comparte esta contraseña con el agente de forma segura.</p>
              </div>
              <Button className="w-full" onClick={() => { setInviteOpen(false); setInviteResult(null); }}>
                Cerrar
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="agente@email.com"
                  />
                </div>
                <div>
                  <Label>Nombre (opcional)</Label>
                  <Input
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Nombre del agente"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancelar</Button>
                <Button onClick={handleInvite} className="bg-primary text-primary-foreground">Invitar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* PERMISSIONS DIALOG */}
      <Dialog open={!!permAgent} onOpenChange={(open) => !open && setPermAgent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permisos de {permAgent?.full_name || permAgent?.email}</DialogTitle>
            <DialogDescription>Selecciona las herramientas a las que tendrá acceso. Si no seleccionas ninguna, tendrá acceso a todas.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
            {tools.map((tool) => (
              <label
                key={tool.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
              >
                <Checkbox
                  checked={selectedPerms.includes(tool.id)}
                  onCheckedChange={() => togglePerm(tool.id)}
                />
                <div className="flex items-center gap-2 flex-1">
                  <tool.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{tool.title}</span>
                </div>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermAgent(null)}>Cancelar</Button>
            <Button onClick={savePermissions} className="bg-primary text-primary-foreground">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REMOVE CONFIRM */}
      <Dialog open={!!removeConfirm} onOpenChange={(open) => !open && setRemoveConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Quitar agente
            </DialogTitle>
            <DialogDescription>
              ¿Quitar a <strong>{removeConfirm?.email}</strong> de tu agencia? El usuario no se eliminará, solo se desvinculará.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => { removeAgent(removeConfirm!.user_id); setRemoveConfirm(null); }}>
              Quitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
