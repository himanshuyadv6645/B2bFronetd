import { type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const tones = {
  brand: 'bg-brand/10 text-brand',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  violet: 'bg-violet-50 text-violet-600',
} as const;

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  /** Soft colored icon tile. When set, pass an uncolored icon so it inherits the tone. */
  tone?: keyof typeof tones;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, tone = 'brand', trend, className }: StatCardProps) {
  return (
    <Card className={cn('shadow-card transition-shadow hover:shadow-card-hover', className)}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">{title}</p>
            <p className="mt-1 truncate text-xl font-bold sm:text-2xl">{value}</p>
            {subtitle && <p className="mt-1 truncate text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
                {trend.isPositive ? <FiTrendingUp className="h-3 w-3" /> : <FiTrendingDown className="h-3 w-3" />}
                <span>{Math.abs(trend.value)}% {trend.isPositive ? 'up' : 'down'}</span>
              </div>
            )}
          </div>
          <div className={cn('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12', tones[tone])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
