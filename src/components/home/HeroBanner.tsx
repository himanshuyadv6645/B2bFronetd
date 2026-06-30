import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { SmartImage } from '@/components/common/SmartImage';

const BANNERS = [
  { src: '/banners/banner-1.webp', alt: 'Wholesale Electronics Marketplace' },
  { src: '/banners/banner-2.webp', alt: 'Bulk Orders & GST Billing' },
  { src: '/banners/banner-3.webp', alt: 'Trusted Sellers & Fast Delivery' },
];

const AUTOPLAY_MS = 5000;

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasTransition, setHasTransition] = useState(true);
  const touchStart = useRef<number | null>(null);
  const touchDelta = useRef(0);
  const total = BANNERS.length;
  // Always forward: 0 → 1 → 2 → 0(clone) → [instant jump] 0 → 1 ...
  const slides = total > 1 ? [...BANNERS, BANNERS[0]] : BANNERS;

  const goTo = useCallback((i: number) => setCurrent(i), []);

  const next = useCallback(() => {
    if (total <= 1) return;
    setCurrent((prev) => {
      // If at the clone (last slide), disable transition and jump to real first
      if (prev >= total) {
        setHasTransition(false);
        return 1; // Jump to index 1 (real first after clone position 0)
      }
      setHasTransition(true);
      return prev + 1;
    });
  }, [total]);

  const prev = useCallback(() => {
    if (total <= 1) return;
    setHasTransition(true);
    setCurrent((p) => (p <= 0 ? total : p - 1));
  }, [total]);

  // After instant jump (no transition), re-enable transition for next auto-play
  useEffect(() => {
    if (!hasTransition) {
      // Force reflow then re-enable transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHasTransition(true);
        });
      });
    }
  }, [hasTransition, current]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isPaused, next, total]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    touchDelta.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    touchDelta.current = e.touches[0].clientX - touchStart.current;
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDelta.current) > 50) {
      if (touchDelta.current > 0) prev();
      else next();
    }
    touchStart.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
        <div
          className="relative overflow-hidden rounded-2xl shadow-lg"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Banner carousel"
        >
          {/* Slides */}
          <div
            className="flex"
            style={{
              transform: `translateX(-${current * 100}%)`,
              transition: hasTransition ? 'transform 500ms ease-in-out' : 'none',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {slides.map((banner, i) => (
              <div key={i} className="relative min-w-full">
                <div className="relative aspect-[3/4] sm:aspect-[2/1] lg:aspect-[1920/480] w-full overflow-hidden bg-surface">
                  <SmartImage
                    src={banner.src}
                    alt={banner.alt}
                    name={banner.alt}
                    rounded="none"
                    priority={i === 0}
                    objectFit="cover"
                    className="h-full w-full"
                    showSkeleton={false}
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                  {/* Content overlay */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-16">
                      <div className="max-w-lg">
                        <span className="inline-block rounded-lg bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                          B2B WHOLESALE
                        </span>
                        <h2 className="mt-3 text-xl font-extrabold leading-tight text-white sm:text-2xl md:text-3xl lg:text-5xl">
                          Wholesale Electronics
                        </h2>
                        <p className="mt-2 text-sm text-white/80 sm:text-base md:text-lg">
                          Bulk Orders &middot; GST Billing &middot; Trusted Sellers &middot; Fast Delivery
                        </p>
                        <p className="mt-1 text-xs text-white/60 sm:text-sm">
                          Lowest Wholesale Prices on 10,000+ Products
                        </p>
                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                          <Link to="/products">
                            <Button size="lg" className="bg-white text-brand-dark hover:bg-white/90 shadow-lg">
                              Shop Now
                            </Button>
                          </Link>
                          <Link to="/register">
                            <Button size="lg" className="bg-white/10 border border-white text-white hover:bg-white hover:text-brand-dark backdrop-blur-sm">
                              Become a Seller
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          {total > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 sm:h-12 sm:w-12"
                aria-label="Previous banner"
              >
                <FiChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 sm:h-12 sm:w-12"
                aria-label="Next banner"
              >
                <FiChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </>
          )}

          {/* Pagination dots */}
          {total > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {BANNERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setHasTransition(true);
                    setCurrent(i);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    // Highlight correct dot even when on clone slide
                    (current % total) === i ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to banner ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
