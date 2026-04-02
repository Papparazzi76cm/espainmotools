import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Shield, Users, Building2, Trash2, Edit, Search, AlertTriangle, BarChart3, TrendingUp, Activity, Download, Link2, DollarSign } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { tools } from "@/lib/tools";
import AdminCommissionsTab from "@/components/AdminCommissionsTab";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  tester: "Tester",
  agencia: "Agencia",
  agencia_xl: "Agencia XL",
  agente: "Agente",
};

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
  suspended: { label: "Suspended", variant: "destructive" },
};

export default function AdminPage() {
  const { t } = useTranslation();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const {
    users, agencies, loading,
    fetchUsers, fetchAgencies,
    updateUserRole, updateUserStatus, updateUserAccess,
    assignAgency, deleteUser, toggleAffiliate, regenerateAffiliate,
    createAgency, updateAgency, deleteAgency,
  } = useAdminUsers();
  const { toolStats, userStats, dailyUsage, totalGenerations, todayGenerations, loading: metricsLoading, exportCSV } = useAdminMetrics();
  const [chartDays, setChartDays] = useState<7 | 30>(7);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [affiliateFilter, setAffiliateFilter] = useState("all");

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editAccessEnd, setEditAccessEnd] = useState("");
  const [editIsPaid, setEditIsPaid] = useState(false);
  const [editAgencyId, setEditAgencyId] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);

  const [agencyDialog, setAgencyDialog] = useState(false);
  const [editAgency, setEditAgency] = useState<Agency | null>(null);
  const [agencyName, setAgencyName] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [agencyPhone, setAgencyPhone] = useState("");
  const [agencyMaxAgents, setAgencyMaxAgents] = useState("10");

  useEffect(() => {
    if (isAdmin) { fetchUsers(); fetchAgencies(); }
  }, [isAdmin, fetchUsers, fetchAgencies]);

  if (roleLoading) return <div className="text-muted-foreground p-8">{t("admin.loading")}</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const filteredUsers = users.filter((u) => {
    const matchSearch = !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    const matchAffiliate = affiliateFilter === "all" || (affiliateFilter === "yes" ? u.is_affiliate : !u.is_affiliate);
    return matchSearch && matchRole && matchStatus && matchAffiliate;
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
    await updateUserAccess(editUser.user_id, editUser.access_start || new Date().toISOString(), editAccessEnd ? new Date(editAccessEnd).toISOString() : null, editIsPaid);
    if (editAgencyId !== (editUser.agency_id || "")) await assignAgency(editUser.user_id, editAgencyId || null);
    setEditUser(null);
  };

  const openAgencyDialog = (agency?: Agency) => {
    if (agency) {
      setEditAgency(agency); setAgencyName(agency.name); setAgencyEmail(agency.contact_email || ""); setAgencyPhone(agency.phone || ""); setAgencyMaxAgents(String(agency.max_agents));
    } else {
      setEditAgency(null); setAgencyName(""); setAgencyEmail(""); setAgencyPhone(""); setAgencyMaxAgents("10");
    }
    setAgencyDialog(true);
  };

  const saveAgency = async () => {
    const data = { name: agencyName, contact_email: agencyEmail || null, phone: agencyPhone || null, max_agents: parseInt(agencyMaxAgents) || 10 };
    if (editAgency) await updateAgency(editAgency.id, data);
    else await createAgency(data);
    setAgencyDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("admin.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.subtitle")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="text-2xl font-bold text-primary">{users.length}</div><div className="text-xs text-muted-foreground">{t("admin.totalUsers")}</div></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="text-2xl font-bold text-primary">{agencies.length}</div><div className="text-xs text-muted-foreground">{t("admin.agencies")}</div></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="text-2xl font-bold text-green-500">{users.filter(u => u.status === "active").length}</div><div className="text-xs text-muted-foreground">{t("admin.active")}</div></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="text-2xl font-bold text-primary">{users.filter(u => u.is_paid).length}</div><div className="text-xs text-muted-foreground">{t("admin.paid")}</div></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="text-2xl font-bold text-primary">{users.filter(u => u.is_affiliate).length}</div><div className="text-xs text-muted-foreground">{t("admin.affiliates")}</div></CardContent></Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5"><Users className="h-4 w-4" /> {t("admin.usersTab")}</TabsTrigger>
          <TabsTrigger value="agencies" className="gap-1.5"><Building2 className="h-4 w-4" /> {t("admin.agenciesTab")}</TabsTrigger>
          <TabsTrigger value="metrics" className="gap-1.5"><BarChart3 className="h-4 w-4" /> {t("admin.metricsTab")}</TabsTrigger>
          <TabsTrigger value="commissions" className="gap-1.5"><DollarSign className="h-4 w-4" /> {t("admin.commissionsTab")}</TabsTrigger>
        </TabsList>

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("admin.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t("admin.role")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.allRoles")}</SelectItem>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t("admin.status")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.allStatuses")}</SelectItem>
                <SelectItem value="active">{t("admin.statusActive")}</SelectItem>
                <SelectItem value="inactive">{t("admin.statusInactive")}</SelectItem>
                <SelectItem value="suspended">{t("admin.statusSuspended")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={affiliateFilter} onValueChange={setAffiliateFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t("admin.affiliate")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.allAffiliates")}</SelectItem>
                <SelectItem value="yes">{t("admin.affiliatesOnly")}</SelectItem>
                <SelectItem value="no">{t("admin.nonAffiliates")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.user")}</TableHead>
                    <TableHead>{t("admin.agency")}</TableHead>
                    <TableHead>{t("admin.role")}</TableHead>
                    <TableHead>{t("admin.affiliate")}</TableHead>
                    <TableHead>{t("admin.status")}</TableHead>
                    <TableHead>{t("admin.plan")}</TableHead>
                    <TableHead>{t("admin.accessUntil")}</TableHead>
                    <TableHead className="text-right">{t("admin.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{t("admin.loading")}</TableCell></TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{t("admin.noUsers")}</TableCell></TableRow>
                  ) : (
                    filteredUsers.map((u) => (
                      <TableRow key={u.user_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{u.full_name || t("admin.noName")}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </TableCell>
                        <TableCell><span className="text-sm text-muted-foreground">{u.agency_name || agencies.find(a => a.id === u.agency_id)?.name || t("admin.freelance")}</span></TableCell>
                        <TableCell><Badge variant="outline" className="text-xs border-primary/30 text-primary">{ROLE_LABELS[u.role] || u.role}</Badge></TableCell>
                        <TableCell>
                          {u.is_affiliate ? (
                            <div className="space-y-0.5">
                              <Badge variant="default" className="text-[10px]"><Link2 className="h-3 w-3 mr-1" /> {t("admin.affiliate")}</Badge>
                              <div className="text-[10px] text-muted-foreground font-mono">{u.affiliate_id}</div>
                            </div>
                          ) : (<span className="text-xs text-muted-foreground">—</span>)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_LABELS[u.status]?.variant || "secondary"} className="text-xs">
                            {u.status === "active" ? t("admin.statusActive") : u.status === "inactive" ? t("admin.statusInactive") : t("admin.statusSuspended")}
                          </Badge>
                        </TableCell>
                        <TableCell><span className={`text-xs ${u.is_paid ? "text-green-500" : "text-muted-foreground"}`}>{u.is_paid ? t("admin.premium") : t("admin.trial")}</span></TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.access_end ? new Date(u.access_end).toLocaleDateString() : u.trial_end ? new Date(u.trial_end).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditUser(u)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(u)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
              <Building2 className="h-4 w-4 mr-2" /> {t("admin.newAgency")}
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
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openAgencyDialog(a)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteAgency(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    {a.contact_email && <div className="text-muted-foreground">{a.contact_email}</div>}
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t("admin.agents")} {agentCount}/{a.max_agents}</span>
                      <Badge variant={a.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {a.status === "active" ? t("admin.statusActive") : t("admin.statusInactive")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {agencies.length === 0 && (<div className="col-span-full text-center text-muted-foreground py-8">{t("admin.noAgencies")}</div>)}
          </div>
        </TabsContent>

        {/* METRICS TAB */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div />
            <Button variant="outline" size="sm" onClick={() => { exportCSV(); toast.success("CSV exported"); }} className="gap-2">
              <Download className="h-4 w-4" /> {t("admin.exportCSV")}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">{t("admin.totalGenerations")}</span></div><div className="text-2xl font-bold text-primary">{totalGenerations}</div></CardContent></Card>
            <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Activity className="h-4 w-4 text-green-500" /><span className="text-xs text-muted-foreground">{t("admin.today")}</span></div><div className="text-2xl font-bold text-green-500">{todayGenerations}</div></CardContent></Card>
            <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><BarChart3 className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">{t("admin.activeTools")}</span></div><div className="text-2xl font-bold text-primary">{toolStats.length}</div></CardContent></Card>
            <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">{t("admin.activeUsers")}</span></div><div className="text-2xl font-bold text-primary">{userStats.length}</div></CardContent></Card>
          </div>

          {/* Daily usage chart */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> {t("admin.usageEvolution")}
              </CardTitle>
              <div className="flex gap-1">
                <Button size="sm" variant={chartDays === 7 ? "default" : "outline"} onClick={() => setChartDays(7)} className="text-xs h-7 px-3">{t("admin.days7")}</Button>
                <Button size="sm" variant={chartDays === 30 ? "default" : "outline"} onClick={() => setChartDays(30)} className="text-xs h-7 px-3">{t("admin.days30")}</Button>
              </div>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <p className="text-muted-foreground text-sm text-center py-8">{t("admin.loading")}</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={dailyUsage.slice(-chartDays)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: string) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} labelFormatter={(v: string) => new Date(v).toLocaleDateString()} />
                    <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Total" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Usage by tool */}
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> {t("admin.usageByTool")}</CardTitle></CardHeader>
            <CardContent>
              {metricsLoading ? (
                <p className="text-muted-foreground text-sm text-center py-4">{t("admin.loading")}</p>
              ) : toolStats.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">{t("admin.noData")}</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={Math.max(200, toolStats.length * 36)}>
                    <BarChart data={toolStats} layout="vertical" margin={{ left: 120 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                      <YAxis type="category" dataKey="tool_name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={110} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="total_uses" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name={t("admin.totalUses")} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-3">
                    {toolStats.map(tl => {
                      const maxUses = toolStats[0]?.total_uses || 1;
                      const pct = (tl.total_uses / maxUses) * 100;
                      return (
                        <div key={tl.tool_id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{tl.tool_name}</span>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{tl.total_uses} {t("admin.uses")}</span>
                              <span>{tl.unique_users} {t("admin.users")}</span>
                              <Badge variant="outline" className="text-[10px]">{tl.today_uses} {t("admin.todayLabel")}</Badge>
                            </div>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Top users */}
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> {t("admin.topUsers")}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.rank")}</TableHead>
                    <TableHead>{t("admin.user")}</TableHead>
                    <TableHead>{t("admin.generations")}</TableHead>
                    <TableHead>{t("admin.lastUsed")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userStats.map((u, i) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                      <TableCell className="text-sm font-medium">{u.full_name}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{u.total_uses}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{u.last_used ? new Date(u.last_used).toLocaleDateString() : "—"}</TableCell>
                    </TableRow>
                  ))}
                  {userStats.length === 0 && (<TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">{t("admin.noData")}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions"><AdminCommissionsTab /></TabsContent>
      </Tabs>

      {/* EDIT USER DIALOG */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.editUser")}</DialogTitle>
            <DialogDescription>{editUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("admin.roleLabel")}</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(ROLE_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("admin.statusLabel")}</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("admin.statusActive")}</SelectItem>
                  <SelectItem value="inactive">{t("admin.statusInactive")}</SelectItem>
                  <SelectItem value="suspended">{t("admin.statusSuspended")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("admin.accessEndDate")}</Label>
              <Input type="date" value={editAccessEnd} onChange={(e) => setEditAccessEnd(e.target.value)} />
            </div>
            <div>
              <Label>{t("admin.agencyLabel")}</Label>
              <Select value={editAgencyId || "none"} onValueChange={(v) => setEditAgencyId(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder={t("admin.noAgency")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("admin.noAgency")}</SelectItem>
                  {agencies.map((a) => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isPaid" checked={editIsPaid} onChange={(e) => setEditIsPaid(e.target.checked)} className="rounded border-border" />
              <Label htmlFor="isPaid">{t("admin.paidUser")}</Label>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{t("admin.affiliateRole")}</Label>
                <p className="text-xs text-muted-foreground">
                  {editUser?.is_affiliate ? `${t("admin.affiliateActiveDesc")} · ${editUser?.affiliate_id}` : t("admin.affiliateInactiveDesc")}
                </p>
                {editUser?.is_affiliate && editUser?.affiliate_id && (
                  <div className="mt-1 space-y-1">
                    <p className="text-[10px] font-mono text-muted-foreground break-all">
                      https://es-ace-inmotools.lovable.app/auth?ref={editUser.affiliate_id}
                    </p>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { if (editUser) regenerateAffiliate(editUser.user_id); }}>
                      <Link2 className="h-3 w-3" /> {t("admin.regenerateLink")}
                    </Button>
                  </div>
                )}
              </div>
              <Switch checked={editUser?.is_affiliate || false} onCheckedChange={(checked) => { if (editUser) toggleAffiliate(editUser.user_id, checked); }} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>{t("admin.cancel")}</Button>
            <Button onClick={saveEditUser} className="bg-primary text-primary-foreground">{t("admin.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> {t("admin.confirmDelete")}</DialogTitle>
            <DialogDescription>{t("admin.confirmDeleteDesc", { email: deleteConfirm?.email })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t("admin.cancel")}</Button>
            <Button variant="destructive" onClick={() => { deleteUser(deleteConfirm!.user_id); setDeleteConfirm(null); }}>{t("admin.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AGENCY DIALOG */}
      <Dialog open={agencyDialog} onOpenChange={setAgencyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editAgency ? t("admin.editAgency") : t("admin.newAgencyTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("admin.name")}</Label><Input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} /></div>
            <div><Label>{t("admin.contactEmail")}</Label><Input type="email" value={agencyEmail} onChange={(e) => setAgencyEmail(e.target.value)} /></div>
            <div><Label>{t("admin.phone")}</Label><Input value={agencyPhone} onChange={(e) => setAgencyPhone(e.target.value)} /></div>
            <div><Label>{t("admin.maxAgents")}</Label><Input type="number" value={agencyMaxAgents} onChange={(e) => setAgencyMaxAgents(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAgencyDialog(false)}>{t("admin.cancel")}</Button>
            <Button onClick={saveAgency} className="bg-primary text-primary-foreground">{t("admin.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
