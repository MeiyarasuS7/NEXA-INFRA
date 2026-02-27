import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "success" | "warning";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "outline",
  size = "sm",
  disabled,
  loading,
  className
}: ActionButtonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "text-success border-success/30 hover:bg-success/10";
      case "warning":
        return "text-warning border-warning/30 hover:bg-warning/10";
      case "destructive":
        return "text-destructive border-destructive/30 hover:bg-destructive/10";
      default:
        return "";
    }
  };

  return (
    <Button
      size={size}
      variant={variant === "success" || variant === "warning" ? "outline" : variant}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(getVariantClasses(), className)}
    >
      {Icon && <Icon className="mr-1 h-3.5 w-3.5" />}
      {label}
    </Button>
  );
};
