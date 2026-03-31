import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Zap } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-16 overflow-hidden">
      {/* Gradient orbs with pulse */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[128px] glow-pulse bg-primary/30" />
      <div
        className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full blur-[100px] glow-pulse bg-yellow-400/20"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[180px] glow-pulse bg-primary/10"
        style={{ animationDelay: "0.75s" }}
      />

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(240_12%_24%)_80%)]" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-sm font-medium backdrop-blur-sm glow-pulse">
            <Zap className="h-3.5 w-3.5" />
            Potenciado por Inteligencia Artificial
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="text-foreground">Tu suite completa</span>
          <br />
          <span
            className="text-primary"
            style={{ animation: "text-glow-pulse 3s ease-in-out infinite" }}
          >
            inmobiliaria con IA
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed px-2"
        >
          11 herramientas inteligentes en una sola plataforma. Captación, comercialización, análisis legal y contenido —
          todo lo que necesitas como agente inmobiliario en España.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            size="lg"
            onClick={onGetStarted}
            className="group text-base px-8 py-6 rounded-xl bg-gradient-to-r from-yellow-500 via-primary to-amber-400 hover:from-yellow-400 hover:via-yellow-300 hover:to-amber-300 border-0 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 glow-pulse text-gray-900 font-semibold"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Empezar Gratis
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onGetStarted}
            className="text-base px-8 py-6 rounded-xl border-primary/30 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
          >
            Ver Demo
          </Button>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto"
        >
          {[
            { value: "10+", label: "Herramientas IA" },
            { value: "24/7", label: "Disponible" },
            { value: "∞", label: "Generaciones" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div
                className="text-2xl sm:text-3xl font-bold text-primary"
                style={{ animation: "text-glow-pulse 3s ease-in-out infinite", animationDelay: `${i * 0.5}s` }}
              >
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
