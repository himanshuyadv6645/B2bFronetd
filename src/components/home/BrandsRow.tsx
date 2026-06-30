import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { productService } from '@/services/product.service';
import { SmartImage } from '@/components/common/SmartImage';
import type { Brand } from '@/types/product';

export function BrandsRow() {
  const { data, isLoading } = useQuery({
    queryKey: ['home-brands'],
    queryFn: () => productService.getBrands({ page_size: 20 }),
    staleTime: 10 * 60 * 1000,
  });

  const brands: Brand[] = data?.results || [];

  if (isLoading) {
    return (
      <section className="py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-4 sm:mb-6">
            <div className="h-7 w-32 animate-shimmer rounded bg-surface" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 w-32 flex-shrink-0 animate-shimmer rounded-xl bg-surface" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (brands.length === 0) return null;

  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-4 sm:mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold sm:text-xl">Top Brands</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Trusted electronics brands</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-brand hover:underline flex items-center gap-1">
            View All <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/products?brand=${brand.id}`}
              className="flex h-16 min-w-[130px] flex-shrink-0 items-center justify-center gap-2 rounded-xl border bg-white px-4 transition-all hover:border-brand/30 hover:shadow-md hover:shadow-brand/5"
            >
              {brand.logo ? (
                <SmartImage
                  src={brand.logo}
                  alt={brand.name}
                  name={brand.name}
                  rounded="none"
                  objectFit="contain"
                  className="max-h-8 max-w-[80px]"
                  showSkeleton={false}
                />
              ) : (
                <span className="text-sm font-bold text-gray-700">{brand.name}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
