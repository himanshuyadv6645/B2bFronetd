import { Link } from 'react-router-dom';
import { ProductImage } from '@/components/common/ProductImage';
import { formatCurrency } from '@/lib/utils';
import { FiStar } from 'react-icons/fi';
import type { SEOProduct } from '@/types/seo';

interface SEOProductGridProps {
  products: SEOProduct[];
  title?: string;
}

export function SEOProductGrid({ products, title = 'Popular Products' }: SEOProductGridProps) {
  if (!products || products.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-foreground sm:text-xl">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 sm:gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.slug}`}
            className="group overflow-hidden rounded-lg border border-border bg-white transition-all hover:shadow-md"
          >
            <div className="aspect-square overflow-hidden bg-muted/20">
              <ProductImage
                src={product.image}
                alt={product.name}
                name={product.name}
                className="h-full w-full object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-2.5 sm:p-3">
              <h3 className="mb-1 line-clamp-2 text-xs font-medium text-foreground sm:text-sm">
                {product.name}
              </h3>
              {product.brand_name && (
                <p className="mb-1 text-[10px] text-muted-foreground sm:text-xs">{product.brand_name}</p>
              )}
              <div className="mb-1 flex items-center gap-1">
                <FiStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-[10px] font-medium sm:text-xs">{product.average_rating}</span>
                <span className="text-[10px] text-muted-foreground sm:text-xs">({product.total_reviews})</span>
              </div>
              <p className="text-xs font-bold text-brand sm:text-sm">
                {formatCurrency(product.min_selling_price)}
              </p>
              {product.moq > 1 && (
                <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
                  MOQ: {product.moq} pcs
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
