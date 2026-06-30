import { FiStar, FiCheckCircle } from 'react-icons/fi';
import type { SEOSeller } from '@/types/seo';

interface SEOSellerSectionProps {
  sellers: SEOSeller[];
  cityName?: string;
}

export function SEOSellerSection({ sellers, cityName }: SEOSellerSectionProps) {
  if (!sellers || sellers.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-foreground sm:text-xl">
        Top Sellers{cityName ? ` in ${cityName}` : ''}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
        {sellers.map((seller) => (
          <div
            key={seller.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-white p-4 transition-all hover:shadow-md"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand sm:h-14 sm:w-14 sm:text-base">
              {seller.logo ? (
                <img src={seller.logo} alt={seller.company_name} className="h-full w-full rounded-full object-cover" />
              ) : (
                seller.company_name.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-sm font-semibold text-foreground">{seller.company_name}</h3>
                {seller.is_verified && (
                  <FiCheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <FiStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{seller.rating}</span>
                <span className="text-xs text-muted-foreground">({seller.total_ratings} ratings)</span>
              </div>
              {seller.city && (
                <p className="mt-0.5 text-xs text-muted-foreground">{seller.city}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
