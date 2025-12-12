import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ children, className }: BadgeProps) {
  return (
    <span 
      className={cn(
        "text-xs font-medium text-[#6b6b6b] bg-[#f5f5f5] px-3 py-1.5 rounded-full whitespace-nowrap border border-[#e8e8e8]",
        className
      )}
    >
      {children}
    </span>
  );
}
