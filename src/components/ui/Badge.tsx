import { cn } from '@/lib/utils';
import type { TrustLevel } from '@/types/trust';

type BadgeVariant = TrustLevel | 'cheapest' | 'mock' | 'direct' | 'stopover' | 'default';

const variantClasses: Record<BadgeVariant, string> = {
  official:       'bg-emerald-100 text-emerald-800',
  trusted_partner:'bg-blue-100 text-blue-800',
  limited:        'bg-amber-100 text-amber-800',
  unverified:     'bg-gray-100 text-gray-700',
  blocked:        'bg-red-100 text-red-800',
  cheapest:       'bg-orange-100 text-orange-700 font-semibold',
  mock:           'bg-purple-100 text-purple-700',
  direct:         'bg-sky-100 text-sky-700',
  stopover:       'bg-slate-100 text-slate-600',
  default:        'bg-slate-100 text-slate-700',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
