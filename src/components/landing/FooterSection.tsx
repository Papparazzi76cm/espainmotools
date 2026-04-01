import PynmoLogo from "@/components/PynmoLogo";
import { useTranslation } from "react-i18next";

const FooterSection = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/40 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
        <PynmoLogo size="sm" />
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <a href="/aviso-legal" className="hover:text-foreground transition-colors">{t("footer.legalNotice")}</a>
          <a href="/terminos" className="hover:text-foreground transition-colors">{t("footer.terms")}</a>
          <a href="/afiliados" className="hover:text-foreground transition-colors">{t("footer.affiliates")}</a>
          <a href="/politica-privacidad" className="hover:text-foreground transition-colors">{t("footer.privacy")}</a>
          <a href="/politica-cookies" className="hover:text-foreground transition-colors">{t("footer.cookies")}</a>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
