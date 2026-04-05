import { useState, useEffect } from "react";

interface GeoPricing {
  symbol: string;
  individual: { monthly: string; annual: string; annualTotal: string };
  agency: { monthly: string; annual: string; annualTotal: string };
  loading: boolean;
}

// Approximate EUR conversion rates for display purposes
const RATES: Record<string, { symbol: string; rate: number; code: string }> = {
  ES: { symbol: "€", rate: 1, code: "EUR" },
  MX: { symbol: "MXN ", rate: 18.5, code: "MXN" },
  CR: { symbol: "₡", rate: 550, code: "CRC" },
  PA: { symbol: "$", rate: 1.08, code: "USD" },
  CO: { symbol: "COP ", rate: 4400, code: "COP" },
  EC: { symbol: "$", rate: 1.08, code: "USD" },
  PE: { symbol: "S/", rate: 4.0, code: "PEN" },
  BO: { symbol: "Bs", rate: 7.5, code: "BOB" },
  CL: { symbol: "CLP ", rate: 1020, code: "CLP" },
  PY: { symbol: "₲", rate: 7900, code: "PYG" },
  AR: { symbol: "ARS ", rate: 950, code: "ARS" },
  UY: { symbol: "UYU ", rate: 42, code: "UYU" },
  DO: { symbol: "RD$", rate: 62, code: "DOP" },
};

function formatPrice(eur: number, rate: number, code: string): string {
  const converted = Math.round(eur * rate);
  // For currencies with large values, use thousands separator
  if (converted >= 1000) {
    return converted.toLocaleString("es");
  }
  return converted.toString();
}

export function useGeoPricing(): GeoPricing {
  const [countryCode, setCountryCode] = useState<string>("ES");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to detect country via a lightweight geo API
    const detect = async () => {
      try {
        const resp = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
        if (resp.ok) {
          const data = await resp.json();
          if (data.country_code && RATES[data.country_code]) {
            setCountryCode(data.country_code);
          }
        }
      } catch {
        // Default to EUR
      }
      setLoading(false);
    };
    detect();
  }, []);

  const info = RATES[countryCode] || RATES.ES;

  return {
    symbol: info.symbol,
    individual: {
      monthly: formatPrice(15, info.rate, info.code),
      annual: formatPrice(10, info.rate, info.code),
      annualTotal: formatPrice(120, info.rate, info.code),
    },
    agency: {
      monthly: formatPrice(49, info.rate, info.code),
      annual: formatPrice(37, info.rate, info.code),
      annualTotal: formatPrice(444, info.rate, info.code),
    },
    loading,
  };
}
