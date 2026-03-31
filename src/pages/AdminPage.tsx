import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAdminUsers, AdminUser, Agency } from "@/hooks/useAdminUsers";
import { useAdminMetrics } from "@/hooks/useAdminMetrics";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Shield, Users, Building2, Trash2, Edit, Search, AlertTriangle, BarChart3, TrendingUp, Activity, Download } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { tools } from "@/lib/tools";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  tester: "Tester",
  agencia: "Agencia",
  agencia_xl: "Agencia XL",
  agente: "Agente",
};

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Activo", variant: "default" },
  inactive: { label: "Inactivo", variant: "secondary" },
  suspended: { label: "Suspendido", variant: "destructive" },
};

export default function AdminPage() {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const {
    users, agencies, loading,
    fetchUsers, fetchAgencies,
    updateUserRole, updateUserStatus, updateUserAccess,
    assignAgency, deleteUser,
    createAgency, updateAgency, deleteAgency,
  } = useAdminUsers();
  const { toolStats, userStats, totalGenerations, todayGenerations, loading: metricsLoading } = useAdminMetrics();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit user dialog
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editAccessEnd, setEditAccessEnd] = useState("");
  const [editIsPaid, setEditIsPaid] = useState(false);
  const [editAgencyId, setEditAgencyId] = useState("");

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);

  // Agency dialog
  const [agencyDialog, setAgencyDialog] = useState(false);
  const [editAgency, setEditAgency] = useState<Agency | null>(null);
  const [agencyName, setAgencyName] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [agencyPhone, setAgencyPhone] = useState("");
  const [agencyMaxAgents, setAgencyMaxAgents] = useState("10");

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchAgencies();
    }
  }, [isAdmin, fetchUsers, fetchAgencies]);

  if (roleLoading) return <div className="text-muted-foreground p-8">Cargando...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const filteredUsers = users.filter((u) => {
    const matchSearch = !search || 
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const openEditUser = (u: AdminUser) => {
    setEditUser(u);
    setEditRole(u.role);
    setEditStatus(u.status);
    setEditAccessEnd(u.access_end ? u.access_end.split("T")[0] : "");
    setEditIsPaid(u.is_paid);
    setEditAgencyId(u.agency_id || "");
  };

  const saveEditUser = async () => {
    if (!editUser) return;
    if (editRole !== editUser.role) await updateUserRole(editUser.user_id, editRole);
    if (editStatus !== editUser.status) await updateUserStatus(editUser.user_id, editStatus);
    await updateUserAccess(
      editUser.user_id,
      editUser.access_start || new Date().toISOString(),
      editAccessEnd ? new Date(editAccessEnd).toISOString() : null,
      editIsPaid
    );
    if (editAgencyId !== (editUser.agency_id || "")) {
      await assignAgency(editUser.user_id, editAgencyId || null);
    }
    setEditUser(null);
  };

  const openAgencyDialog = (agency?: Agency) => {
    if (agency) {
      setEditAgency(agency);
      setAgencyName(agency.name);
      setAgencyEmail(agency.contact_email || "");
      setAgencyPhone(agency.phone || "");
      setAgencyMaxAgents(String(agency.max_agents));
    } else {
      setEditAgency(null);
      setAgencyName("");
      setAgencyEmail("");
      setAgencyPhone("");
      setAgencyMaxAgents("10");
    }
    setAgencyDialog(true);
  };

  const saveAgency = async () => {
    const data = {
      name: agencyName,
      contact_email: agencyEmail || null,
      phone: agencyPhone || null,
      max_agents: parseInt(agencyMaxAgents) || 10,
    };
    if (editAgency) {
      await updateAgency(editAgency.id, data);
    } else {
      await createAgency(data);
    }
    setAgencyDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
          <p className="text-sm text-muted-foreground">Gestiona usuarios, roles y agencias</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{users.length}</div>
            <div className="text-xs text-muted-foreground">Usuarios totales</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{agencies.length}</div>
            <div className="text-xs text-muted-foreground">Agencias</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">{users.filter(u => u.status === "active").length}</div>
            <div className="text-xs text-muted-foreground">Activos</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{users.filter(u => u.is_paid).length}</div>
            <div className="text-xs text-muted-foreground">De pago</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="h-4 w-4" /> Usuarios
          </TabsTrigger>
          <TabsTrigger value="agencies" className="gap-1.5">
            <Building2 className="h-4 w-4" /> Agencias
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-1.5">
            <BarChart3 className="h-4 w-4" /> Métricas
          </TabsTrigger>
        </TabsList>

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email o nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
                <SelectItem value="suspended">Suspendido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Acceso hasta</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Cargando...</TableCell></TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No se encontraron usuarios</TableCell></TableRow>
                  ) : (
                    filteredUsers.map((u) => (
                      <TableRow key={u.user_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{u.full_name || "Sin nombre"}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                            {ROLE_LABELS[u.role] || u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_LABELS[u.status]?.variant || "secondary"} className="text-xs">
                            {STATUS_LABELS[u.status]?.label || u.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs ${u.is_paid ? "text-green-500" : "text-muted-foreground"}`}>
                            {u.is_paid ? "Premium" : "Trial"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.access_end ? new Date(u.access_end).toLocaleDateString("es-ES") :
                           u.trial_end ? new Date(u.trial_end).toLocaleDateString("es-ES") : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditUser(u)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(u)}>
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
        </TabsContent>

        {/* AGENCIES TAB */}
        <TabsContent value="agencies" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openAgencyDialog()} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Building2 className="h-4 w-4 mr-2" /> Nueva Agencia
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agencies.map((a) => {
              const agentCount = users.filter(u => u.agency_id === a.id).length;
              return (
                <Card key={a.id} className="border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{a.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openAgencyDialog(a)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteAgency(a.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    {a.contact_email && <div className="text-muted-foreground">{a.contact_email}</div>}
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Agentes: {agentCount}/{a.max_agents}</span>
                      <Badge variant={a.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {STATUS_LABELS[a.status]?.label || a.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {agencies.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8">No hay agencias registradas</div>
            )}
          </div>
        </TabsContent>
        {/* METRICS TAB */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Total generaciones</span>
                </div>
                <div className="text-2xl font-bold text-primary">{totalGenerations}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Hoy</span>
                </div>
                <div className="text-2xl font-bold text-green-500">{todayGenerations}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Herramientas activas</span>
                </div>
                <div className="text-2xl font-bold text-primary">{toolStats.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Usuarios activos</span>
                </div>
                <div className="text-2xl font-bold text-primary">{userStats.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tool usage */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Uso por herramienta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {metricsLoading ? (
                <p className="text-muted-foreground text-sm text-center py-4">Cargando métricas...</p>
              ) : toolStats.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">Sin datos de uso todavía</p>
              ) : (
                toolStats.map(t => {
                  const maxUses = toolStats[0]?.total_uses || 1;
                  const pct = (t.total_uses / maxUses) * 100;
                  return (
                    <div key={t.tool_id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{t.tool_name}</span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{t.total_uses} usos</span>
                          <span>{t.unique_users} usuarios</span>
                          <Badge variant="outline" className="text-[10px]">{t.today_uses} hoy</Badge>
                        </div>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Top users */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Top usuarios por uso
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Generaciones</TableHead>
                    <TableHead>Último uso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userStats.map((u, i) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                      <TableCell className="text-sm font-medium">{u.full_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{u.total_uses}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {u.last_used ? new Date(u.last_used).toLocaleDateString("es-ES") : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {userStats.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">Sin datos</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* EDIT USER DIALOG */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>{editUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rol</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="suspended">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha fin de acceso</Label>
              <Input type="date" value={editAccessEnd} onChange={(e) => setEditAccessEnd(e.target.value)} />
            </div>
            <div>
              <Label>Agencia</Label>
              <Select value={editAgencyId || "none"} onValueChange={(v) => setEditAgencyId(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Sin agencia" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin agencia</SelectItem>
                  {agencies.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPaid"
                checked={editIsPaid}
                onChange={(e) => setEditIsPaid(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="isPaid">Usuario de pago (Premium)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
            <Button onClick={saveEditUser} className="bg-primary text-primary-foreground">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a <strong>{deleteConfirm?.email}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => { deleteUser(deleteConfirm!.user_id); setDeleteConfirm(null); }}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AGENCY DIALOG */}
      <Dialog open={agencyDialog} onOpenChange={setAgencyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editAgency ? "Editar agencia" : "Nueva agencia"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />
            </div>
            <div>
              <Label>Email de contacto</Label>
              <Input type="email" value={agencyEmail} onChange={(e) => setAgencyEmail(e.target.value)} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={agencyPhone} onChange={(e) => setAgencyPhone(e.target.value)} />
            </div>
            <div>
              <Label>Máx. agentes</Label>
              <Input type="number" value={agencyMaxAgents} onChange={(e) => setAgencyMaxAgents(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAgencyDialog(false)}>Cancelar</Button>
            <Button onClick={saveAgency} className="bg-primary text-primary-foreground">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
