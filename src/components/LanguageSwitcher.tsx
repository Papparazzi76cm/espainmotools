import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  compact?: boolean;
}

const LanguageSwitcher = ({ compact = false }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("en") ? "en" : "es";

  const toggle = () => {
    i18n.changeLanguage(currentLang === "es" ? "en" : "es");
  };

  if (compact) {
    return (
      <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8 text-muted-foreground hover:text-foreground">
        <span className="text-xs font-semibold uppercase">{currentLang === "es" ? "EN" : "ES"}</span>
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggle} className="gap-1.5 text-muted-foreground hover:text-foreground">
      <Globe className="h-3.5 w-3.5" />
      <span className="text-xs font-medium uppercase">{currentLang === "es" ? "EN" : "ES"}</span>
    </Button>
  );
};

export default LanguageSwitcher;
