import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CountryConfig {
  id: string;
  country_code: string;
  country_name: string;
  flag_emoji: string;
  currency_code: string;
  currency_symbol: string;
  legislation: Record<string, string>;
  tax_config: Record<string, string | number>;
  terminology: Record<string, string>;
  legal_references: string;
  ai_context_prompt: string;
  is_active: boolean;
}

export function useCountryConfig() {
  const [countries, setCountries] = useState<CountryConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("country_config")
        .select("*")
        .eq("is_active", true)
        .order("country_name");

      if (!error && data) {
        setCountries(data as unknown as CountryConfig[]);
      }
      setLoading(false);
    })();
  }, []);

  return { countries, loading };
}
