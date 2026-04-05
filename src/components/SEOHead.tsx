import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

interface SEOHeadProps {
  titleKey?: string;
  descriptionKey?: string;
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const SEOHead = ({
  titleKey,
  descriptionKey,
  title: rawTitle,
  description: rawDescription,
  canonical,
  noindex = false,
  jsonLd,
}: SEOHeadProps) => {
  const { t, i18n } = useTranslation();

  const title = rawTitle || (titleKey ? t(titleKey) : "Ace-Inmotools");
  const description =
    rawDescription ||
    (descriptionKey
      ? t(descriptionKey)
      : t("seo.defaultDescription"));

  const fullTitle =
    title === "Ace-Inmotools" ? title : `${title} | Ace-Inmotools`;

  const url = canonical || window.location.href;

  return (
    <Helmet>
      <html lang={i18n.language} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta
        property="og:image"
        content="https://storage.googleapis.com/gpt-engineer-file-uploads/9lrjNxInpQQZyE60hVifhRyc6BG2/social-images/social-1774944872782-Captura_de_pantalla_2026-03-30_133117.webp"
      />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEOHead;
