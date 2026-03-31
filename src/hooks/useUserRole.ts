import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setRole(data?.role || null);
        setLoading(false);
      });
  }, [user]);

  const isAgency = role === "agencia" || role === "agencia_xl";
  return { role, isAdmin: role === "admin", isTester: role === "tester", isAgency, loading };
}
