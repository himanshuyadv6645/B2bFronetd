import { useState, useEffect, useRef, memo } from 'react';
import { cn, generateInitials } from '@/lib/utils';
import { getInitialsColor } from '@/lib/images';

type Rounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

const roundedMap: Record<Rounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

const objectFitMap: Record<string, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
};

function isValidSrc(src?: string | null): boolean {
  if (!src || typeof src !== 'string') return false;
  const trimmed = src.trim();
  if (trimmed.length === 0) return false;
  if (trimmed === 'null' || trimmed === 'undefined') return false;
  return true;
}

function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'absolute inset-0 animate-shimmer bg-gradient-to-r from-surface via-gray-100 to-surface',
        className
      )}
    />
  );
}

function InitialsAvatar({
  name,
  className,
  rounded,
}: {
  name: string;
  className?: string;
  rounded: Rounded;
}) {
  const initials = generateInitials(name || '?');
  const bgColor = getInitialsColor(name || 'A');

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center select-none',
        roundedMap[rounded],
        className
      )}
      style={{ backgroundColor: `#${bgColor}` }}
      aria-label={name || 'Image placeholder'}
    >
      <span className="font-bold text-white leading-none text-[0.5em]">
        {initials}
      </span>
    </div>
  );
}

interface SmartImageProps {
  src?: string | null;
  alt?: string;
  name?: string;
  fallbackSrc?: string;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  rounded?: Rounded;
  lazy?: boolean;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill';
  onClick?: () => void;
  showSkeleton?: boolean;
}

const SmartImage = memo(function SmartImage({
  src,
  alt,
  name = 'Image',
  fallbackSrc,
  size,
  width,
  height,
  className,
  style,
  rounded = 'lg',
  lazy = true,
  priority = false,
  objectFit = 'cover',
  onClick,
  showSkeleton = true,
}: SmartImageProps) {
  const [imgState, setImgState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [activeSrc, setActiveSrc] = useState<'primary' | 'fallback' | 'none'>('none');
  const prevSrcRef = useRef<string | null | undefined>(undefined);

  const primarySrc = isValidSrc(src) ? src!.trim() : null;
  const fallback = isValidSrc(fallbackSrc) ? fallbackSrc!.trim() : null;

  // Reset state when src changes
  useEffect(() => {
    if (prevSrcRef.current === src) return;
    prevSrcRef.current = src;

    if (primarySrc) {
      setActiveSrc('primary');
      setImgState('loading');
    } else if (fallback) {
      setActiveSrc('fallback');
      setImgState('loading');
    } else {
      setActiveSrc('none');
      setImgState('error');
    }
  }, [src, primarySrc, fallback]);

  const currentSrc =
    activeSrc === 'primary' && primarySrc
      ? primarySrc
      : activeSrc === 'fallback' && fallback
        ? fallback
        : null;

  const handleLoad = () => setImgState('loaded');

  const handleError = () => {
    if (activeSrc === 'primary' && fallback) {
      setActiveSrc('fallback');
      setImgState('loading');
    } else {
      setImgState('error');
    }
  };

  const showImage = currentSrc && imgState !== 'error';

  const containerStyle = size
    ? { width: `${size}px`, height: `${size}px` }
    : width || height
      ? { width: width ? `${width}px` : 'auto', height: height ? `${height}px` : 'auto' }
      : undefined;

  return (
    <div
      className={cn('relative overflow-hidden bg-surface', roundedMap[rounded], className)}
      style={containerStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {showImage && imgState === 'loading' && showSkeleton && <SkeletonLoader />}

      {showImage && (
        <img
          src={currentSrc!}
          alt={alt || name}
          loading={priority ? 'eager' : lazy ? 'lazy' : undefined}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'h-full w-full transition-opacity duration-300',
            objectFitMap[objectFit],
            imgState === 'loaded' ? 'opacity-100' : 'opacity-0'
          )}
          style={style}
          width={width}
          height={height}
        />
      )}

      {(imgState === 'error' || !showImage) && (
        <InitialsAvatar name={name} rounded={rounded} />
      )}
    </div>
  );
});

SmartImage.displayName = 'SmartImage';

export { SmartImage };
export type { SmartImageProps };
