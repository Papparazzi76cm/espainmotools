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

export interface DailyUsage {
  date: string;
  total: number;
  [toolId: string]: number | string;
}

export function useAdminMetrics() {
  const [toolStats, setToolStats] = useState<ToolUsageStat[]>([]);
  const [userStats, setUserStats] = useState<UserUsageStat[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [todayGenerations, setTodayGenerations] = useState(0);
  const [loading, setLoading] = useState(true);

  const toolNameMap = Object.fromEntries(tools.map(t => [t.id, t.title]));

  const fetchMetrics = useCallback(async () => {
    setLoading(true);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: allLogs } = await supabase
      .from("usage_logs")
      .select("tool_id, user_id, used_at");

    if (!allLogs) { setLoading(false); return; }

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

    // Daily usage (last 30 days)
    const days: DailyUsage[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const entry: DailyUsage = { date: dateStr, total: 0 };
      days.push(entry);
    }

    const dateMap = Object.fromEntries(days.map((d, i) => [d.date, i]));
    allLogs.forEach(l => {
      const dateStr = l.used_at.split("T")[0];
      const idx = dateMap[dateStr];
      if (idx !== undefined) {
        days[idx].total++;
        const toolKey = l.tool_id;
        days[idx][toolKey] = ((days[idx][toolKey] as number) || 0) + 1;
      }
    });
    setDailyUsage(days);

    // User stats
    const userMap: Record<string, { total: number; last: string | null }> = {};
    allLogs.forEach(l => {
      if (!userMap[l.user_id]) userMap[l.user_id] = { total: 0, last: null };
      userMap[l.user_id].total++;
      if (!userMap[l.user_id].last || l.used_at > userMap[l.user_id].last!) {
        userMap[l.user_id].last = l.used_at;
      }
    });

    const userIds = Object.keys(userMap);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name");

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

  const exportCSV = useCallback(() => {
    // Build CSV from tool stats + user stats
    let csv = "MÉTRICAS POR HERRAMIENTA\n";
    csv += "Herramienta,Usos totales,Usuarios únicos,Usos hoy\n";
    toolStats.forEach(t => {
      csv += `"${t.tool_name}",${t.total_uses},${t.unique_users},${t.today_uses}\n`;
    });
    csv += "\nTOP USUARIOS\n";
    csv += "Usuario,Generaciones,Último uso\n";
    userStats.forEach(u => {
      csv += `"${u.full_name}",${u.total_uses},"${u.last_used ? new Date(u.last_used).toLocaleDateString("es-ES") : "—"}"\n`;
    });
    csv += "\nUSO DIARIO (últimos 30 días)\n";
    csv += "Fecha,Total\n";
    dailyUsage.forEach(d => {
      csv += `${d.date},${d.total}\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metricas-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [toolStats, userStats, dailyUsage]);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  return { toolStats, userStats, dailyUsage, totalGenerations, todayGenerations, loading, refetch: fetchMetrics, exportCSV };
}
