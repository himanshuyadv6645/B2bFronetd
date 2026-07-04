import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '@/services/product.service';
import { pricingService } from '@/services/pricing.service';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAddress } from '@/contexts/AddressContext';
import { useAuthRedirect } from '@/contexts/AuthRedirectContext';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { PendingAction } from '@/types/auth-redirect';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { ProductImage } from '@/components/common/ProductImage';
import { ImageLightbox } from '@/components/common/ImageLightbox';
import { ProductCard } from '@/components/common/ProductCard';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ProductInfoSection } from '@/components/common/ProductInfoSection';
import { WholesaleTierDisplay } from '@/components/common/WholesaleTierDisplay';
import {
  FiShoppingCart, FiHeart, FiTruck, FiShield, FiChevronLeft, FiChevronRight, FiShare2,
  FiMinus, FiPlus, FiPackage, FiCheck, FiStar, FiFileText, FiCheckCircle, FiMapPin,
  FiMessageSquare, FiZap, FiLock, FiRefreshCw, FiZoomIn,
} from 'react-icons/fi';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { requireAuth } = useRequireAuth();
  const { getAndClearPendingAction } = useAuthRedirect();
  const { selectedAddress, openModal: openAddressModal } = useAddress();
  const { addToCart } = useCart();
  const { addToWishlist, items: wishlistItems } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [pincode, setPincode] = useState('');
  const [pinChecked, setPinChecked] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  // Hover-zoom is a mouse-only affordance. On touch devices a tap fires a synthetic
  // mouseenter/mousemove but NEVER a mouseleave, so the image would stay stuck at
  // scale(2) and zoom into an off-screen (black) region. Only enable it for a fine
  // pointer with true hover.
  const [canHover, setCanHover] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const onChange = (e: MediaQueryListEvent) => { setCanHover(e.matches); if (!e.matches) setIsZooming(false); };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProduct(slug!),
    enabled: !!slug,
  });

  const { data: sellerPricing } = useQuery({
    queryKey: ['product-sellers', product?.id],
    queryFn: () => {
      const variantId = product?.variants?.[0]?.id;
      if (!variantId) return [];
      return pricingService.comparePricing(variantId);
    },
    enabled: !!product?.variants?.[0]?.id,
  });

  const { data: related } = useQuery({
    queryKey: ['related-products', product?.category, product?.id],
    queryFn: () => productService.getProducts({ category: product!.category, page_size: 13 }),
    enabled: !!product?.category,
  });

  useEffect(() => {
    if (selectedAddress?.pincode) {
      setPincode(selectedAddress.pincode);
      setPinChecked(true);
    }
  }, [selectedAddress?.pincode]);

  // Execute pending action after login (read from sessionStorage)
  useEffect(() => {
    if (!product) return;
    const pendingAction = getAndClearPendingAction();
    if (!pendingAction) return;

    if (pendingAction.action === PendingAction.ADD_TO_CART && pendingAction.sellerId && pendingAction.variantId) {
      addToCart({ sellerId: pendingAction.sellerId, variantId: pendingAction.variantId, quantity: pendingAction.quantity || 1 });
    } else if (pendingAction.action === PendingAction.BUY_NOW && pendingAction.sellerId && pendingAction.variantId) {
      addToCart({ sellerId: pendingAction.sellerId, variantId: pendingAction.variantId, quantity: pendingAction.quantity || 1 });
      navigate('/buyer/cart');
    } else if (pendingAction.action === PendingAction.ADD_TO_WISHLIST && pendingAction.variantId) {
      addToWishlist({ variantId: pendingAction.variantId });
    }
  }, [product, addToCart, addToWishlist, navigate, getAndClearPendingAction]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPosition({ x, y });
  }, [canHover]);

  // Keep the selected quantity at or above the active seller's MOQ, so the user
  // can't submit below the minimum (which the backend would reject).
  useEffect(() => {
    const list = (sellerPricing as any[]) || [];
    const activeSeller = list.find((s) => s.id === selectedSeller) || list[0];
    const moq = Number(activeSeller?.minimum_order_quantity) || 1;
    setQuantity((q) => (q < moq ? moq : q));
  }, [sellerPricing, selectedSeller]);

  if (isLoading) return <PageLoading />;
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center sm:py-20">
        <FiPackage className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Product not found</h2>
        <p className="mb-6 text-muted-foreground">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/products"><Button>Browse Products</Button></Link>
      </div>
    );
  }

  const images = product.images || [];
  const documents = product.documents || [];
  const sellers: any[] = (sellerPricing as any[]) || [];
  const active = sellers.find((s) => s.id === selectedSeller) || sellers[0] || null;
  const moq = Number(active?.minimum_order_quantity) || 1;
  const availableStock = active?.available_stock !== undefined ? active.available_stock : (product.total_stock ?? 0);
  const variantId = product.variants?.[0]?.id;
  const isInWishlist = wishlistItems.some((item) => item.variant_detail?.product?.id === product.id);
  const relatedProducts = (related?.results || []).filter((p) => p.id !== product.id).slice(0, 12);

  const tiers: any[] = active?.wholesale_tiers || [];
  const basePrice = active ? parseFloat(active.selling_price) : parseFloat(product.min_selling_price || '0');
  const taxRate = active ? parseFloat(active.tax_rate || '0') : 0;

  const matchedTier = [...tiers]
    .sort((a, b) => b.min_quantity - a.min_quantity)
    .find((t) => quantity >= t.min_quantity && (t.max_quantity === null || quantity <= t.max_quantity));

  const priceNum = matchedTier ? parseFloat(matchedTier.price_per_unit) : basePrice;
  const gst = priceNum * taxRate / 100;
  const totalIncl = priceNum + gst;
  const mrp = product.max_mrp ? parseFloat(product.max_mrp) : null;
  const discount = mrp && mrp > priceNum ? Math.round((1 - priceNum / mrp) * 100) : 0;

  const handleAddToCart = () => {
    if (!requireAuth('add items to cart', {
      action: PendingAction.ADD_TO_CART,
      productId: product.id,
      variantId,
      sellerId: active?.seller,
      quantity,
    })) return;
    if (!active) { toast.error('No seller available for this product'); return; }
    addToCart({ sellerId: active.seller, variantId: active.variant, quantity });
  };

  const handleBuyNow = () => {
    if (!requireAuth('buy this product', {
      action: PendingAction.BUY_NOW,
      productId: product.id,
      variantId,
      sellerId: active?.seller,
      quantity,
    })) return;
    if (!active) { toast.error('No seller available for this product'); return; }
    addToCart({ sellerId: active.seller, variantId: active.variant, quantity });
    navigate('/buyer/cart');
  };

  const handleWishlist = () => {
    if (!requireAuth('save to wishlist', {
      action: PendingAction.ADD_TO_WISHLIST,
      productId: product.id,
      variantId,
    })) return;
    if (variantId) addToWishlist({ variantId });
  };

  const checkPincode = () => {
    if (pincode.trim().length === 6) setPinChecked(true);
    else toast.error('Enter a valid 6-digit pincode');
  };

  const PriceDisplay = ({ size = 'lg' }: { size?: 'sm' | 'lg' }) => (
    <div>
      {matchedTier && (
        <p className="mb-1 inline-block rounded bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
          Qty {matchedTier.min_quantity}-{matchedTier.max_quantity || 'Above+'} Price
        </p>
      )}
      <p className="text-xs text-muted-foreground">{formatCurrency(totalIncl)} <span className="text-[11px]">(Incl. of all taxes)</span></p>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className={size === 'lg' ? 'text-2xl font-bold sm:text-3xl' : 'text-xl font-bold'}>{formatCurrency(priceNum)}</span>
        {taxRate > 0 && <span className="text-sm text-muted-foreground">+ {formatCurrency(gst)} GST</span>}
      </div>
      {mrp && discount > 0 && (
        <p className="text-sm">
          <span className="text-muted-foreground">MRP </span>
          <span className="text-muted-foreground line-through">{formatCurrency(mrp)}</span>
          <span className="ml-2 font-bold text-success">{discount}% OFF</span>
        </p>
      )}
    </div>
  );

  /* ─── LEFT COLUMN: Image Gallery ─── */
  const GalleryColumn = () => (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="group relative aspect-square overflow-hidden rounded-xl border bg-white"
        onMouseEnter={canHover ? () => setIsZooming(true) : undefined}
        onMouseLeave={canHover ? () => setIsZooming(false) : undefined}
        onMouseMove={canHover ? handleMouseMove : undefined}
      >
        {product.is_featured && (
          <span className="absolute left-0 top-3 z-10 rounded-r bg-gray-900 px-2 py-0.5 text-[10px] font-semibold text-white">Top Seller</span>
        )}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 text-muted-foreground shadow-sm backdrop-blur-sm hover:text-brand"
            aria-label="Share"
          >
            <FiShare2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleWishlist}
            className={`flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 shadow-sm backdrop-blur-sm hover:text-brand ${isInWishlist ? 'text-brand' : 'text-muted-foreground'}`}
            aria-label="Wishlist"
          >
            <FiHeart className={`h-4 w-4 ${isInWishlist ? 'fill-brand' : ''}`} />
          </button>
        </div>

        {/* Zoom indicator — "hover to zoom" on mouse, persistent "tap to zoom" on touch */}
        {canHover && !isZooming ? (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
            <FiZoomIn className="h-3 w-3" /> Click to zoom
          </div>
        ) : !canHover ? (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] text-white">
            <FiZoomIn className="h-3 w-3" /> Tap to zoom
          </div>
        ) : null}

        {/* Image with hover zoom — click/tap opens the fullscreen viewer (with zoom out) */}
        <div
          className="h-full w-full overflow-hidden"
          style={{ cursor: isZooming ? 'crosshair' : 'zoom-in' }}
          onClick={() => setLightboxOpen(true)}
        >
          <ProductImage
            src={images.length ? images[selectedImage]?.image_url : product.primary_image}
            name={product.name}
            index={selectedImage}
            className="h-full w-full object-contain transition-transform duration-200 ease-out"
            style={isZooming && canHover ? {
              transform: 'scale(2)',
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
            } : undefined}
          />
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedImage((p) => (p > 0 ? p - 1 : images.length - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSelectedImage((p) => (p < images.length - 1 ? p + 1 : 0))}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 z-10 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
            {selectedImage + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedImage(idx)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-all ${
                selectedImage === idx
                  ? 'border-brand ring-1 ring-brand/20'
                  : 'border-transparent opacity-70 hover:border-muted-foreground/30 hover:opacity-100'
              }`}
            >
              <ProductImage src={img.image_url} name={product.name} index={idx} className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      {/* Share / Wishlist row — mobile only */}
      <div className="flex gap-2 lg:hidden">
        <button
          onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium hover:border-brand hover:text-brand"
        >
          <FiShare2 className="h-4 w-4" /> Share
        </button>
        <button
          onClick={handleWishlist}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium hover:border-brand hover:text-brand ${isInWishlist ? 'text-brand' : ''}`}
        >
          <FiHeart className={`h-4 w-4 ${isInWishlist ? 'fill-brand' : ''}`} /> {isInWishlist ? 'Wishlisted' : 'Wishlist'}
        </button>
      </div>
    </div>
  );

  /* ─── MIDDLE COLUMN: Product Details (scrollable) ─── */
  const DetailsColumn = () => (
    <div className="space-y-6">
      {/* Brand + Title + Rating */}
      <div>
        {(product.brand_detail || product.brand_name) && (
          <p className="text-sm text-muted-foreground hover:text-brand cursor-pointer">{product.brand_detail?.name || product.brand_name}</p>
        )}
        <h1 className="text-xl font-bold leading-snug sm:text-2xl">{product.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          {product.average_rating && parseFloat(product.average_rating) > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-success px-1.5 py-0.5 text-xs font-semibold text-white">
              {parseFloat(product.average_rating).toFixed(1)} <FiStar className="h-3 w-3 fill-white" />
            </span>
          )}
          {product.total_reviews ? <span className="text-muted-foreground">{product.total_reviews} ratings</span> : null}
          {product.sku && <span className="text-muted-foreground">SKU: {product.sku}</span>}
          <span className="inline-flex items-center gap-1 text-success"><FiCheckCircle className="h-3.5 w-3.5" /> Verified Product</span>
        </div>
      </div>

      {/* Price — mobile only (desktop shows in buy box) */}
      <div className="border-y py-4 lg:hidden"><PriceDisplay /></div>

      {/* Seller comparison */}
      {sellers.length > 1 && (
        <div>
          <h2 className="mb-3 text-base font-bold">Compare {sellers.length} Sellers</h2>
          <div className="space-y-2">
            {sellers.map((s, i) => {
              const sel = active?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSeller(s.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors ${sel ? 'border-brand bg-accent' : 'hover:border-brand/40'}`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{s.seller_name || 'Seller'}</span>
                      {i === 0 && <Badge className="bg-success text-white text-[10px]">Best Price</Badge>}
                      {s.seller_rating && parseFloat(s.seller_rating) > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-success px-1 text-[10px] font-semibold text-white">
                          {parseFloat(s.seller_rating).toFixed(1)} <FiStar className="h-2.5 w-2.5 fill-white" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">MOQ {s.minimum_order_quantity} · {s.delivery_time_days} days · GST {s.tax_rate}%</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-bold text-brand">{formatCurrency(s.selling_price)}</p>
                    <span className={`text-[11px] ${sel ? 'font-semibold text-brand' : 'text-muted-foreground'}`}>{sel ? 'Selected' : 'Select'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bulk pricing */}
      {tiers.length > 0 && (
        <WholesaleTierDisplay
          tiers={tiers}
          sellerName={active?.seller_name || ''}
          currentQuantity={quantity}
        />
      )}

      {/* Product Info Section: Features, Specifications, Description */}
      <ProductInfoSection product={product} />

      {/* Downloads */}
      {documents.length > 0 && (
        <div>
          <h2 className="mb-2 text-base font-bold">Downloads</h2>
          <ul className="space-y-1.5">
            {documents.map((doc) => (
              <li key={doc.id}>
                <a href={(doc as any).file_url || doc.file} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-brand hover:underline">
                  <FiFileText className="h-4 w-4" /> {doc.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  /* ─── RIGHT COLUMN: Buy Box (sticky) ─── */
  const BuyBoxColumn = () => (
    <div className="space-y-3">
      <Card className="shadow-card">
        <CardContent className="space-y-4 p-4">
          {/* Price — desktop only */}
          <div className="hidden lg:block"><PriceDisplay size="sm" /></div>

          {/* Quantity */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Quantity</span>
            <div className="flex items-center rounded-md border">
              <button
                onClick={() => setQuantity(Math.max(moq, quantity - 1))}
                disabled={quantity <= moq}
                className="min-h-[44px] min-w-[44px] p-2 transition-colors hover:bg-muted disabled:opacity-50"
              >
                <FiMinus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => (availableStock > 0 ? Math.min(availableStock, q + 1) : q + 1))}
                disabled={availableStock > 0 && quantity >= availableStock}
                className="min-h-[44px] min-w-[44px] p-2 transition-colors hover:bg-muted disabled:opacity-50"
              >
                <FiPlus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* MOQ + Stock */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{active ? `MOQ: ${active.minimum_order_quantity}` : 'MOQ: 1'}</span>
            <span className={availableStock > 0 ? 'font-medium text-success' : 'text-destructive'}>
              {availableStock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-action py-2.5 text-sm font-semibold text-action-foreground transition-colors hover:bg-action-dark"
            >
              <FiShoppingCart className="h-4 w-4" /> ADD TO CART
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full rounded-md bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              BUY NOW
            </button>
          </div>

          {/* Bulk Quote + Contact */}
          <div className="flex gap-2">
            <button
              onClick={() => toast.success('Bulk quote request noted — our team will reach out')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border py-2 text-xs font-medium transition-colors hover:border-brand hover:text-brand"
            >
              <FiZap className="h-3.5 w-3.5" /> Bulk Quote
            </button>
            <button
              onClick={() => toast.success('Seller will be notified')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border py-2 text-xs font-medium transition-colors hover:border-brand hover:text-brand"
            >
              <FiMessageSquare className="h-3.5 w-3.5" /> Contact
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Delivery */}
      <Card className="bg-amber-50/60">
        <CardContent className="p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <FiMapPin className="h-4 w-4 text-brand" /> Deliver to
          </p>
          {selectedAddress ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">{selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}</p>
              {active?.delivery_time_days && (
                <p className="flex items-center gap-1 text-xs text-success">
                  <FiTruck className="h-3.5 w-3.5" /> Estimated delivery in ~{active.delivery_time_days} days
                </p>
              )}
              <button onClick={openAddressModal} className="text-xs font-semibold text-brand hover:underline">Change location</button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setPinChecked(false); }}
                  placeholder="Enter pincode"
                  className="h-9 bg-white"
                />
                <Button size="sm" variant="outline" onClick={checkPincode}>Check</Button>
              </div>
              {pinChecked && (
                <p className="flex items-center gap-1 text-xs text-success">
                  <FiTruck className="h-3.5 w-3.5" /> Deliverable{active ? ` in ~${active.delivery_time_days} days` : ''}
                </p>
              )}
              <button onClick={openAddressModal} className="text-xs font-semibold text-brand hover:underline">Set delivery location</button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seller info */}
      {active && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Sold by</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{active.seller_name}</span>
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <FiCheckCircle className="h-3.5 w-3.5" /> Verified
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust badges */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: FiShield, label: 'Money Back Guarantee' },
          { icon: FiCheck, label: 'Genuine Product' },
          { icon: FiRefreshCw, label: 'Easy Return' },
          { icon: FiLock, label: 'Secure Payment' },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-1.5 rounded-lg border p-2 text-[11px]">
            <b.icon className="h-4 w-4 flex-shrink-0 text-brand" /> {b.label}
          </div>
        ))}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════
     MOBILE LAYOUT (< lg) — single column, natural scroll, no sticky
     ═══════════════════════════════════════════════════════════════════ */
  const MobileLayout = () => (
    <div className="space-y-0">
      {/* 1. Gallery */}
      <GalleryColumn />

      {/* 2. Buy Box — inline, not sticky */}
      <div className="mt-4 border-t pt-4 lg:hidden">
        <BuyBoxColumn />
      </div>

      {/* 3. Details — all scrollable content */}
      <div className="mt-6 space-y-6 border-t pt-6">
        <DetailsColumn />
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════
     DESKTOP LAYOUT (≥ lg) — 3-column grid, sticky gallery + buy box
     ═══════════════════════════════════════════════════════════════════ */
  const DesktopLayout = () => (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
      {/* LEFT: Image Gallery — sticky */}
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-[130px] lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto">
          <GalleryColumn />
        </div>
      </div>

      {/* CENTER: Scrollable product info */}
      <div className="min-w-0 lg:col-span-5">
        <DetailsColumn />
      </div>

      {/* RIGHT: Buy Box — sticky */}
      <div className="lg:col-span-3">
        <div className="lg:sticky lg:top-[130px] lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto">
          <BuyBoxColumn />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 lg:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 overflow-x-auto text-xs text-muted-foreground sm:text-sm">
        <Link to="/" className="whitespace-nowrap hover:text-brand">Home</Link>
        <FiChevronRight className="h-3 w-3" />
        <Link to="/products" className="whitespace-nowrap hover:text-brand">Products</Link>
        {(product.category_detail || product.category_name) && (
          <>
            <FiChevronRight className="h-3 w-3" />
            <Link to={`/products?category=${product.category}`} className="whitespace-nowrap hover:text-brand">
              {product.category_detail?.name || product.category_name}
            </Link>
          </>
        )}
        <FiChevronRight className="h-3 w-3" />
        <span className="truncate font-medium text-foreground">{product.name}</span>
      </nav>

      {/* Mobile layout */}
      <div className="lg:hidden">
        <MobileLayout />
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:block">
        <DesktopLayout />
      </div>

      {/* You May Also Like — full width, responsive */}
      {relatedProducts.length > 0 && (
        <section className="mt-8 sm:mt-10 lg:mt-12">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold sm:text-xl">You May Also Like</h2>
            <Link to={`/products?category=${product.category}`} className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-brand hover:underline">
              View all <FiChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Fullscreen image viewer with zoom in / out / reset (opened by tapping the image) */}
      {lightboxOpen && (
        <ImageLightbox
          images={images.length ? images.map((i) => ({ url: i.image_url })) : [{ url: product.primary_image }]}
          index={selectedImage}
          onIndexChange={setSelectedImage}
          onClose={() => setLightboxOpen(false)}
          productName={product.name}
        />
      )}
    </div>
  );
}
