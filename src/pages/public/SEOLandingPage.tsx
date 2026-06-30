import { useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { seoService } from '@/services/seo.service';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { ProductCard } from '@/components/common/ProductCard';
import { Button } from '@/components/ui/Button';
import { FiAlertTriangle, FiMapPin, FiShield, FiTruck, FiCheckCircle, FiChevronDown, FiChevronUp, FiHelpCircle, FiSearch, FiGrid, FiStar, FiPackage } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import type { SEOPageData } from '@/types/seo';
import type { Product } from '@/types/product';
import { SchemaJSONLD } from '@/components/seo';

function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center sm:py-20">
      <FiAlertTriangle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
      <h2 className="mb-2 text-xl font-semibold">Page not found</h2>
      <p className="mb-6 text-muted-foreground">The page you're looking for doesn't exist.</p>
      <Link to="/"><Button>Browse Products</Button></Link>
    </div>
  );
}

function Breadcrumbs({ items }: { items: Array<{ name: string; url: string | null }> }) {
  if (!items?.length) return null;
  return (
    <nav className="mb-4 text-xs text-muted-foreground sm:mb-6 sm:text-sm">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span>/</span>}
            {item.url ? (
              <Link to={item.url} className="hover:text-brand transition-colors">{item.name}</Link>
            ) : (
              <span className="font-medium text-foreground">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function TrustBadges({ cityName }: { cityName?: string }) {
  const badges = [
    { icon: FiCheckCircle, text: 'Verified Sellers' },
    { icon: FiShield, text: 'GST Invoicing' },
    { icon: FiTruck, text: 'Fast Delivery' },
  ];
  if (cityName) badges.splice(2, 0, { icon: FiMapPin, text: `Local in ${cityName}` });

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {badges.map((b, i) => (
        <div key={i} className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
          <b.icon className="h-3.5 w-3.5 text-brand" />
          {b.text}
        </div>
      ))}
    </div>
  );
}

function FAQSection({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!faqs?.length) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <FiHelpCircle className="h-5 w-5 text-brand" />
        <h2 className="text-lg font-bold text-foreground">Frequently Asked Questions</h2>
      </div>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-border bg-white">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/30"
            >
              <span className="pr-4">{faq.question}</span>
              {open === i ? <FiChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <FiChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
            </button>
            {open === i && (
              <div className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SellerSection({ sellers, cityName }: { sellers: SEOPageData['sellers']; cityName?: string }) {
  if (!sellers?.length) return null;
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-foreground">Top Sellers{cityName ? ` in ${cityName}` : ''}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sellers.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border bg-white p-4 hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
              {s.logo ? <img src={s.logo} alt={s.company_name} className="h-full w-full rounded-full object-cover" /> : s.company_name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-sm font-semibold text-foreground">{s.company_name}</h3>
                {s.is_verified && <FiCheckCircle className="h-3.5 w-3.5 text-blue-500" />}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <FiStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{s.rating}</span>
                <span className="text-xs text-muted-foreground">({s.total_ratings})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RelatedSearches({ searches }: { searches: string[] }) {
  if (!searches?.length) return null;
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <FiSearch className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-bold text-foreground">Related Searches</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((s, i) => (
          <Link
            key={i}
            to={`/search/${encodeURIComponent(s.replace(/\s+/g, '-').toLowerCase())}`}
            className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-brand/30 hover:bg-brand/5 hover:text-brand transition-all"
          >
            {s}
          </Link>
        ))}
      </div>
    </section>
  );
}

function RelatedCategories({ categories }: { categories: SEOPageData['related_categories'] }) {
  if (!categories?.length) return null;
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <FiGrid className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-bold text-foreground">Related Categories</h2>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((c) => (
          <Link key={c.slug} to={`/categories/${c.slug}`} className="group flex flex-col items-center rounded-lg border border-border bg-white p-3 hover:shadow-md transition-shadow">
            <div className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-muted/20">
              {c.image ? <img src={c.image} alt={c.name} className="h-full w-full object-contain" /> : <FiGrid className="h-6 w-6 text-muted-foreground" />}
            </div>
            <span className="text-center text-xs font-medium text-foreground">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BuyingGuideSection({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!content) return null;
  const isLong = content.length > 300;
  return (
    <section className="rounded-lg border border-border bg-white p-4 sm:p-6">
      <h2 className="mb-3 text-lg font-bold text-foreground">Buying Guide</h2>
      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
        {isLong && !expanded ? content.slice(0, 300) + '...' : content}
      </p>
      {isLong && (
        <button onClick={() => setExpanded(!expanded)} className="mt-3 flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-dark">
          {expanded ? 'Show Less' : 'Read More'}
          {expanded ? <FiChevronUp className="h-3.5 w-3.5" /> : <FiChevronDown className="h-3.5 w-3.5" />}
        </button>
      )}
    </section>
  );
}

export default function SEOLandingPage() {
  const { '*': path } = useParams<{ '*': string }>();
  const location = useLocation();

  const { data: page, isLoading, error } = useQuery<SEOPageData>({
    queryKey: ['seo-page', path],
    queryFn: () => seoService.resolvePage(path || ''),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (page) {
      document.title = page.title || page.h1_heading;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', page.meta_description);
    }
  }, [page]);

  if (isLoading) return <PageLoading />;
  if (error || !page) return <NotFound />;

  return (
    <>
      {page.schema_json && <SchemaJSONLD schema={page.schema_json} />}

      <div className="container mx-auto px-4 py-4 sm:py-6">
        <Breadcrumbs items={page.breadcrumbs} />

        {/* Hero Section */}
        <section className="mb-6 rounded-xl border border-border bg-white p-4 sm:p-6 sm:mb-8">
          <h1 className="mb-2 text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
            {page.h1_heading}
          </h1>
          {page.intro_text && (
            <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {page.intro_text}
            </p>
          )}
          <TrustBadges cityName={page.city} />
        </section>

        <div className="space-y-6 sm:space-y-8">
          {/* Products */}
          {page.products?.length > 0 && (
            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-bold text-foreground sm:text-lg">
                  {page.category_name || page.brand_name
                    ? `${page.brand_name ? page.brand_name + ' ' : ''}${page.category_name || 'Products'}${page.city ? ' in ' + page.city : ''}`
                    : `Products${page.city ? ' in ' + page.city : ''}`
                  }
                </h2>
                <span className="text-xs text-muted-foreground sm:text-sm">{page.total_products} items</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
                {page.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product as unknown as Product}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Sellers */}
          {page.sellers?.length > 0 && (
            <SellerSection sellers={page.sellers} cityName={page.city} />
          )}

          {/* Buying Guide */}
          <BuyingGuideSection content={page.buying_guide} />

          {/* Related Categories */}
          <RelatedCategories categories={page.related_categories} />

          {/* FAQ */}
          <FAQSection faqs={page.faq_json} />

          {/* Related Searches */}
          <RelatedSearches searches={page.related_searches} />
        </div>
      </div>
    </>
  );
}
