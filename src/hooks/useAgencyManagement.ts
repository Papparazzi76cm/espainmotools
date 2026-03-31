import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Agent {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  access_start: string | null;
  access_end: string | null;
  trial_end: string | null;
  is_paid: boolean;
  permissions: string[];
  created_at: string;
}

export interface AgencyInfo {
  id: string;
  name: string;
  contact_email: string | null;
  phone: string | null;
  contract_start: string;
  contract_end: string | null;
  max_agents: number;
  status: string;
}

async function callAgency(action: string, params: Record<string, unknown> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await supabase.functions.invoke("agency-management", {
    body: { action, ...params },
  });

  if (res.error) throw new Error(res.error.message);
  if (res.data?.error) throw new Error(res.data.error);
  return res.data;
}

export function useAgencyManagement() {
  const [agency, setAgency] = useState<AgencyInfo | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAgencyInfo = useCallback(async () => {
    try {
      const data = await callAgency("get_agency_info");
      setAgency(data.agency);
    } catch (e: any) {
      toast.error("Error al cargar info de agencia: " + e.message);
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await callAgency("list_agents");
      setAgents(data.agents || []);
    } catch (e: any) {
      toast.error("Error al cargar agentes: " + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const inviteAgent = async (email: string, full_name?: string) => {
    try {
      const data = await callAgency("invite_agent", { email, full_name });
      toast.success(data.message || "Agente invitado");
      await fetchAgents();
      return data;
    } catch (e: any) {
      toast.error("Error: " + e.message);
      return null;
    }
  };

  const removeAgent = async (user_id: string) => {
    try {
      await callAgency("remove_agent", { user_id });
      toast.success("Agente eliminado de la agencia");
      await fetchAgents();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const updateAgentPermissions = async (user_id: string, permission_names: string[]) => {
    try {
      await callAgency("update_agent_permissions", { user_id, permission_names });
      toast.success("Permisos actualizados");
      await fetchAgents();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  return {
    agency, agents, loading,
    fetchAgencyInfo, fetchAgents,
    inviteAgent, removeAgent, updateAgentPermissions,
  };
}
