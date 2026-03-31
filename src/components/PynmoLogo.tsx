import logoSrc from "@/assets/logo-espainmotools.png";

interface PynmoLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-14",
  md: "h-18",
  lg: "h-20",
};

const PynmoLogo = ({ size = "md", className = "" }: PynmoLogoProps) => {
  return (
    <img src={logoSrc} alt="Espainmotools" className={`${sizes[size]} w-auto object-contain ${className}`} />
  );
};

export default PynmoLogo;
