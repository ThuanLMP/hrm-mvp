import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
  text?: string;
  showText?: boolean;
}

export function LoadingSpinner({ 
  className = "h-8 w-8", 
  text = "Loading...",
  showText = false 
}: LoadingSpinnerProps) {
  if (showText) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8">
        <Loader2 className={`animate-spin text-blue-500 ${className}`} />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    );
  }
  
  return <Loader2 className={`animate-spin ${className}`} />;
}
