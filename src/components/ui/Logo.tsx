import { cn } from '@/lib/utils';

interface LogoProps {
  /** Show the "B2B Market" wordmark next to the mark */
  showText?: boolean;
  /** Light variant for dark/colored backgrounds (white badge + white wordmark) */
  light?: boolean;
  className?: string;
  /** Pixel size of the square mark */
  size?: number;
}

/**
 * Brand logo for B2B Market.
 *
 * A crisp geometric "stacked layers" mark (suggesting wholesale / bulk supply)
 * in a rounded-square badge. Use `light` on colored backgrounds (e.g. the blue
 * navbar) to render a white badge with a blue glyph.
 */
export function Logo({ showText = true, light = false, className, size = 32 }: LogoProps) {
  const glyph = light ? '#E02424' : '#ffffff';
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E02424" />
            <stop offset="1" stopColor="#b91c1c" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill={light ? '#ffffff' : 'url(#logo-grad)'} />
        {/* Stacked layers / bulk-supply mark */}
        <path d="M20 9L31 14.5L20 20L9 14.5L20 9Z" fill={glyph} />
        <path d="M9 20L20 25.5L31 20" stroke={glyph} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
        <path d="M9 25.5L20 31L31 25.5" stroke={glyph} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      </svg>
      {showText && (
        <span className={cn('hidden sm:inline text-lg sm:text-xl font-bold tracking-tight leading-none', light ? 'text-white' : 'text-foreground')}>
          B2B<span className={light ? 'text-white/80' : 'text-brand'}> Market</span>
        </span>
      )}
    </span>
  );
}
