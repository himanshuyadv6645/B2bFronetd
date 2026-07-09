import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { productService } from '@/services/product.service';
import { analyticsService } from '@/services/analytics.service';
import { getCategoryImage } from '@/lib/categoryImages';
import { SmartImage } from '@/components/common/SmartImage';
import { FiGrid, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const STATIC_CATEGORIES: { slug: string; name: string; image: string }[] = [
  { slug: 'cameras-photography', name: 'Camera', image: '/categories/camera.jpg' },
  { slug: 'cctv-surveillance', name: 'CCTV', image: '/categories/cctv.jpg' },
  { slug: 'computer-peripherals', name: 'Peripherals', image: '/categories/mouse.jpg' },
  { slug: 'laptops', name: 'Laptop', image: '/categories/laptop.jpg' },
  { slug: 'printers-scanners', name: 'Printer', image: '/categories/printer.jpg' },
  { slug: 'networking', name: 'Networking', image: '/categories/switch.jpg' },
  { slug: 'storage-memory', name: 'Storage', image: '/categories/hdd.jpg' },
  { slug: 'computer-components', name: 'Components', image: '/categories/processor.jpg' },
  { slug: 'audio-video', name: 'Audio', image: '/categories/speaker.jpg' },
  { slug: 'desktops-monitors', name: 'Monitors', image: '/categories/monitor.jpg' },
  { slug: 'power-ups', name: 'Power', image: '/categories/accessories.jpg' },
  { slug: 'industrial-electronics', name: 'Industrial', image: '/categories/processor.jpg' },
  { slug: 'automation-iot', name: 'Smart Home', image: '/categories/smart-home.jpg' },
  { slug: 'mobile-accessories', name: 'Mobiles', image: '/categories/smartphone.jpg' },
  { slug: 'wearable-technology', name: 'Wearables', image: '/categories/gaming.jpg' },
  { slug: 'server-enterprise', name: 'Servers', image: '/categories/hdd.jpg' },
  { slug: 'security-devices', name: 'Security', image: '/categories/security.jpg' },
];

interface CategoryItem {
  slug: string;
  name: string;
  image: string;
  productCount?: number;
}

interface TreeNode {
  id: string;
  name: string;
  slug: string;
  level: number;
  image?: string;
  icon?: string;
  is_featured?: boolean;
  product_count?: number;
  children?: TreeNode[];
}

export function CategoryBar() {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data: treeData } = useQuery({
    queryKey: ['nav-category-tree'],
    queryFn: () => productService.getCategoryTree(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const categories = useMemo<CategoryItem[]>(() => {
    const tree = treeData as TreeNode[] | null;
    if (tree && tree.length > 0) {
      const root = tree[0];
      const navCats: CategoryItem[] = [];
      const children = root?.children || tree;
      for (const child of children) {
        navCats.push({
          slug: child.slug,
          name: child.name,
          image: getCategoryImage(child.name, child.image || ''),
          productCount: child.product_count,
        });
      }
      if (navCats.length > 0) return navCats;
    }
    return STATIC_CATEGORIES.map((c) => ({ ...c, productCount: 0 }));
  }, [treeData]);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, categories]);

  // Auto-scroll active category into view
  useEffect(() => {
    if (!activeCategory || !scrollRef.current) return;
    const el = scrollRef.current;
    const activeEl = el.querySelector(`[data-category="${activeCategory}"]`);
    if (activeEl) {
      const containerRect = el.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      const scrollLeft = el.scrollLeft + (elRect.left - containerRect.left) - containerRect.width / 2 + elRect.width / 2;
      el.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  // Mouse wheel horizontal scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY, behavior: 'auto' });
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Click + drag scrolling
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasMoved = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX;
    scrollLeftStart.current = scrollRef.current?.scrollLeft || 0;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = startX.current - x;
    if (Math.abs(walk) > 3) hasMoved.current = true;
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeftStart.current + walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = '';
  };

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <div className="sticky top-16 z-40 border-b border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="container mx-auto relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 z-10 flex h-full w-10 items-center justify-center bg-gradient-to-r from-white via-white/90 to-transparent transition-opacity hover:from-white/90"
            aria-label="Scroll categories left"
          >
            <FiChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 z-10 flex h-full w-10 items-center justify-center bg-gradient-to-l from-white via-white/90 to-transparent transition-opacity hover:from-white/90"
            aria-label="Scroll categories right"
          >
            <FiChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-1 overflow-x-auto py-2 px-3 sm:px-4 scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x proximity',
            cursor: '',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={(e) => { if (hasMoved.current) e.preventDefault(); }}
        >
          {/* All Categories */}
          <Link
            to="/products"
            data-category="all"
            style={{ scrollSnapAlign: 'start' }}
            className={`group flex flex-shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200 ${
              !activeCategory
                ? 'bg-brand/10 ring-2 ring-brand shadow-sm'
                : 'hover:bg-gray-50'
            }`}
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                !activeCategory
                  ? 'bg-brand text-white shadow-md shadow-brand/25'
                  : 'bg-gray-100 text-gray-500 group-hover:bg-brand/10 group-hover:text-brand'
              }`}
            >
              <FiGrid className="h-5 w-5" />
            </div>
            <span
              className={`max-w-[68px] truncate text-center text-[10px] font-bold leading-tight transition-colors ${
                !activeCategory ? 'text-brand' : 'text-gray-600 group-hover:text-brand'
              }`}
            >
              All
            </span>
          </Link>

          {/* Category items */}
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                data-category={cat.slug}
                to={`/products?category=${cat.slug}`}
                onClick={() => analyticsService.categoryView({ slug: cat.slug, name: cat.name })}
                style={{ scrollSnapAlign: 'start' }}
                className={`group flex flex-shrink-0 flex-col items-center gap-1 rounded-xl px-2.5 py-2 transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-brand/10 ring-2 ring-brand shadow-sm'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`relative h-11 w-11 overflow-hidden rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'ring-2 ring-brand shadow-md shadow-brand/20'
                      : 'group-hover:ring-2 group-hover:ring-brand/30 group-hover:shadow-md'
                  }`}
                >
                  <SmartImage
                    src={cat.image}
                    alt={cat.name}
                    name={cat.name}
                    rounded="xl"
                    objectFit="cover"
                    className="h-full w-full transition-transform duration-300 group-hover:scale-110"
                    width={44}
                    height={44}
                  />
                  {isActive && <div className="absolute inset-0 bg-brand/10" />}
                </div>
                <span
                  className={`max-w-[68px] truncate text-center text-[10px] font-bold leading-tight transition-colors duration-150 ${
                    isActive ? 'text-brand' : 'text-gray-600 group-hover:text-brand'
                  }`}
                >
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
