import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useCountryConfig, CountryConfig } from "@/hooks/useCountryConfig";

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
  const [selectedCode, setSelectedCode] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || "es";
  });

  const selectedCountry = countries.find(c => c.country_code === selectedCode) || countries[0] || null;

  const setCountryCode = (code: string) => {
    setSelectedCode(code);
    localStorage.setItem(STORAGE_KEY, code);
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
