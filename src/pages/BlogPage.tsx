import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ParticleField from "@/components/landing/ParticleField";
import { blogCoverImages } from "@/lib/blogImages";
import LandingNav from "@/components/landing/LandingNav";
import FooterSection from "@/components/landing/FooterSection";
import SEOHead from "@/components/SEOHead";

interface BlogPost {
  id: string;
  slug: string;
  title_es: string;
  title_en: string;
  excerpt_es: string;
  excerpt_en: string;
  cover_image: string | null;
  category: string;
  author: string;
  published_at: string | null;
}

const categoryColors: Record<string, string> = {
  captacion: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  marketing: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  legal: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  general: "bg-primary/10 text-primary border-primary/30",
};

const BlogPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const isEn = i18n.language?.startsWith("en");

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title_es, title_en, excerpt_es, excerpt_en, cover_image, category, author, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      setPosts((data as BlogPost[]) || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const openAuth = (login = true) => navigate("/auth");

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <SEOHead
        title={isEn ? "Blog – Real Estate AI Insights" : "Blog – Recursos para Agentes Inmobiliarios"}
        description={isEn ? "Expert guides on AI tools for real estate, market trends, and lead generation strategies." : "Guías sobre herramientas IA para inmobiliarias, tendencias del mercado y estrategias de captación."}
        canonical="https://es-ace-inmotools.lovable.app/blog"
      />
      <ParticleField />
      <LandingNav onGetStarted={() => openAuth(false)} onLogin={() => openAuth(true)} />

      <section className="relative pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="gap-1 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                {t("blog.backToHome")}
              </Button>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-3">
              <span className="text-foreground">{t("blog.title")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              {t("blog.subtitle")}
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border/50 bg-card animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg" />
                  <CardContent className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-20" />
                    <div className="h-6 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              {t("blog.noPosts")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card
                    className="group border-border/50 bg-card hover:border-primary/40 transition-all duration-300 cursor-pointer overflow-hidden h-full flex flex-col"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
                    {post.cover_image && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={post.cover_image}
                          alt={isEn ? post.title_en : post.title_es}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <CardContent className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className={`text-xs ${categoryColors[post.category] || categoryColors.general}`}>
                          {t(`blog.categories.${post.category}`)}
                        </Badge>
                      </div>
                      <h2 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {isEn ? post.title_en : post.title_es}
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                        {isEn ? post.excerpt_en : post.excerpt_es}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border/30">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          {post.author}
                        </div>
                        {post.published_at && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(post.published_at).toLocaleDateString(isEn ? "en-US" : "es-ES", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default BlogPage;
