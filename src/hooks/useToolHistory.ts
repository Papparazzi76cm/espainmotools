import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ToolHistoryEntry {
  id: string;
  tool_id: string;
  title: string;
  input_data: any;
  result_data: any;
  created_at: string;
}

export function useToolHistory(toolId: string) {
  const [history, setHistory] = useState<ToolHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("tool_history")
      .select("*")
      .eq("tool_id", toolId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setHistory(data || []);
    setLoading(false);
  }, [user, toolId]);

  const saveResult = useCallback(async (title: string, inputData: any, resultData: any) => {
    if (!user) return;
    await (supabase as any).from("tool_history").insert({
      user_id: user.id,
      tool_id: toolId,
      title,
      input_data: inputData,
      result_data: resultData,
    });
    await fetchHistory();
  }, [user, toolId, fetchHistory]);

  const deleteEntry = useCallback(async (id: string) => {
    await (supabase as any).from("tool_history").delete().eq("id", id);
    setHistory(prev => prev.filter(h => h.id !== id));
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, saveResult, deleteEntry, fetchHistory };
}

/** Fetch history for a specific tool (used cross-tool, e.g. Informes loading Descripciones) */
export async function fetchToolHistoryByTool(toolId: string): Promise<ToolHistoryEntry[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await (supabase as any)
    .from("tool_history")
    .select("*")
    .eq("tool_id", toolId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  return data || [];
}
