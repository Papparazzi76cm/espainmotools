import logoSrc from "@/assets/logo-espainmotools.png";

interface PynmoLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-9",
  md: "h-12",
  lg: "h-[52px]",
};

const PynmoLogo = ({ size = "md", className = "" }: PynmoLogoProps) => {
  return (
    <img src={logoSrc} alt="Ace-Inmotools" className={`${sizes[size]} w-auto object-contain ${className}`} />
  );
};

export default PynmoLogo;
