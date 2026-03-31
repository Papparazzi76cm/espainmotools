import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminUser {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  agency_id: string | null;
  agency_name: string | null;
  access_start: string | null;
  access_end: string | null;
  trial_end: string | null;
  trial_start: string | null;
  is_paid: boolean;
  created_at: string;
}

export interface Agency {
  id: string;
  name: string;
  contact_email: string | null;
  phone: string | null;
  contract_start: string;
  contract_end: string | null;
  max_agents: number;
  status: string;
  created_at: string;
}

async function callAdmin(action: string, params: Record<string, unknown> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await supabase.functions.invoke("admin-users", {
    body: { action, ...params },
  });

  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await callAdmin("list_users");
      setUsers(data.users || []);
    } catch (e: any) {
      toast.error("Error al cargar usuarios: " + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAgencies = useCallback(async () => {
    try {
      const data = await callAdmin("list_agencies");
      setAgencies(data.agencies || []);
    } catch (e: any) {
      toast.error("Error al cargar agencias: " + e.message);
    }
  }, []);

  const updateUserRole = async (user_id: string, role: string) => {
    try {
      await callAdmin("update_user_role", { user_id, role });
      toast.success("Rol actualizado");
      await fetchUsers();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const updateUserStatus = async (user_id: string, status: string) => {
    try {
      await callAdmin("update_user_status", { user_id, status });
      toast.success("Estado actualizado");
      await fetchUsers();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const updateUserAccess = async (user_id: string, access_start: string, access_end: string | null, is_paid?: boolean) => {
    try {
      await callAdmin("update_user_access", { user_id, access_start, access_end, is_paid });
      toast.success("Acceso actualizado");
      await fetchUsers();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const assignAgency = async (user_id: string, agency_id: string | null) => {
    try {
      await callAdmin("assign_agency", { user_id, agency_id });
      toast.success("Agencia asignada");
      await fetchUsers();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const deleteUser = async (user_id: string) => {
    try {
      await callAdmin("delete_user", { user_id });
      toast.success("Usuario eliminado");
      await fetchUsers();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const createAgency = async (data: Partial<Agency>) => {
    try {
      const res = await callAdmin("create_agency", data);
      toast.success("Agencia creada");
      await fetchAgencies();
      return res.agency;
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const updateAgency = async (agency_id: string, data: Partial<Agency>) => {
    try {
      await callAdmin("update_agency", { agency_id, ...data });
      toast.success("Agencia actualizada");
      await fetchAgencies();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const deleteAgency = async (agency_id: string) => {
    try {
      await callAdmin("delete_agency", { agency_id });
      toast.success("Agencia eliminada");
      await fetchAgencies();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  return {
    users, agencies, loading,
    fetchUsers, fetchAgencies,
    updateUserRole, updateUserStatus, updateUserAccess,
    assignAgency, deleteUser,
    createAgency, updateAgency, deleteAgency,
  };
}
