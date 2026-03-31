import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, ChevronDown, ChevronUp, Trash2, Eye } from "lucide-react";
import type { ToolHistoryEntry } from "@/hooks/useToolHistory";

interface ToolHistoryPanelProps {
  history: ToolHistoryEntry[];
  loading: boolean;
  onLoad: (entry: ToolHistoryEntry) => void;
  onDelete: (id: string) => void;
}

export function ToolHistoryPanel({ history, loading, onLoad, onDelete }: ToolHistoryPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (history.length === 0 && !loading) return null;

  return (
    <Card className="glass-card">
      <CardHeader
        className="pb-2 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-primary" />
            Histórico ({history.length})
          </CardTitle>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          {loading ? (
            <p className="text-xs text-muted-foreground">Cargando...</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2 rounded-md border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-xs font-medium truncate">{entry.title || "Sin título"}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onLoad(entry)}
                      title="Cargar resultado"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onDelete(entry.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
