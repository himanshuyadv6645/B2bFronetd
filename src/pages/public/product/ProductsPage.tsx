import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '@/services/product.service';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/common/Pagination';
import { ProductCard } from '@/components/common/ProductCard';
import { formatCurrency } from '@/lib/utils';
import {
  FiFilter, FiGrid, FiList, FiX, FiChevronDown, FiChevronRight, FiChevronUp,
  FiSliders, FiStar, FiTruck, FiPackage, FiTag, FiArrowRight, FiRotateCcw,
  FiMail, FiMessageSquare, FiShoppingBag, FiSearch, FiEdit2, FiGlobe,
} from 'react-icons/fi';

const PAGE_SIZE = 20;

/* ═══════════════════════════════════════════════════════════════════════
   COLLAPSIBLE FILTER SECTION
   ═══════════════════════════════════════════════════════════════════════ */
interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
  children: React.ReactNode;
}

function FilterSection({ title, icon, defaultOpen = true, count, children }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-divider last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-surface"
      >
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-foreground">
          {icon} {title}
          {count !== undefined && <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{count}</span>}
        </span>
        <FiChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`filter-section-content ${isOpen ? 'expanded' : 'collapsed'}`}>
        <div className="px-4 pb-3">{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */
interface CatOption { slug: string; name: string; depth: number; productCount?: number; }
function flattenCats(nodes: { slug: string; name: string; product_count?: number; children?: unknown[] }[] | undefined, depth = 0, acc: CatOption[] = []): CatOption[] {
  for (const n of nodes || []) {
    acc.push({ slug: n.slug, name: n.name, depth, productCount: n.product_count });
    if (Array.isArray(n.children) && n.children.length) flattenCats(n.children as typeof nodes, depth + 1, acc);
  }
  return acc;
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand/5 px-2.5 py-1 text-xs font-medium text-brand">
      {label}
      <button onClick={onRemove} className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-brand/10" aria-label={`Remove ${label}`}>
        <FiX className="h-3 w-3" />
      </button>
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="aspect-square animate-shimmer" />
      <div className="space-y-2 p-3">
        <div className="h-2.5 w-1/3 animate-shimmer rounded bg-surface" />
        <div className="h-3 w-full animate-shimmer rounded bg-surface" />
        <div className="h-3 w-3/4 animate-shimmer rounded bg-surface" />
        <div className="h-4 w-1/2 animate-shimmer rounded bg-surface" />
        <div className="h-7 w-full animate-shimmer rounded-lg bg-surface" />
      </div>
    </div>
  );
}

