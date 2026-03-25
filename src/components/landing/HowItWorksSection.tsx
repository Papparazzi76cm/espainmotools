import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import step1Img from "@/assets/steps/step-1-register.png";
import step2Img from "@/assets/steps/step-2-tool.png";
import step3Img from "@/assets/steps/step-3-result.png";

const steps = [
  {
    number: "01",
    title: "Regístrate gratis",
    description: "Crea tu cuenta en segundos y accede a todas las herramientas con 30 días de prueba gratuita.",
    image: step1Img,
  },
  {
    number: "02",
    title: "Elige tu herramienta",
    description: "Selecciona la herramienta que necesitas: descripciones, análisis legal, anuncios, costes y más.",
    image: step2Img,
  },
  {
    number: "03",
    title: "Obtén resultados al instante",
    description: "La IA genera contenido profesional en segundos. Copia, descarga o comparte directamente.",
    image: step3Img,
  },
];

const HowItWorksSection = () => {
  return (
    <section className="relative py-24 px-4" id="how-it-works">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-4">
            <Rocket className="h-3 w-3" /> Cómo funciona
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Tres pasos para{" "}
            <span className="bg-gradient-to-r from-blue-400 via-primary to-cyan-400 bg-clip-text text-transparent">
              transformar tu trabajo
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Empezá a generar resultados profesionales en menos de un minuto.
          </p>
        </motion.div>

        {/* Vertical timeline line */}
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden lg:block" />

          <div className="space-y-20 lg:space-y-28">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                    !isEven ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Text side */}
                  <div className={`flex-1 ${isEven ? "lg:text-right" : "lg:text-left"}`}>
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <span
                        className="text-5xl sm:text-6xl font-black text-primary/20 block mb-2"
                        style={{ animation: "text-glow-pulse 3s ease-in-out infinite", animationDelay: `${index * 0.8}s` }}
                      >
                        {step.number}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
                        {step.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Center dot (timeline node) */}
                  <div className="hidden lg:flex items-center justify-center relative z-10">
                    <div className="w-4 h-4 rounded-full bg-primary glow-pulse border-2 border-background" />
                  </div>

                  {/* Image side */}
                  <div className="flex-1">
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? 30 : -30, scale: 0.95 }}
                      whileInView={{ opacity: 1, x: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      className="relative group"
                    >
                      {/* Glow behind image */}
                      <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 to-cyan-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card/50 shadow-2xl shadow-primary/5 group-hover:shadow-primary/20 transition-shadow duration-500">
                        <img
                          src={step.image}
                          alt={step.title}
                          width={960}
                          height={640}
                          loading="lazy"
                          className="w-full h-auto"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent opacity-40" />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
