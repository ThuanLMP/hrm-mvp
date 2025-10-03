import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ResponsiveButtonProps {
  icon: LucideIcon;
  text: string;
  onClick?: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function ResponsiveButton({
  icon: Icon,
  text,
  onClick,
  variant = "ghost",
  size = "sm",
  className,
  disabled = false,
  type = "button",
}: ResponsiveButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(
        "flex items-center space-x-2 transition-all duration-200",
        // Hide text on small screens, show on medium and up
        "sm:space-x-2",
        className
      )}
    >
      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      <span className="hidden sm:inline text-sm font-medium">{text}</span>
    </Button>
  );
}
