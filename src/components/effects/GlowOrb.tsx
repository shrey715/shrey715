import { cn } from '@/lib/utils';

interface GlowOrbProps {
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-[250px] h-[250px]',
  md: 'w-[300px] h-[300px]',
  lg: 'w-[400px] h-[400px]',
  xl: 'w-[500px] h-[500px]',
};

const blurMap = {
  sm: 'blur-[60px]',
  md: 'blur-[80px]',
  lg: 'blur-[100px]',
  xl: 'blur-[120px]',
};

export default function GlowOrb({ 
  color, 
  size = 'md', 
  position, 
  blur = 'md',
  className 
}: GlowOrbProps) {
  return (
    <div 
      className={cn(
        'absolute rounded-full pointer-events-none',
        sizeMap[size],
        blurMap[blur],
        color,
        className
      )}
      style={position}
    />
  );
}
