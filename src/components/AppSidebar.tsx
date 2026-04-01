import { useState, useEffect } from "react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { tools, dashboardItem } from "@/lib/tools";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { TrialCountdown } from "@/components/TrialCountdown";
import { LogOut, Shield, Building2, Link2 } from "lucide-react";
import PynmoLogo from "@/components/PynmoLogo";
import { supabase } from "@/integrations/supabase/client";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { isAdmin, isTester, role } = useUserRole();
  const isAgency = role === "agencia" || role === "agencia_xl";

  const [isAffiliate, setIsAffiliate] = useState(false);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("affiliates").select("is_active").eq("user_id", user.id).eq("is_active", true).maybeSingle();
      setIsAffiliate(!!data);
    })();
  }, [user]);

  const [allowedTools, setAllowedTools] = useState<string[] | null>(null);
  useEffect(() => {
    if (role !== "agente" || !user) { setAllowedTools(null); return; }
    (async () => {
      const { data } = await supabase.from("user_permissions").select("permission_id, permissions:permission_id(name)").eq("user_id", user.id);
      const names = data?.map((d: any) => d.permissions?.name).filter(Boolean) || [];
      setAllowedTools(names);
    })();
  }, [role, user]);

  const visibleTools = allowedTools !== null ? tools.filter(t => allowedTools.includes(t.id)) : tools;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex flex-col gap-0.5">
          <PynmoLogo size={collapsed ? "sm" : "md"} />
          {!collapsed && <span className="text-sidebar-muted text-[10px] leading-tight">{t("sidebar.playground")}</span>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to={dashboardItem.path} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                    <dashboardItem.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>{t("dashboard.title")}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider">{t("sidebar.tools")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleTools.map((tool) => (
                <SidebarMenuItem key={tool.id}>
                  <SidebarMenuButton asChild>
                    <NavLink to={tool.path} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <tool.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate">{t(`tools.${tool.id}.title`)}</span>
                          {!tool.ready && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 border-sidebar-muted text-sidebar-muted ml-1 flex-shrink-0">{t("sidebar.soon")}</Badge>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider">{t("sidebar.administration")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin" className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <Shield className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{t("sidebar.adminPanel")}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAgency && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider">{t("sidebar.myAgency")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/mi-agencia" className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{t("sidebar.agentManagement")}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAffiliate && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider">{t("sidebar.affiliate")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/mi-afiliado" className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <Link2 className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{t("sidebar.myLink")}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && <LanguageSwitcher />}
        {!collapsed && <TrialCountdown />}
        {!collapsed && user && (
          <div className="space-y-2">
            <p className="text-[11px] text-sidebar-muted truncate px-1">{user.email}</p>
            <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 text-xs">
              <LogOut className="h-3.5 w-3.5 mr-2" />{t("sidebar.logout")}
            </Button>
          </div>
        )}
        {collapsed && (
          <>
            <LanguageSwitcher compact />
            <Button variant="ghost" size="icon" onClick={signOut} className="w-full text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
