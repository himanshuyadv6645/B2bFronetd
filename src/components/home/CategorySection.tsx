import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { productService } from '@/services/product.service';
import { analyticsService } from '@/services/analytics.service';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { getCategoryImage } from '@/lib/categoryImages';
import { SmartImage } from '@/components/common/SmartImage';
import type { Product, Category } from '@/types/product';

interface CategorySectionProps {
  category: Category;
}

export function CategorySection({ category }: CategorySectionProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['home-cat-products', category.slug],
    queryFn: () =>
      productService.getProducts({
        category: category.slug,
        page_size: 10,
        ordering: '-created_at',
      }),
    staleTime: 5 * 60 * 1000,
  });

  const products: Product[] = data?.results || [];
  const hasProducts = products.length > 0;

  return (
    <div className="py-5 sm:py-6">
      {/* Category header */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-xl border bg-white p-1 sm:h-12 sm:w-12">
              <SmartImage
                src={getCategoryImage(category.name, category.image)}
                alt={category.name}
                name={category.name}
                rounded="lg"
                objectFit="cover"
                className="h-full w-full"
                width={48}
                height={48}
              />
            </div>
            <div>
              <h3 className="text-base font-bold sm:text-lg">{category.name}</h3>
              <p className="text-[11px] text-muted-foreground">
                {category.product_count || products.length || 0} Products
              </p>
            </div>
          </div>
          <Link
            to={`/products?category=${category.slug}`}
            className="flex items-center gap-1 rounded-lg border border-brand/20 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
          >
            View All <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {category.children.slice(0, 8).map((sub) => (
              <Link
                key={sub.id}
                to={`/products?category=${sub.slug}`}
                onClick={() => analyticsService.subcategoryView({ slug: sub.slug, name: sub.name, parent: category.slug })}
                className="rounded-full border bg-white px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="container mx-auto px-4 sm:px-6 mt-4">
          <div className="flex gap-3 sm:gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[170px] max-w-[220px] flex-shrink-0 sm:min-w-[220px] sm:max-w-[260px]">
                <div className="overflow-hidden rounded-xl border bg-white">
                  <div className="aspect-square animate-shimmer bg-surface" />
                  <div className="space-y-2.5 p-3">
                    <div className="h-2.5 w-1/3 animate-shimmer rounded bg-surface" />
                    <div className="h-3 w-full animate-shimmer rounded bg-surface" />
                    <div className="h-3 w-3/4 animate-shimmer rounded bg-surface" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : hasProducts ? (
        <ProductCarousel
          products={products}
          title=""
          viewAllLink={`/products?category=${category.slug}`}
        />
      ) : (
        <div className="container mx-auto px-4 sm:px-6 mt-4">
          <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-200 bg-white/50 px-6 py-8 text-center">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">No products available in this category yet.</p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <Link
                  to={`/products?category=${category.slug}`}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Browse Category &rarr;
                </Link>
                <Link
                  to="/products"
                  className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/20"
                >
                  Request Product
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
