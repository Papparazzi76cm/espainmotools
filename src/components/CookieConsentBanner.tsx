import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "cookie_consent";

const CookieConsentBanner = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => { localStorage.setItem(COOKIE_CONSENT_KEY, "accepted"); setVisible(false); };
  const reject = () => { localStorage.setItem(COOKIE_CONSENT_KEY, "rejected"); setVisible(false); };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg"
        >
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xl shadow-black/10">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 shrink-0"><Cookie className="h-5 w-5 text-primary" /></div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("cookieConsent.message")}{" "}
                  <a href="/politica-cookies" className="text-primary underline hover:text-primary/80">{t("cookieConsent.policyLink")}</a>.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={accept} className="rounded-xl">{t("cookieConsent.accept")}</Button>
                  <Button size="sm" variant="outline" onClick={reject} className="rounded-xl">{t("cookieConsent.reject")}</Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
