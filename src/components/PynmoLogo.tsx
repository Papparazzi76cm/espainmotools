import logoSrc from "@/assets/logo-espainmotools.png";
import { Link } from "react-router-dom";

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
    <Link to="/">
      <img src={logoSrc} alt="Espainmotools" className={`${sizes[size]} w-auto object-contain ${className}`} />
    </Link>
  );
};

export default PynmoLogo;
