import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { tools } from "@/lib/tools";

interface ToolUsageStat {
  tool_id: string;
  tool_name: string;
  total_uses: number;
  unique_users: number;
  today_uses: number;
}

interface UserUsageStat {
  user_id: string;
  email: string;
  full_name: string;
  total_uses: number;
  last_used: string | null;
}

export function useAdminMetrics() {
  const [toolStats, setToolStats] = useState<ToolUsageStat[]>([]);
  const [userStats, setUserStats] = useState<UserUsageStat[]>([]);
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [todayGenerations, setTodayGenerations] = useState(0);
  const [loading, setLoading] = useState(true);

  const toolNameMap = Object.fromEntries(tools.map(t => [t.id, t.title]));

  const fetchMetrics = useCallback(async () => {
    setLoading(true);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Fetch all usage logs
    const { data: allLogs } = await supabase
      .from("usage_logs")
      .select("tool_id, user_id, used_at");

    if (!allLogs) { setLoading(false); return; }

    // Total & today
    setTotalGenerations(allLogs.length);
    const todayLogs = allLogs.filter(l => new Date(l.used_at) >= todayStart);
    setTodayGenerations(todayLogs.length);

    // Tool stats
    const toolMap: Record<string, { total: number; users: Set<string>; today: number }> = {};
    allLogs.forEach(l => {
      if (!toolMap[l.tool_id]) toolMap[l.tool_id] = { total: 0, users: new Set(), today: 0 };
      toolMap[l.tool_id].total++;
      toolMap[l.tool_id].users.add(l.user_id);
      if (new Date(l.used_at) >= todayStart) toolMap[l.tool_id].today++;
    });

    const tStats: ToolUsageStat[] = Object.entries(toolMap)
      .map(([id, d]) => ({
        tool_id: id,
        tool_name: toolNameMap[id] || id,
        total_uses: d.total,
        unique_users: d.users.size,
        today_uses: d.today,
      }))
      .sort((a, b) => b.total_uses - a.total_uses);
    setToolStats(tStats);

    // User stats
    const userMap: Record<string, { total: number; last: string | null }> = {};
    allLogs.forEach(l => {
      if (!userMap[l.user_id]) userMap[l.user_id] = { total: 0, last: null };
      userMap[l.user_id].total++;
      if (!userMap[l.user_id].last || l.used_at > userMap[l.user_id].last!) {
        userMap[l.user_id].last = l.used_at;
      }
    });

    // Fetch profiles for these users
    const userIds = Object.keys(userMap);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name");

    // We need emails from admin-users edge function, but for simplicity use profiles
    const profileMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p]));

    const uStats: UserUsageStat[] = userIds
      .map(uid => ({
        user_id: uid,
        email: "",
        full_name: profileMap[uid]?.full_name || "Usuario",
        total_uses: userMap[uid].total,
        last_used: userMap[uid].last,
      }))
      .sort((a, b) => b.total_uses - a.total_uses)
      .slice(0, 20);
    setUserStats(uStats);

    setLoading(false);
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  return { toolStats, userStats, totalGenerations, todayGenerations, loading, refetch: fetchMetrics };
}
