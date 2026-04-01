import { motion } from "framer-motion";
import { tools } from "@/lib/tools";
import { toolImages } from "@/lib/toolImages";
import { Cpu } from "lucide-react";
import { useTranslation } from "react-i18next";

const FeatureCards = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 px-4" id="features">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-4">
            <Cpu className="h-3 w-3" /> {t("features.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("features.title")}{" "}
            <span className="text-primary">{t("features.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t("features.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative rounded-2xl border border-border/40 bg-card/50 backdrop-blur-xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40"
            >
              <div className="relative h-40 overflow-hidden">
                <img src={toolImages[tool.id]} alt={t(`tools.${tool.id}.title`)} width={800} height={512} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 backdrop-blur-md flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                    <tool.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  {tool.ready ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/70 backdrop-blur-md border border-primary/30 text-[10px] font-medium text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary glow-pulse" />
                      {t("features.available")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/70 backdrop-blur-md border border-border/40 text-[10px] font-medium text-muted-foreground">
                      {t("features.comingSoon")}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative p-5 pt-3">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-foreground font-semibold mb-1.5 group-hover:text-primary transition-colors duration-300">
                  {t(`tools.${tool.id}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`tools.${tool.id}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
