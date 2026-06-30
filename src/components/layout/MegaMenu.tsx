import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { getCategoryImage } from '@/lib/categoryImages';
import { SmartImage } from '@/components/common/SmartImage';
import { FiChevronRight } from 'react-icons/fi';

interface MegaMenuCategory {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  icon?: string | null;
  is_featured?: boolean;
  product_count?: number;
  children?: MegaMenuCategory[];
}

/**
 * Enterprise Mega Menu - hover to reveal subcategories.
 * Exactly like Moglix/Amazon/Alibaba.
 */
export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoot, setActiveRoot] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: tree } = useQuery({
    queryKey: ['mega-menu-tree'],
    queryFn: () => productService.getCategoryTree(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const categories: MegaMenuCategory[] = tree || [];

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveRoot(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setActiveRoot(null);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveRoot(null);
    }, 200);
  };

  const activeCategory = categories.find((c) => c.id === activeRoot);
  const subcategories = activeCategory?.children || [];

  if (!categories.length) return null;

  return (
    <div
      ref={menuRef}
      className="relative hidden lg:block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger button */}
      <button
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-brand">☰</span> All Categories
        <FiChevronRight className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {/* Mega menu dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 flex w-[800px] rounded-xl border bg-white shadow-2xl">
          {/* Root categories list */}
          <div className="w-[240px] flex-shrink-0 overflow-y-auto border-r bg-gray-50/50 py-2">
            {categories.map((cat) => {
              const img = getCategoryImage(cat.name, cat.image);
              const isActive = activeRoot === cat.id;
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-brand/10 font-semibold text-brand'
                      : 'text-gray-700 hover:bg-white hover:text-brand'
                  }`}
                  onMouseEnter={() => setActiveRoot(cat.id)}
                >
                  <SmartImage
                    src={img}
                    alt={cat.name}
                    name={cat.name}
                    rounded="lg"
                    objectFit="cover"
                    className="h-8 w-8 flex-shrink-0"
                    width={32}
                    height={32}
                  />
                  <span className="flex-1 truncate">{cat.name}</span>
                  <FiChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                </Link>
              );
            })}
          </div>

          {/* Subcategories grid */}
          <div className="flex-1 p-5">
            {activeCategory ? (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">{activeCategory.name}</h3>
                  <Link
                    to={`/products?category=${activeCategory.id}`}
                    className="text-xs font-semibold text-brand hover:underline"
                    onClick={() => { setIsOpen(false); setActiveRoot(null); }}
                  >
                    View All →
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/products?category=${sub.id}`}
                      className="group flex items-center gap-2.5 rounded-lg p-2.5 transition-colors hover:bg-brand/5"
                      onClick={() => { setIsOpen(false); setActiveRoot(null); }}
                    >
                      <SmartImage
                        src={getCategoryImage(sub.name, sub.image)}
                        alt={sub.name}
                        name={sub.name}
                        rounded="lg"
                        objectFit="cover"
                        className="h-10 w-10 flex-shrink-0 transition-transform group-hover:scale-105"
                        width={40}
                        height={40}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-800 group-hover:text-brand">{sub.name}</p>
                        {sub.product_count !== undefined && (
                          <p className="text-[10px] text-gray-400">{sub.product_count} items</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Third level if available */}
                {subcategories.some((s) => s.children && s.children.length > 0) && (
                  <div className="mt-5 border-t pt-4">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Popular Subcategories</p>
                    <div className="flex flex-wrap gap-2">
                      {subcategories
                        .filter((s) => s.children && s.children.length > 0)
                        .slice(0, 3)
                        .map((sub) =>
                          (sub.children || []).slice(0, 4).map((child) => (
                            <Link
                              key={child.id}
                              to={`/products?category=${child.id}`}
                              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-600 transition-colors hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
                              onClick={() => { setIsOpen(false); setActiveRoot(null); }}
                            >
                              {child.name}
                            </Link>
                          ))
                        )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                Hover over a category to see subcategories
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
