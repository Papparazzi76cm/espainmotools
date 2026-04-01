import PynmoLogo from "@/components/PynmoLogo";

const FooterSection = () => (
  <footer className="border-t border-border/40 py-12 px-4">
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <PynmoLogo size="sm" />
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <a href="/afiliados" className="hover:text-foreground transition-colors">Programa de Afiliados</a>
        <a href="/politica-privacidad" className="hover:text-foreground transition-colors">Política de Privacidad</a>
        <a href="/politica-cookies" className="hover:text-foreground transition-colors">Política de Cookies</a>
      </div>
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ace-inmotools. Hecho con IA para agentes inmobiliarios en España.
      </p>
    </div>
  </footer>
);

export default FooterSection;
