import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { productService } from '@/services/product.service';
import { getCategoryImage } from '@/lib/categoryImages';
import { SmartImage } from '@/components/common/SmartImage';

const FALLBACK_CATEGORIES = [
  { name: 'Laptops', slug: 'laptops' },
  { name: 'Cameras', slug: 'cameras-photography' },
  { name: 'Networking', slug: 'networking' },
  { name: 'Printers', slug: 'printers-scanners' },
  { name: 'Storage', slug: 'storage-memory' },
  { name: 'Audio', slug: 'audio-video' },
  { name: 'Gaming', slug: 'computer-components' },
  { name: 'Security', slug: 'security-devices' },
];

interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string;
  level: number;
  image?: string;
  product_count?: number;
  children?: CategoryTreeItem[];
}

export function PopularCategories() {
  const { data: treeData, isLoading } = useQuery({
    queryKey: ['home-category-tree'],
    queryFn: () => productService.getCategoryTree(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const tree = treeData as CategoryTreeItem[] | null;
  const categories = tree && tree.length > 0
    ? (tree[0]?.children || []).slice(0, 12)
    : null;

  const displayCategories = categories || FALLBACK_CATEGORIES;

  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-4 sm:mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold sm:text-xl">Popular Categories</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Browse our wide range of product categories</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-brand hover:underline flex items-center gap-1">
            View All <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-6 lg:grid-cols-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-shimmer rounded-2xl bg-surface" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-6 lg:grid-cols-8">
            {displayCategories.map((cat) => {
              const slug = cat.slug || (cat as { id: string }).id;
              const name = cat.name;
              const productCount = cat.product_count || 0;

              return (
                <Link
                  key={slug}
                  to={`/products?category=${slug}`}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 hover:-translate-y-1">
                    <div className="aspect-square overflow-hidden bg-gray-50 p-2">
                      <SmartImage
                        src={getCategoryImage(name)}
                        alt={name}
                        name={name}
                        rounded="xl"
                        objectFit="cover"
                        className="h-full w-full transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="px-3 pb-3 pt-1">
                      <h3 className="text-center text-[11px] font-bold leading-tight text-gray-800 transition-colors group-hover:text-brand sm:text-xs">
                        {name}
                      </h3>
                      {productCount > 0 && (
                        <p className="mt-0.5 text-center text-[10px] text-gray-400">{productCount} items</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
