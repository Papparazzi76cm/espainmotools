import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { blogCoverImages } from "@/lib/blogImages";
import ParticleField from "@/components/landing/ParticleField";
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
  content_es: string;
  content_en: string;
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

/** Simple markdown-like renderer for ## headings, **bold**, - lists, numbered lists */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-xl font-semibold mt-8 mb-3 text-foreground">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-2xl font-bold mt-10 mb-4 text-foreground">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith("- **")) {
      const match = trimmed.match(/^- \*\*(.+?)\*\*:?\s*(.*)/);
      if (match) {
        elements.push(
          <li key={i} className="ml-4 mb-2 text-muted-foreground list-disc list-outside">
            <strong className="text-foreground">{match[1]}</strong>{match[2] ? `: ${match[2]}` : ""}
          </li>
        );
      } else {
        elements.push(<li key={i} className="ml-4 mb-2 text-muted-foreground list-disc list-outside">{formatBold(trimmed.slice(2))}</li>);
      }
    } else if (trimmed.startsWith("- ")) {
      elements.push(<li key={i} className="ml-4 mb-2 text-muted-foreground list-disc list-outside">{formatBold(trimmed.slice(2))}</li>);
    } else if (/^\d+\.\s\*\*/.test(trimmed)) {
      const match = trimmed.match(/^\d+\.\s\*\*(.+?)\*\*\s*(.*)/);
      if (match) {
        elements.push(
          <li key={i} className="ml-4 mb-2 text-muted-foreground list-decimal list-outside">
            <strong className="text-foreground">{match[1]}</strong>{match[2] ? ` ${match[2]}` : ""}
          </li>
        );
      }
    } else if (trimmed === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<p key={i} className="text-muted-foreground leading-relaxed mb-2">{formatBold(trimmed)}</p>);
    }
  });

  return elements;
}

function formatBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part));
}

const BlogPostPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const isEn = i18n.language?.startsWith("en");

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      setPost(data as BlogPost | null);
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  const openAuth = (login = true) => navigate("/auth");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t("blog.loading")}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{t("blog.notFound")}</p>
        <Button onClick={() => navigate("/blog")}>{t("blog.backToBlog")}</Button>
      </div>
    );
  }

  const title = isEn ? post.title_en : post.title_es;
  const content = isEn ? post.content_en : post.content_es;
  const excerpt = isEn ? post.excerpt_en : post.excerpt_es;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": excerpt,
    "author": { "@type": "Person", "name": post.author },
    "datePublished": post.published_at,
    "image": post.cover_image,
    "publisher": {
      "@type": "Organization",
      "name": "Ace-Inmotools",
    },
  };

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <SEOHead
        title={title}
        description={excerpt}
        canonical={`https://es-ace-inmotools.lovable.app/blog/${post.slug}`}
        jsonLd={articleJsonLd}
      />
      <ParticleField />
      <LandingNav onGetStarted={() => openAuth(false)} onLogin={() => openAuth(true)} />

      <article className="relative pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/blog")}
              className="gap-1 text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("blog.backToBlog")}
            </Button>

            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className={`text-xs ${categoryColors[post.category] || categoryColors.general}`}>
                {t(`blog.categories.${post.category}`)}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                {post.author}
              </div>
              {post.published_at && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.published_at).toLocaleDateString(isEn ? "en-US" : "es-ES", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">{title}</h1>

            {post.cover_image && (
              <div className="rounded-xl overflow-hidden mb-10">
                <img
                  src={post.cover_image}
                  alt={title}
                  className="w-full h-64 sm:h-80 object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <div className="prose-custom">
              {renderMarkdown(content)}
            </div>

            <div className="mt-16 pt-8 border-t border-border/40 text-center">
              <p className="text-muted-foreground mb-4">{t("blog.cta")}</p>
              <Button onClick={() => navigate("/auth")} className="rounded-xl shadow-sm shadow-primary/20">
                {t("blog.ctaButton")}
              </Button>
            </div>
          </motion.div>
        </div>
      </article>

      <FooterSection />
    </div>
  );
};

export default BlogPostPage;
