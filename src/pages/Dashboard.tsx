import { tools } from "@/lib/tools";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PynmoLogo from "@/components/PynmoLogo";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/SEOHead";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <SEOHead titleKey="seo.dashboard.title" descriptionKey="seo.dashboard.description" noindex />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <PynmoLogo size="lg" />
          <h1 className="text-2xl font-semibold text-foreground">
            {t("dashboard.welcome")} <span className="text-foreground">Ace-</span>
            <span className="text-primary">Inmotools</span>
          </h1>
        </div>
        <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            className={`glass-card tool-card-hover cursor-pointer group ${!tool.ready ? "opacity-70" : ""}`}
            onClick={() => tool.ready && navigate(tool.path)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <tool.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                {!tool.ready && (
                  <Badge variant="secondary" className="text-[10px]">
                    {t("dashboard.comingSoon")}
                  </Badge>
                )}
              </div>
              <h3 className="font-medium text-foreground text-sm mb-1">{t(`tools.${tool.id}.title`)}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{t(`tools.${tool.id}.description`)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
