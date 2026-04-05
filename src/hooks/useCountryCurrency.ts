import { useMemo } from "react";
import { useCountry } from "@/contexts/CountryContext";

export function useCountryCurrency() {
  const { selectedCountry } = useCountry();
  const currencyCode = selectedCountry?.currency_code || "EUR";
  const currencySymbol = selectedCountry?.currency_symbol || "€";
  const countryName = selectedCountry?.country_name || "España";
  const countryCode = selectedCountry?.country_code || "es";

  const fmt = useMemo(() => {
    return (n: number) => {
      try {
        return new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: currencyCode,
          maximumFractionDigits: 0,
        }).format(n);
      } catch {
        return `${currencySymbol} ${n.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`;
      }
    };
  }, [currencyCode, currencySymbol]);

  return { fmt, currencyCode, currencySymbol, countryName, countryCode };
}
