import { Link } from 'react-router-dom';
import { ProductImage } from '@/components/common/ProductImage';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { FiStar, FiHeart, FiShoppingCart, FiUsers, FiCheckCircle, FiEye, FiTrendingUp, FiAward } from 'react-icons/fi';
import type { Product } from '@/types/product';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

/**
 * Premium B2B marketplace product card.
 * Shows image, brand, seller count, pricing with discount, MOQ, stock, rating.
 * Supports grid and list view modes.
 */
export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const detail = `/products/${product.slug}`;
  const price = product.min_selling_price;
  const mrp = product.retail_price || product.max_mrp || product.min_mrp || null;
  const hasDiscount = !!mrp && parseFloat(mrp) > parseFloat(price);
  const discount = product.discount_percent || (hasDiscount ? Math.round((1 - parseFloat(price) / parseFloat(mrp!)) * 100) : 0);
  const rating = product.average_rating ? parseFloat(product.average_rating) : 0;
  const brand = product.brand_name || product.brand_detail?.name;
  const outOfStock = (product.total_stock ?? 0) <= 0;

  if (viewMode === 'list') {
    return (
      <Link
        to={detail}
        className="group flex gap-3 sm:gap-4 rounded-xl border bg-white p-3 shadow-sm transition-all hover:border-brand/30 hover:shadow-card-hover sm:p-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-surface sm:h-28 sm:w-28">
          {product.is_featured && (
            <span className="absolute left-0 top-1.5 z-10 rounded-r bg-gray-900 px-1.5 py-0.5 text-[9px] font-bold text-white">TOP</span>
          )}
          <ProductImage src={product.primary_image} name={product.name} className="object-contain p-2 transition-transform duration-300 group-hover:scale-110" />
        </div>
        <div className="min-w-0 flex-1">
          {brand && <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{brand}</p>}
          <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-brand">{product.name}</h3>
          {product.short_description && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{product.short_description}</p>}

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {product.total_sellers > 0 && (
              <span className="inline-flex items-center gap-1"><FiUsers className="h-3 w-3" /> {product.total_sellers} seller{product.total_sellers > 1 ? 's' : ''}</span>
            )}
            <span className={outOfStock ? 'text-destructive font-medium' : 'text-success font-medium'}>
              {outOfStock ? 'Out of Stock' : `${product.total_stock} in stock`}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-lg font-bold text-foreground">{formatCurrency(price)}</span>
            {hasDiscount && (
              <>
                <span className="text-xs text-muted-foreground line-through">{formatCurrency(mrp!)}</span>
                <span className="rounded bg-deal/10 px-1.5 py-0.5 text-[10px] font-bold text-deal">{discount}% OFF</span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-white transition-all hover:shadow-card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute left-0 top-0 z-10 flex flex-col gap-1">
        {product.is_featured && (
          <span className="rounded-r bg-gray-900 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide">Top Seller</span>
        )}
        {product.is_trending && (
          <span className="rounded-r bg-brand px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide flex items-center gap-0.5"><FiTrendingUp className="h-2.5 w-2.5" /> Trending</span>
        )}
        {product.is_top_seller && !product.is_featured && (
          <span className="rounded-r bg-amber-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide flex items-center gap-0.5"><FiAward className="h-2.5 w-2.5" /> Best Seller</span>
        )}
        {discount > 0 && (
          <span className="rounded-r bg-deal px-2 py-0.5 text-[9px] font-bold text-white">{discount}% OFF</span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={(e) => { e.preventDefault(); }}
        className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:border-brand hover:text-brand"
        aria-label="Save for later"
      >
        <FiHeart className="h-3.5 w-3.5" />
      </button>

      {/* Image */}
      <Link to={detail} className="relative block aspect-square overflow-hidden bg-surface p-4">
        <ProductImage src={product.primary_image} name={product.name} className="object-contain transition-transform duration-500 group-hover:scale-110" />

        {/* Quick actions overlay on hover */}
        <div className={`absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent p-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <span className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg transition-colors hover:bg-brand hover:text-white">
            <FiEye className="h-3.5 w-3.5" /> Quick View
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition-colors hover:bg-brand-dark">
            <FiShoppingCart className="h-3.5 w-3.5" /> Add to Cart
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 pt-2.5">
        {brand && <p className="mb-0.5 truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{brand}</p>}
        <Link to={detail} className="line-clamp-2 text-[13px] font-semibold leading-snug transition-colors hover:text-brand">{product.name}</Link>

        {/* Rating */}
        {rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1">
            <span className="inline-flex items-center gap-0.5 rounded bg-success px-1.5 py-0.5 text-[10px] font-bold text-white">
              {rating.toFixed(1)} <FiStar className="h-2.5 w-2.5 fill-white" />
            </span>
            <span className="text-[10px] text-muted-foreground">({product.total_reviews ?? 0})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-base font-bold text-foreground">{formatCurrency(price)}</span>
          {hasDiscount && (
            <>
              <span className="text-[11px] text-muted-foreground line-through">{formatCurrency(mrp!)}</span>
            </>
          )}
        </div>

        {/* B2B info */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
          {product.total_sellers > 0 && (
            <span className="inline-flex items-center gap-0.5"><FiUsers className="h-2.5 w-2.5" /> {product.total_sellers} sellers</span>
          )}
          <span>Min. {product.moq || 1} Piece{(product.moq || 1) > 1 ? 's' : ''}</span>
        </div>

        {/* Stock + GST + Warranty */}
        <div className="mt-1.5 flex items-center justify-between text-[10px]">
          <span className={outOfStock ? 'font-semibold text-destructive' : 'font-medium text-success'}>
            {outOfStock ? 'Out of Stock' : 'In Stock'}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            {product.gst && <span>{product.gst}% GST</span>}
            {product.warranty && <span className="border-l border-muted-foreground/20 pl-1">{product.warranty}</span>}
          </span>
        </div>

        {/* CTA */}
        <Link to={detail} className="mt-auto pt-2.5">
          <span className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-xs font-bold text-white transition-colors hover:bg-brand-dark">
            <FiShoppingCart className="h-3.5 w-3.5" /> View Details
          </span>
        </Link>
      </div>
    </div>
  );
}
