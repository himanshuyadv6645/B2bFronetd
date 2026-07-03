import { Link } from 'react-router-dom';
import { ProductImage } from '@/components/common/ProductImage';
import { FiGrid } from 'react-icons/fi';
import type { SEORelatedCategory } from '@/types/seo';

interface SEORelatedCategoriesProps {
  categories: SEORelatedCategory[];
}

export function SEORelatedCategories({ categories }: SEORelatedCategoriesProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <FiGrid className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-bold text-foreground sm:text-base">Related Categories</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/categories/${cat.slug}`}
            className="group flex flex-col items-center rounded-lg border border-border bg-white p-3 transition-all hover:shadow-md"
          >
            <div className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-muted/20 sm:h-16 sm:w-16">
              {cat.image ? (
                <ProductImage
                  src={cat.image}
                  alt={cat.name}
                  name={cat.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <FiGrid className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <span className="text-center text-xs font-medium text-foreground sm:text-sm">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
