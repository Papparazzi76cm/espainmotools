import { ReactNode } from "react";
import { useToolPermission } from "@/hooks/useToolPermission";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ToolGuardProps {
  toolId: string;
  children: ReactNode;
}

export function ToolGuard({ toolId, children }: ToolGuardProps) {
  const { hasPermission, loading } = useToolPermission(toolId);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="max-w-md mx-auto mt-20 animate-fade-in">
        <Card className="glass-card">
          <CardContent className="p-8 text-center space-y-4">
            <ShieldX className="h-12 w-12 mx-auto text-destructive opacity-60" />
            <h2 className="text-lg font-semibold">Acceso restringido</h2>
            <p className="text-sm text-muted-foreground">
              No tienes permisos para acceder a esta herramienta. Contacta con tu agencia para solicitar acceso.
            </p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
