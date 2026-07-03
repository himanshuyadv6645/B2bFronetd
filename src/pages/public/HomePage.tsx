import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import {
  HeroBanner,
  ServiceFeatures,
  PopularCategories,
  CategorySection,
  ProductCarousel,
  BrandsRow,
  WhyChooseUs,
  CtaBanner,
} from '@/components/home';
import type { Category } from '@/types/product';

interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string;
  level: number;
  image?: string;
  icon?: string;
  is_featured?: boolean;
  product_count?: number;
  children?: CategoryTreeItem[];
}

export default function HomePage() {
  // Fetch category tree for sections
  const { data: treeData, isLoading: treeLoading } = useQuery({
    queryKey: ['home-category-tree'],
    queryFn: () => productService.getCategoryTree(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  // Fetch featured/trending products for carousels
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['home-featured'],
    queryFn: () =>
      productService.getProducts({ is_featured: true, page_size: 10, ordering: '-created_at' }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['home-trending'],
    queryFn: () =>
      productService.getProducts({ is_trending: true, page_size: 10, ordering: '-created_at' }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: topSellerData, isLoading: topSellerLoading } = useQuery({
    queryKey: ['home-top-seller'],
    queryFn: () =>
      productService.getProducts({ is_top_seller: true, page_size: 10, ordering: '-created_at' }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ['home-recent'],
    queryFn: () =>
      productService.getProducts({ page_size: 10, ordering: '-created_at' }),
    staleTime: 5 * 60 * 1000,
  });

  // Build category sections from tree
  const tree = treeData as CategoryTreeItem[] | null;
  const categorySections: Category[] = [];
  if (tree && tree.length > 0) {
    const root = tree[0];
    const children = root?.children || tree;
    for (const child of children) {
      if (child.level !== undefined && child.level >= 1) {
        categorySections.push({
          id: child.id,
          name: child.name,
          slug: child.slug,
          image: child.image || null,
          parent: root.id,
          level: child.level,
          is_active: true,
          is_featured: child.is_featured || false,
          sort_order: 0,
          created_at: '',
          updated_at: '',
          product_count: child.product_count,
          children: (child.children || []).map((gc) => ({
            id: gc.id,
            name: gc.name,
            slug: gc.slug,
            image: gc.image || null,
            parent: child.id,
            level: gc.level,
            is_active: true,
            is_featured: gc.is_featured || false,
            sort_order: 0,
            created_at: '',
            updated_at: '',
            product_count: gc.product_count,
          }) as unknown as Category),
        } as unknown as Category);
      }
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 2. Service Features Strip */}
      <ServiceFeatures />

      {/* 3. Popular Categories */}
      <PopularCategories />

      {/* 4. Category Product Sections */}
      {treeLoading ? (
        // Show skeleton loading for category sections
        <div className="space-y-6 py-6 sm:py-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="container mx-auto px-4 sm:px-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 animate-shimmer rounded-xl bg-surface" />
                <div className="h-5 w-32 animate-shimmer rounded bg-surface" />
              </div>
              <div className="flex gap-3 sm:gap-4 overflow-hidden">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="min-w-[170px] max-w-[220px] flex-shrink-0 sm:min-w-[220px] sm:max-w-[260px]">
                    <div className="overflow-hidden rounded-xl border bg-white">
                      <div className="aspect-square animate-shimmer bg-surface" />
                      <div className="space-y-2.5 p-3">
                        <div className="h-2.5 w-1/3 animate-shimmer rounded bg-surface" />
                        <div className="h-3 w-full animate-shimmer rounded bg-surface" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        categorySections.map((cat) => (
          <CategorySection key={cat.id} category={cat} />
        ))
      )}

      {/* 5. Recently Added */}
      <ProductCarousel
        products={recentData?.results || []}
        title="Recently Added"
        subtitle="Fresh arrivals in our marketplace"
        viewAllLink="/products?ordering=-created_at"
        isLoading={recentLoading}
      />

      {/* 6. Trending Products */}
      <ProductCarousel
        products={trendingData?.results || []}
        title="Trending Products"
        subtitle="Popular products buyers are ordering"
        viewAllLink="/products?is_trending=true"
        isLoading={trendingLoading}
      />

      {/* 7. Top Sellers */}
      <ProductCarousel
        products={topSellerData?.results || []}
        title="Top Sellers"
        subtitle="Best-selling products from verified sellers"
        viewAllLink="/products?is_top_seller=true"
        isLoading={topSellerLoading}
      />

      {/* 8. Featured Products */}
      <ProductCarousel
        products={featuredData?.results || []}
        title="Featured Products"
        subtitle="Handpicked products by our team"
        viewAllLink="/products?is_featured=true"
        isLoading={featuredLoading}
      />

      {/* 9. Brands */}
      <BrandsRow />

      {/* 10. Why Choose Us */}
      <WhyChooseUs />

      {/* 11. CTA */}
      <CtaBanner />
    </div>
  );
}
