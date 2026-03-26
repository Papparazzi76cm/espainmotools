import { tools } from "@/lib/tools";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PynmoLogo from "@/components/PynmoLogo";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <PynmoLogo size="lg" />
          <h1 className="text-2xl font-semibold text-foreground">
            Bienvenido a <span className="text-foreground">Espainmo</span><span className="text-primary">tools</span>
          </h1>
        </div>
        <p className="text-muted-foreground">
          Tu suite de herramientas con IA para el sector inmobiliario en España.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            className={`glass-card tool-card-hover cursor-pointer group ${
              !tool.ready ? "opacity-70" : ""
            }`}
            onClick={() => tool.ready && navigate(tool.path)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <tool.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                {!tool.ready && (
                  <Badge variant="secondary" className="text-[10px]">
                    Próximamente
                  </Badge>
                )}
              </div>
              <h3 className="font-medium text-foreground text-sm mb-1">
                {tool.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tool.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