function EmptyState({
  categoryName,
  search,
  hasFilters,
  onClearFilters,
}: {
  categoryName?: string;
  search?: string;
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand/5">
        <FiShoppingBag className="h-10 w-10 text-brand/30" />
      </div>
      <h3 className="mb-1.5 text-lg font-bold text-gray-900">No Products Found</h3>
      <p className="mb-1 max-w-sm text-sm text-gray-500">
        {categoryName
          ? `No products are currently available in "${categoryName}".`
          : search
            ? `No products match "${search}".`
            : 'No products match your current filters.'}
      </p>
      <p className="mb-6 max-w-sm text-xs text-gray-400">
        Try browsing our full catalog or adjusting your filters.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link to="/products">
          <Button className="gap-2" onClick={onClearFilters}>
            <FiArrowRight className="h-4 w-4" /> Browse All Products
          </Button>
        </Link>
        {hasFilters && (
          <Button variant="outline" className="gap-2" onClick={onClearFilters}>
            <FiRotateCcw className="h-4 w-4" /> Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MOBILE SORT BOTTOM SHEET
   ═══════════════════════════════════════════════════════════════════════ */
function SortSheet({ open, onClose, value, onChange }: {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (v: string) => void;
}) {
  if (!open) return null;
  const options = [
    { value: '-created_at', label: 'Newest First' },
    { value: 'created_at', label: 'Oldest First' },
    { value: 'min_selling_price', label: 'Price: Low to High' },
    { value: '-min_selling_price', label: 'Price: High to Low' },
    { value: '-average_rating', label: 'Rating: High to Low' },
    { value: '-total_reviews', label: 'Most Reviewed' },
  ];
  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-bold">Sort By</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface"><FiX className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); onClose(); }}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm transition-colors ${
                value === opt.value ? 'bg-brand/5 font-semibold text-brand' : 'text-foreground hover:bg-surface'
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <FiChevronRight className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showCatTree, setShowCatTree] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const priceDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const ordering = searchParams.get('ordering') || '-created_at';
  const minRating = searchParams.get('min_rating') || '';
  const minMoq = searchParams.get('min_moq') || '';
  const maxMoq = searchParams.get('max_moq') || '';
  const country = searchParams.get('country') || '';
  const isFeatured = searchParams.get('is_featured') || '';

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', { search, page, category, brand, min_price: minPrice, max_price: maxPrice, ordering, min_rating: minRating, min_moq: minMoq, max_moq: maxMoq, country, is_featured: isFeatured }],
    queryFn: () => productService.getProducts({ search, page, category, brand, min_price: minPrice, max_price: maxPrice, ordering, min_rating: minRating, min_moq: minMoq, max_moq: maxMoq, country, is_featured: isFeatured }),
    placeholderData: keepPreviousData,
  });

  const { categories: navCategories } = useCategories();
  const { data: tree } = useQuery({
    queryKey: ['filter-category-tree'],
    queryFn: () => productService.getCategoryTree(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: brandsData } = useQuery({
    queryKey: ['filter-brands'],
    queryFn: () => productService.getBrands({ page_size: 200 }),
    staleTime: 5 * 60 * 1000,
  });

  const catOptions = useMemo(() => {
    const apiCats = flattenCats(tree as never);
    if (apiCats.length > 0) return apiCats;
    return navCategories.map((c) => ({ slug: c.slug || c.id, name: c.name, depth: 0, productCount: c.product_count }));
  }, [tree, navCategories]);

  const brands = brandsData?.results || [];
  const activeCatName = catOptions.find((c) => c.slug === category)?.name;
  const activeBrandName = brands.find((b) => b.id === brand)?.name;

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brands;
    const q = brandSearch.toLowerCase();
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [brands, brandSearch]);

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    setSearchParams(params);
    setPriceMin('');
    setPriceMax('');
    setShowCatTree(false);
    setBrandSearch('');
  }, [search, setSearchParams]);

  const applyPriceRange = useCallback(() => {
    updateFilter('min_price', priceMin);
    updateFilter('max_price', priceMax);
  }, [priceMin, priceMax, updateFilter]);

  const handlePriceInput = useCallback((type: 'min' | 'max', value: string) => {
    if (type === 'min') setPriceMin(value);
    else setPriceMax(value);
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    priceDebounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (type === 'min') { if (value) params.set('min_price', value); else params.delete('min_price'); }
      else { if (value) params.set('max_price', value); else params.delete('max_price'); }
      params.set('page', '1');
      setSearchParams(params);
    }, 400);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    return () => { if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current); };
  }, []);

  const hasActiveFilters = !!(category || brand || minPrice || maxPrice || minRating || minMoq || maxMoq || country || isFeatured);
  const totalPages = Math.ceil((data?.count || 0) / PAGE_SIZE);

  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (activeCatName) activeFilters.push({ label: activeCatName, onRemove: () => { updateFilter('category', ''); setShowCatTree(false); } });
  if (activeBrandName) activeFilters.push({ label: activeBrandName, onRemove: () => updateFilter('brand', '') });
  if (minPrice || maxPrice) activeFilters.push({ label: `${formatCurrency(minPrice || '0')} – ${formatCurrency(maxPrice || '∞')}`, onRemove: () => { updateFilter('min_price', ''); updateFilter('max_price', ''); setPriceMin(''); setPriceMax(''); } });
  if (minRating) activeFilters.push({ label: `${minRating}★ & Above`, onRemove: () => updateFilter('min_rating', '') });
  if (minMoq) activeFilters.push({ label: `MOQ ≤ ${minMoq}`, onRemove: () => updateFilter('min_moq', '') });
  if (maxMoq) activeFilters.push({ label: `MOQ ≥ ${maxMoq}`, onRemove: () => updateFilter('max_moq', '') });
  if (country) activeFilters.push({ label: `Origin: ${country}`, onRemove: () => updateFilter('country', '') });
  if (isFeatured) activeFilters.push({ label: 'Featured', onRemove: () => updateFilter('is_featured', '') });

  /* ═══════════════════════════════════════════════════════════════════
     FILTER PANEL (used in sidebar + mobile drawer)
     ═══════════════════════════════════════════════════════════════════ */
  const FilterPanel = () => (
    <div className="divide-y divide-divider">

      {/* ── CATEGORY ──────────────────────────────────────────── */}
      {category && !showCatTree ? (
        /* Selected category compact card */
        <div className="border-b border-divider">
          <div className="px-4 py-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Selected Category</p>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold text-foreground">
                <FiPackage className="mr-1 inline h-3.5 w-3.5 text-brand" />
                {activeCatName}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setShowCatTree(true)}
                  className="rounded-md border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  <FiEdit2 className="mr-0.5 inline h-3 w-3" /> Change
                </button>
                <button
                  onClick={() => { updateFilter('category', ''); setShowCatTree(false); }}
                  className="rounded-md border px-2 py-1 text-[11px] font-medium text-destructive transition-colors hover:bg-destructive/5"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full category tree */
        <FilterSection title="Category" icon={<FiPackage className="h-3.5 w-3.5" />} count={catOptions.length}>
          <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
            <button
              onClick={() => { updateFilter('category', ''); setShowCatTree(false); }}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${!category ? 'bg-brand/10 font-semibold text-brand' : 'text-muted-foreground hover:bg-surface'}`}
            >
              <span>All Categories</span>
            </button>
            {catOptions.map((c) => (
              <button
                key={c.slug}
                onClick={() => { updateFilter('category', c.slug); setShowCatTree(false); }}
                style={{ paddingLeft: `${0.5 + c.depth * 0.75}rem` }}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${category === c.slug ? 'bg-brand/10 font-semibold text-brand' : 'text-muted-foreground hover:bg-surface'}`}
              >
                <span className="truncate">{c.name}</span>
                {c.productCount !== undefined && (
                  <span className="text-[10px] text-muted-foreground">({c.productCount})</span>
                )}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* ── BRAND (with search) ───────────────────────────────── */}
      <FilterSection title="Brand" icon={<FiTag className="h-3.5 w-3.5" />} count={brands.length}>
        <div className="mb-2">
          <div className="relative">
            <FiSearch className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Search brands..."
              className="h-8 w-full rounded-md border bg-surface pl-7 pr-2 text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20"
            />
            {brandSearch && (
              <button onClick={() => setBrandSearch('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-muted">
                <FiX className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
        <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
          <button
            onClick={() => updateFilter('brand', '')}
            className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${!brand ? 'bg-brand/10 font-semibold text-brand' : 'text-muted-foreground hover:bg-surface'}`}
          >
            <span>All Brands</span>
          </button>
          {filteredBrands.map((b) => (
            <button
              key={b.id}
              onClick={() => updateFilter('brand', b.id)}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${brand === b.id ? 'bg-brand/10 font-semibold text-brand' : 'text-muted-foreground hover:bg-surface'}`}
            >
              <span className="truncate">{b.name}</span>
              {b.product_count !== undefined && <span className="text-[10px] text-muted-foreground">({b.product_count})</span>}
            </button>
          ))}
          {filteredBrands.length === 0 && brandSearch && (
            <p className="py-2 text-center text-xs text-muted-foreground">No brands match "{brandSearch}"</p>
          )}
        </div>
      </FilterSection>

      {/* ── PRICE RANGE ───────────────────────────────────────── */}
      <FilterSection title="Price Range" icon={<FiSliders className="h-3.5 w-3.5" />}>
        <div className="space-y-2.5">
          {/* Quick price chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Under ₹500', min: '', max: '500' },
              { label: '₹500–2K', min: '500', max: '2000' },
              { label: '₹2K–5K', min: '2000', max: '5000' },
              { label: '₹5K–10K', min: '5000', max: '10000' },
              { label: '₹10K+', min: '10000', max: '' },
            ].map((chip) => {
              const active = minPrice === chip.min && maxPrice === chip.max;
              return (
                <button
                  key={chip.label}
                  onClick={() => {
                    setPriceMin(chip.min);
                    setPriceMax(chip.max);
                    updateFilter('min_price', chip.min);
                    updateFilter('max_price', chip.max);
                  }}
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors ${
                    active ? 'border-brand bg-brand/5 text-brand' : 'border-gray-200 text-muted-foreground hover:border-brand/40'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
          {/* Custom range */}
          <div className="flex gap-2">
            <Input type="number" placeholder="Min ₹" value={priceMin} onChange={(e) => handlePriceInput('min', e.target.value)} className="h-8 text-xs" />
            <span className="flex items-center text-muted-foreground">–</span>
            <Input type="number" placeholder="Max ₹" value={priceMax} onChange={(e) => handlePriceInput('max', e.target.value)} className="h-8 text-xs" />
          </div>
          <Button size="sm" className="w-full" onClick={applyPriceRange}>Apply</Button>
          {(minPrice || maxPrice) && (
            <button onClick={() => { updateFilter('min_price', ''); updateFilter('max_price', ''); setPriceMin(''); setPriceMax(''); }} className="w-full text-center text-[11px] font-medium text-brand hover:underline">
              Clear price filter
            </button>
          )}
        </div>
      </FilterSection>

      {/* ── RATING ────────────────────────────────────────────── */}
      <FilterSection title="Rating" icon={<FiStar className="h-3.5 w-3.5" />} defaultOpen={!!minRating}>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => updateFilter('min_rating', minRating === String(r) ? '' : String(r))}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${minRating === String(r) ? 'bg-brand/10 font-semibold text-brand' : 'text-muted-foreground hover:bg-surface'}`}
            >
              <span className="flex items-center gap-0.5">{r} <FiStar className="h-3 w-3 fill-rating text-rating" /></span>
              <span>&amp; above</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── MOQ ───────────────────────────────────────────────── */}
      <FilterSection title="MOQ (Min Order Qty)" icon={<FiShoppingBag className="h-3.5 w-3.5" />} defaultOpen={false}>
        <div className="space-y-1">
          {[
            { label: '1 Piece', minMoq: '1', maxMoq: '' },
            { label: 'Up to 5 Pieces', minMoq: '5', maxMoq: '' },
            { label: 'Up to 10 Pieces', minMoq: '10', maxMoq: '' },
            { label: 'Up to 25 Pieces', minMoq: '25', maxMoq: '' },
            { label: '25+ Pieces', minMoq: '', maxMoq: '25' },
          ].map((opt) => {
            const active = minMoq === opt.minMoq && maxMoq === opt.maxMoq;
            return (
              <button
                key={opt.label}
                onClick={() => {
                  if (active) { updateFilter('min_moq', ''); updateFilter('max_moq', ''); }
                  else { updateFilter('min_moq', opt.minMoq); updateFilter('max_moq', opt.maxMoq); }
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors ${active ? 'bg-brand/10 font-semibold text-brand' : 'text-muted-foreground hover:bg-surface'}`}
              >
                <span>{opt.label}</span>
                {active && <FiChevronRight className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* ── COUNTRY OF ORIGIN ─────────────────────────────────── */}
      <FilterSection title="Country of Origin" icon={<FiGlobe className="h-3.5 w-3.5" />} defaultOpen={false}>
        <div className="space-y-1">
          {['India', 'China', 'USA', 'Japan', 'South Korea', 'Germany', 'Taiwan'].map((c) => (
            <button
              key={c}
              onClick={() => updateFilter('country', country === c ? '' : c)}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors ${country === c ? 'bg-brand/10 font-semibold text-brand' : 'text-muted-foreground hover:bg-surface'}`}
            >
              <span>{c}</span>
              {country === c && <FiChevronRight className="h-3 w-3" />}
            </button>
          ))}
          {country && !['India', 'China', 'USA', 'Japan', 'South Korea', 'Germany', 'Taiwan'].includes(country) && (
            <button
              onClick={() => updateFilter('country', '')}
              className="flex w-full items-center justify-between rounded-lg bg-brand/10 px-2 py-1.5 text-xs font-semibold text-brand"
            >
              <span>{country}</span>
              <FiX className="h-3 w-3" />
            </button>
          )}
        </div>
      </FilterSection>

      {/* ── FEATURED ──────────────────────────────────────────── */}
      <FilterSection title="Availability" icon={<FiTruck className="h-3.5 w-3.5" />} defaultOpen={false}>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter('is_featured', isFeatured ? '' : 'true')}
            className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors ${isFeatured ? 'bg-brand/10 font-semibold text-brand' : 'text-muted-foreground hover:bg-surface'}`}
          >
            <span>Featured Products Only</span>
            {isFeatured && <FiChevronRight className="h-3 w-3" />}
          </button>
        </div>
      </FilterSection>

      {/* ── CLEAR ALL ─────────────────────────────────────────── */}
      {hasActiveFilters && (
        <div className="p-3">
          <Button variant="outline" size="sm" onClick={clearFilters} className="w-full text-xs gap-1">
            <FiRotateCcw className="h-3 w-3" /> Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-surface">

      {/* ── TOOLBAR ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          {/* Row 1: Breadcrumb + Sort + View */}
          <div className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                <FiPackage className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="font-medium text-foreground">Products</span>
                {activeCatName && (
                  <>
                    <FiChevronRight className="h-3 w-3 flex-shrink-0" />
                    <span className="font-medium text-foreground truncate">{activeCatName}</span>
                  </>
                )}
              </div>
              <span className="hidden sm:inline text-xs text-muted-foreground">·</span>
              <p className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
                <span className="font-semibold text-foreground">{data?.count || 0}</span> results
                {search && <span> for "<span className="font-medium text-foreground">{search}</span>"</span>}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {isFetching && <span className="text-[10px] text-muted-foreground hidden sm:block">Updating...</span>}
              {/* Desktop sort */}
              <select
                className="hidden sm:block h-8 rounded-lg border bg-white px-2 text-xs font-medium text-foreground transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
                value={ordering}
                onChange={(e) => updateFilter('ordering', e.target.value)}
              >
                <option value="-created_at">Newest</option>
                <option value="created_at">Oldest</option>
                <option value="min_selling_price">Price: Low → High</option>
                <option value="-min_selling_price">Price: High → Low</option>
                <option value="-average_rating">Rating: High → Low</option>
                <option value="-total_reviews">Most Reviewed</option>
              </select>
              {/* Mobile sort button */}
              <button
                onClick={() => setShowMobileSort(true)}
                className="flex sm:hidden h-8 items-center gap-1 rounded-lg border px-2 text-xs font-medium text-foreground"
              >
                <FiSliders className="h-3.5 w-3.5" /> Sort
              </button>
              <div className="hidden sm:flex rounded-lg border overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex h-8 w-8 items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-surface'}`}
                >
                  <FiGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex h-8 w-8 items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-surface'}`}
                >
                  <FiList className="h-3.5 w-3.5" />
                </button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowMobileFilters(true)} className="lg:hidden h-8 text-xs px-2">
                <FiFilter className="mr-1 h-3.5 w-3.5" /> Filters{hasActiveFilters ? ` · ${activeFilters.length}` : ''}
              </Button>
            </div>
          </div>

          {/* Row 2: Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-1.5 pb-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {activeFilters.map((f, i) => <Chip key={i} label={f.label} onRemove={f.onRemove} />)}
              <button onClick={clearFilters} className="text-[11px] font-medium text-brand hover:underline whitespace-nowrap ml-1">Clear All</button>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex gap-4">

          {/* Desktop sidebar */}
          <aside className="hidden w-[260px] flex-shrink-0 lg:block">
            <div className="sticky top-36 overflow-hidden rounded-xl border bg-white shadow-filter">
              <div className="border-b border-divider px-4 py-2.5">
                <h3 className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <FiSliders className="h-3.5 w-3.5 text-brand" /> Filters
                </h3>
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Product grid */}
          <div className="min-w-0 flex-1">
            <p className="mb-3 text-xs text-muted-foreground sm:hidden">
              <span className="font-semibold text-foreground">{data?.count || 0}</span> products
              {search && <span> for "<span className="font-medium text-foreground">{search}</span>"</span>}
            </p>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : data?.results?.length === 0 ? (
              <EmptyState
                categoryName={activeCatName}
                search={search}
                hasFilters={hasActiveFilters}
                onClearFilters={clearFilters}
              />
            ) : viewMode === 'grid' ? (
              <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 ${isFetching ? 'opacity-60' : ''}`}>
                {data?.results?.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className={`space-y-2 ${isFetching ? 'opacity-60' : ''}`}>
                {data?.results?.map((product) => <ProductCard key={product.id} product={product} viewMode="list" />)}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => updateFilter('page', String(p))} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER BOTTOM SHEET ────────────────────────── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-divider px-4 py-3">
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <FiSliders className="h-4 w-4 text-brand" /> Filters
                {hasActiveFilters && <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] text-brand">{activeFilters.length} active</span>}
              </h3>
              <button onClick={() => setShowMobileFilters(false)} className="rounded-lg p-1.5 hover:bg-surface"><FiX className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterPanel />
            </div>
            <div className="border-t border-divider p-4">
              <Button className="w-full" onClick={() => setShowMobileFilters(false)}>
                Show {data?.count || 0} Results
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE SORT BOTTOM SHEET ──────────────────────────── */}
      <SortSheet
        open={showMobileSort}
        onClose={() => setShowMobileSort(false)}
        value={ordering}
        onChange={(v) => updateFilter('ordering', v)}
      />
    </div>
  );
}
