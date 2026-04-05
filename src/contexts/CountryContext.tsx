import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useCountryConfig, CountryConfig } from "@/hooks/useCountryConfig";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CountryContextType {
  countries: CountryConfig[];
  selectedCountry: CountryConfig | null;
  setCountryCode: (code: string) => void;
  loading: boolean;
}

const CountryContext = createContext<CountryContextType | null>(null);

export const useCountry = () => {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
};

const STORAGE_KEY = "ace-inmotools-country";

export function CountryProvider({ children }: { children: ReactNode }) {
  const { countries, loading } = useCountryConfig();
  const { user } = useAuth();
  const [selectedCode, setSelectedCode] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || "es";
  });
  const [profileLoaded, setProfileLoaded] = useState(false);

  // On first login, load user's country from profile
  useEffect(() => {
    if (!user || profileLoaded) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("country_code")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.country_code) {
        setSelectedCode(data.country_code);
        localStorage.setItem(STORAGE_KEY, data.country_code);
      }
      setProfileLoaded(true);
    })();
  }, [user, profileLoaded]);

  // Reset when user logs out
  useEffect(() => {
    if (!user) setProfileLoaded(false);
  }, [user]);

  const selectedCountry = countries.find(c => c.country_code === selectedCode) || countries[0] || null;

  const setCountryCode = (code: string) => {
    setSelectedCode(code);
    localStorage.setItem(STORAGE_KEY, code);
    // Also persist to profile if logged in
    if (user) {
      supabase.from("profiles").update({ country_code: code } as any).eq("user_id", user.id).then();
    }
  };

  // If stored code doesn't match any country, default to 'es'
  useEffect(() => {
    if (!loading && countries.length > 0 && !countries.find(c => c.country_code === selectedCode)) {
      setCountryCode("es");
    }
  }, [loading, countries, selectedCode]);

  return (
    <CountryContext.Provider value={{ countries, selectedCountry, setCountryCode, loading }}>
      {children}
    </CountryContext.Provider>
  );
}
