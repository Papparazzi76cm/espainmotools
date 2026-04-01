import PynmoLogo from "@/components/PynmoLogo";

const FooterSection = () => (
  <footer className="border-t border-border/40 py-12 px-4">
    <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
      <PynmoLogo size="sm" />
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <a href="/aviso-legal" className="hover:text-foreground transition-colors">Aviso Legal</a>
        <a href="/terminos" className="hover:text-foreground transition-colors">Términos y Condiciones</a>
        <a href="/afiliados" className="hover:text-foreground transition-colors">Programa de Afiliados</a>
        <a href="/politica-privacidad" className="hover:text-foreground transition-colors">Política de Privacidad</a>
        <a href="/politica-cookies" className="hover:text-foreground transition-colors">Política de Cookies</a>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        © {new Date().getFullYear()} Ace-inmotools. Hecho con IA para agentes inmobiliarios en España.
      </p>
    </div>
  </footer>
);

export default FooterSection;
