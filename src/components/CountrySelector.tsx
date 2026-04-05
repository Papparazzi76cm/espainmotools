import { useCountry } from "@/contexts/CountryContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CountrySelectorProps {
  compact?: boolean;
}

const CountrySelector = ({ compact = false }: CountrySelectorProps) => {
  const { countries, selectedCountry, setCountryCode, loading } = useCountry();

  if (loading || countries.length === 0) return null;

  if (compact) {
    return (
      <Select value={selectedCountry?.country_code || "es"} onValueChange={setCountryCode}>
        <SelectTrigger className="h-8 w-8 p-0 border-0 bg-transparent justify-center [&>svg]:hidden">
          <span className="text-base leading-none">{selectedCountry?.flag_emoji || "🇪🇸"}</span>
        </SelectTrigger>
        <SelectContent>
          {countries.map((c) => (
            <SelectItem key={c.country_code} value={c.country_code}>
              <span className="flex items-center gap-2">
                <span>{c.flag_emoji}</span>
                <span className="text-xs">{c.country_name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={selectedCountry?.country_code || "es"} onValueChange={setCountryCode}>
      <SelectTrigger className="h-8 w-full text-xs bg-transparent border-sidebar-border">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{selectedCountry?.flag_emoji}</span>
            <span className="truncate">{selectedCountry?.country_name}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {countries.map((c) => (
          <SelectItem key={c.country_code} value={c.country_code}>
            <span className="flex items-center gap-2">
              <span>{c.flag_emoji}</span>
              <span className="text-xs">{c.country_name}</span>
              <span className="text-muted-foreground text-[10px]">({c.currency_code})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountrySelector;
