import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PynmoLogo from "@/components/PynmoLogo";

interface LandingNavProps {
  onGetStarted: () => void;
}

const LandingNav = ({ onGetStarted }: LandingNavProps) => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between px-4 py-2 sm:py-0 sm:h-16 gap-1 sm:gap-0">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <PynmoLogo size="sm" className="flex-shrink-0" />
          <div className="flex items-center gap-1.5 sm:hidden">
            <Button variant="ghost" size="sm" onClick={onGetStarted} className="text-xs px-2 h-8">
              Iniciar Sesión
            </Button>
            <Button size="sm" onClick={onGetStarted} className="rounded-lg shadow-sm shadow-primary/20 text-xs px-2.5 h-8">
              Registrarse
            </Button>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Herramientas</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">Cómo funciona</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Precios</a>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onGetStarted}>
            Iniciar Sesión
          </Button>
          <Button size="sm" onClick={onGetStarted} className="rounded-lg shadow-sm shadow-primary/20">
            Registrarse
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default LandingNav;
