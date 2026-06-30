import { SmartImage } from '@/components/common/SmartImage';
import { getProductImage } from '@/lib/images';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  /** Real image URL from the API. Falls back to a branded placeholder. */
  src?: string | null;
  /** Product/variant name — used to generate a stable placeholder and alt text. */
  name: string;
  index?: number;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

/**
 * Renders a product image with a graceful fallback. If `src` is missing or fails
 * to load, a deterministic branded placeholder (from the name) is shown instead.
 *
 * This is a thin wrapper around SmartImage for backward compatibility.
 */
export function ProductImage({ src, name, index = 0, className, style, alt }: ProductImageProps) {
  return (
    <SmartImage
      src={src}
      name={name || 'Product'}
      fallbackSrc={getProductImage(name || 'Product', index)}
      alt={alt || name}
      rounded="none"
      className={cn('w-full h-full', className)}
      style={style}
      showSkeleton={false}
    />
  );
}
