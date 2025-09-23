import { cn } from "@/lib/utils";

interface StatBarProps {
  value: number;
  max: number;
  className?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'success';
}

export default function StatBar({ value, max, className, color = 'primary' }: StatBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorClasses = {
    primary: 'stat-bar',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    destructive: 'bg-destructive',
    success: 'bg-green-500'
  };

  return (
    <div className={cn("w-full bg-muted rounded-full overflow-hidden", className)}>
      <div 
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-in-out",
          colorClasses[color]
        )}
        style={{ width: `${percentage}%` }}
        data-testid="stat-bar-fill"
      />
    </div>
  );
}
