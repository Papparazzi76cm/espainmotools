import logoSrc from "@/assets/logo_espainmotools.png";

interface EspainnmoLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-28",
  md: "h-36",
  lg: "h-40",
};

const EspainmoLogo = ({ size = "md", className = "" }: EspainmoLogoProps) => {
  return (
    <img src={logoSrc} alt="Espainmotools" className={`${sizes[size]} w-auto object-contain ${className}`} />
  );
};

export default EspainmoLogo;
