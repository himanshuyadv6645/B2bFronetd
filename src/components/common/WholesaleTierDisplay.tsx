import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { FiPackage, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface WholesaleTier {
  min_quantity: number;
  max_quantity: number | null;
  price_per_unit: string;
  discount_percent?: string;
  notes?: string;
}

interface WholesaleTierDisplayProps {
  tiers: WholesaleTier[];
  sellerName?: string;
  currentQuantity?: number;
  className?: string;
}

const INITIAL_VISIBLE = 3;

export function WholesaleTierDisplay({
  tiers,
  sellerName,
  currentQuantity = 0,
  className,
}: WholesaleTierDisplayProps) {
  const [showAll, setShowAll] = useState(false);

  if (!tiers || tiers.length === 0) return null;

  const sorted = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);
  const visibleTiers = showAll ? sorted : sorted.slice(0, INITIAL_VISIBLE);
  const hasMore = sorted.length > INITIAL_VISIBLE;

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-white', className)}>
      {sellerName && (
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <FiPackage className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Sold by</span>
          <span className="text-sm font-semibold text-primary">{sellerName}</span>
        </div>
      )}

      {/* Desktop Table */}
      <table className="hidden w-full text-sm sm:table">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-center font-semibold text-foreground">Min Qty</th>
            <th className="px-4 py-3 text-center font-semibold text-foreground">Max Qty</th>
            <th className="px-4 py-3 text-center font-semibold text-foreground">Unit Price</th>
          </tr>
        </thead>
        <tbody>
          {visibleTiers.map((tier, index) => {
            const min = tier.min_quantity;
            const max = tier.max_quantity;
            const isLast = index === sorted.length - 1;
            const isActive =
              currentQuantity >= min &&
              (max === null || currentQuantity <= max);

            return (
              <tr
                key={index}
                className={cn(
                  'border-b border-border last:border-b-0 transition-colors',
                  isActive && 'bg-primary/5',
                  !isActive && 'hover:bg-muted/30',
                )}
              >
                <td className={cn('px-4 py-3 text-center', isActive && 'font-bold text-primary')}>
                  {min}
                </td>
                <td className={cn('px-4 py-3 text-center', isActive && 'font-bold text-primary')}>
                  {isLast && !max ? (
                    <span className="text-muted-foreground">Above +</span>
                  ) : (
                    max
                  )}
                </td>
                <td className={cn('px-4 py-3 text-center font-semibold', isActive ? 'text-primary' : 'text-foreground')}>
                  {formatCurrency(tier.price_per_unit)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="divide-y divide-border sm:hidden">
        {visibleTiers.map((tier, index) => {
          const min = tier.min_quantity;
          const max = tier.max_quantity;
          const isLast = index === sorted.length - 1;
          const isActive =
            currentQuantity >= min &&
            (max === null || currentQuantity <= max);

          return (
            <div
              key={index}
              className={cn(
                'flex items-center justify-between px-4 py-3',
                isActive && 'bg-primary/5',
              )}
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground">Quantity</span>
                <span className={cn('text-sm', isActive && 'font-bold text-primary')}>
                  {min} -{' '}
                  {isLast && !max ? (
                    <span className="text-muted-foreground">Above</span>
                  ) : (
                    max
                  )}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground">Unit Price</span>
                <p className={cn('text-sm font-semibold', isActive ? 'text-primary' : 'text-foreground')}>
                  {formatCurrency(tier.price_per_unit)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* View More */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex w-full items-center justify-center gap-1 border-t border-border bg-muted/20 px-4 py-2.5 text-xs font-bold text-brand transition-colors hover:bg-muted/40 hover:text-brand-dark sm:text-sm"
        >
          {showAll ? 'Show Less' : `View All ${sorted.length} Price Tiers`}
          {showAll ? (
            <FiChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          ) : (
            <FiChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
        </button>
      )}
    </div>
  );
}