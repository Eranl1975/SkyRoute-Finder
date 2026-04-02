import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  highlighted?: boolean;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = { sm: 'p-4', md: 'p-5', lg: 'p-6' };

export function Card({ children, className, highlighted, hover, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white border transition-all',
        paddingClasses[padding],
        highlighted
          ? 'border-sky-400 ring-2 ring-sky-100 shadow-md'
          : 'border-slate-100 shadow-sm',
        hover && 'hover:shadow-md hover:border-slate-200 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
