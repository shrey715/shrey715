import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div 
      className={cn(
        "p-6 rounded-2xl bg-white border border-[#e8e8e8] shadow-sm",
        hover && "hover:shadow-lg hover:border-[#d0d0d0] transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("flex justify-between items-start gap-3 mb-4", className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("flex-1", className)}>
      {children}
    </div>
  );
}
