import PynmoLogo from "@/components/PynmoLogo";

const FooterSection = () => (
  <footer className="border-t border-border/40 py-12 px-4">
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <PynmoLogo size="sm" />
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} Espainmotools. Hecho con IA para agentes inmobiliarios en España.
      </p>
    </div>
  </footer>
);

export default FooterSection;
