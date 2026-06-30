import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { Product, ProductAttribute } from '@/types/product';

interface ProductInfoSectionProps {
  product: Product;
  className?: string;
}

export function ProductInfoSection({ product, className }: ProductInfoSectionProps) {
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const specs: ProductAttribute[] = product.attributes || [];
  const initialSpecCount = 6;
  const visibleSpecs = showAllSpecs ? specs : specs.slice(0, initialSpecCount);
  const hasMoreSpecs = specs.length > initialSpecCount;

  const description = product.description || '';
  const descLimit = 200;
  const truncatedDesc = description.length > descLimit
    ? description.slice(0, descLimit)
    : description;
  const hasMoreDesc = description.length > descLimit;

  const allFeatures = extractFeatures(description);
  const initialFeatureCount = 5;
  const visibleFeatures = showAllFeatures ? allFeatures : allFeatures.slice(0, initialFeatureCount);
  const hasMoreFeatures = allFeatures.length > initialFeatureCount;

  return (
    <div className={cn('space-y-6 sm:space-y-8', className)}>
      {/* Key Features */}
      {allFeatures.length > 0 && (
        <section>
          <h2 className="mb-2.5 text-base font-bold text-foreground sm:mb-3 sm:text-lg">Key Features</h2>
          <ul className="space-y-1.5 sm:space-y-2">
            {visibleFeatures.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground sm:gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-foreground" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          {hasMoreFeatures && (
            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="mt-2.5 flex items-center gap-1 text-xs font-bold text-brand transition-colors hover:text-brand-dark sm:mt-3 sm:text-sm"
            >
              {showAllFeatures ? 'SHOW LESS' : `VIEW ALL ${allFeatures.length} FEATURES`}
              {showAllFeatures ? (
                <FiChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              ) : (
                <FiChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </button>
          )}
        </section>
      )}

      {/* Product Specifications */}
      {specs.length > 0 && (
        <section>
          <h2 className="mb-2.5 text-base font-bold text-foreground sm:mb-3 sm:text-lg">Product Specifications</h2>
          <div className="overflow-x-auto rounded-lg border border-dashed border-border">
            <table className="w-full min-w-[300px] text-xs sm:text-sm">
              <tbody>
                {visibleSpecs.map((attr, i) => (
                  <tr
                    key={attr.id || i}
                    className={cn(
                      'border-b border-dashed border-border last:border-b-0',
                      i % 2 === 0 ? 'bg-white' : 'bg-muted/20',
                    )}
                  >
                    <td className="w-[35%] px-3 py-2.5 font-medium text-foreground sm:w-[40%] sm:px-4 sm:py-3">
                      {attr.name || attr.key}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground sm:px-4 sm:py-3">
                      {attr.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMoreSpecs && (
            <button
              onClick={() => setShowAllSpecs(!showAllSpecs)}
              className="mt-2.5 flex items-center gap-1 text-xs font-bold text-brand transition-colors hover:text-brand-dark sm:mt-3 sm:text-sm"
            >
              {showAllSpecs ? 'HIDE SPECIFICATIONS' : 'SHOW ALL SPECIFICATIONS'}
              {showAllSpecs ? (
                <FiChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              ) : (
                <FiChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </button>
          )}
        </section>
      )}

      {/* Product Details / Description */}
      {description && (
        <section>
          <h2 className="mb-2.5 text-base font-bold text-foreground sm:mb-3 sm:text-lg">Product Details</h2>
          <div className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {showFullDesc || !hasMoreDesc ? (
              <p className="whitespace-pre-wrap">{description}</p>
            ) : (
              <p>{truncatedDesc}...</p>
            )}
          </div>
          {hasMoreDesc && (
            <button
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="mt-2 flex items-center gap-1 text-xs font-bold text-brand transition-colors hover:text-brand-dark sm:text-sm"
            >
              {showFullDesc ? 'READ LESS' : 'READ MORE'}
              {showFullDesc ? (
                <FiChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              ) : (
                <FiChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </button>
          )}
        </section>
      )}

      {/* Specifications JSON fallback */}
      {specs.length === 0 && product.specifications && Object.keys(product.specifications).length > 0 && (
        <section>
          <h2 className="mb-2.5 text-base font-bold text-foreground sm:mb-3 sm:text-lg">Product Specifications</h2>
          <div className="overflow-x-auto rounded-lg border border-dashed border-border">
            <table className="w-full min-w-[300px] text-xs sm:text-sm">
              <tbody>
                {Object.entries(product.specifications).map(([key, value], i) => (
                  <tr
                    key={key}
                    className={cn(
                      'border-b border-dashed border-border last:border-b-0',
                      i % 2 === 0 ? 'bg-white' : 'bg-muted/20',
                    )}
                  >
                    <td className="w-[35%] px-3 py-2.5 font-medium text-foreground sm:w-[40%] sm:px-4 sm:py-3">{key}</td>
                    <td className="px-3 py-2.5 text-muted-foreground sm:px-4 sm:py-3">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function extractFeatures(description: string): string[] {
  if (!description) return [];

  const lines = description.split('\n').map((l) => l.trim()).filter(Boolean);
  const features: string[] = [];

  for (const line of lines) {
    const bulletMatch = line.match(/^[-•*]\s+(.+)/);
    if (bulletMatch) {
      features.push(bulletMatch[1].trim());
      continue;
    }

    const numberedMatch = line.match(/^\d+[.)]\s+(.+)/);
    if (numberedMatch) {
      features.push(numberedMatch[1].trim());
      continue;
    }
  }

  return features;
}
