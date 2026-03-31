import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

export function useToolPermission(toolId: string) {
  const { user } = useAuth();
  const { role, isAdmin, isTester, isAgency, loading: roleLoading } = useUserRole();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roleLoading || !user) return;

    // Admin, tester, agencia, agencia_xl → full access
    if (isAdmin || isTester || isAgency) {
      setHasPermission(true);
      setLoading(false);
      return;
    }

    // Agente → check user_permissions
    if (role === "agente") {
      (async () => {
        const { data } = await supabase
          .from("user_permissions")
          .select("permission_id, permissions:permission_id(name)")
          .eq("user_id", user.id);

        const toolNames = data?.map((d: any) => d.permissions?.name).filter(Boolean) || [];
        setHasPermission(toolNames.includes(toolId));
        setLoading(false);
      })();
      return;
    }

    // No role (regular user) → allow (trial/paid system handles limits)
    setHasPermission(true);
    setLoading(false);
  }, [user, role, roleLoading, isAdmin, isTester, isAgency, toolId]);

  return { hasPermission, loading };
}
