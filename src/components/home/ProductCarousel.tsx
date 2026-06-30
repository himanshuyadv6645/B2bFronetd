import { useRef, useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ProductCard } from '@/components/common/ProductCard';
import type { Product } from '@/types/product';

interface ProductCarouselProps {
  products: Product[];
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllLabel?: string;
  isLoading?: boolean;
  skeletonCount?: number;
}

function CarouselSkeleton({ count }: { count: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="min-w-[200px] max-w-[260px] flex-shrink-0">
          <div className="overflow-hidden rounded-xl border bg-white">
            <div className="aspect-square animate-shimmer bg-surface" />
            <div className="space-y-2.5 p-3">
              <div className="h-2.5 w-1/3 animate-shimmer rounded bg-surface" />
              <div className="h-3 w-full animate-shimmer rounded bg-surface" />
              <div className="h-3 w-3/4 animate-shimmer rounded bg-surface" />
              <div className="h-4 w-1/2 animate-shimmer rounded bg-surface" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductCarousel({
  products,
  title,
  subtitle,
  viewAllLink,
  viewAllLabel = 'View All',
  isLoading = false,
  skeletonCount = 5,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
  }, [checkScroll, products]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 260;
    const gap = 16;
    const scrollAmount = (cardWidth + gap) * 2;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Handle mouse drag
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX;
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (startX.current - x) * 1.5;
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft.current + walk;
  };

  const handleMouseUp = () => { isDragging.current = false; };

  if (isLoading) {
    return (
      <section className="py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-4 sm:mb-6">
            <div className="h-7 w-48 animate-shimmer rounded bg-surface" />
          </div>
          <CarouselSkeleton count={skeletonCount} />
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold sm:text-xl lg:text-2xl">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {viewAllLink && (
              <a
                href={viewAllLink}
                className="hidden text-xs font-semibold text-brand hover:underline sm:inline-flex items-center gap-1"
              >
                {viewAllLabel} &rarr;
              </a>
            )}
            {/* Navigation arrows */}
            <div className="flex gap-1">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="flex h-8 w-8 items-center justify-center rounded-full border bg-white text-gray-600 shadow-sm transition-all hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Scroll left"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="flex h-8 w-8 items-center justify-center rounded-full border bg-white text-gray-600 shadow-sm transition-all hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Scroll right"
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="group/carousel relative">
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-[170px] max-w-[220px] flex-shrink-0 sm:min-w-[220px] sm:max-w-[260px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile view all link */}
        {viewAllLink && (
          <div className="mt-4 text-center sm:hidden">
            <a
              href={viewAllLink}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              {viewAllLabel} &rarr;
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
