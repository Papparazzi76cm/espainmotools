import logoSrc from "@/assets/logo-pynmotools.png";

interface PynmoLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-28",
  md: "h-36",
  lg: "h-40",
};

const PynmoLogo = ({ size = "md", className = "" }: PynmoLogoProps) => {
  return (
    <img src={logoSrc} alt="Pynmotools" className={`${sizes[size]} w-auto object-contain ${className}`} />
  );
};

export default PynmoLogo;
