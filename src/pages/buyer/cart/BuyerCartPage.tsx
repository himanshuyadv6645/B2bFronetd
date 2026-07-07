import { useCart } from '@/hooks/useCart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { ProductImage } from '@/components/common/ProductImage';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useAddress } from '@/contexts/AddressContext';
import { useAuthRedirect } from '@/contexts/AuthRedirectContext';
import { PendingAction } from '@/types/auth-redirect';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { buyerService } from '@/services/buyer.service';
import { orderService } from '@/services/order.service';
import { analyticsService } from '@/services/analytics.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight, FiArrowLeft, FiCreditCard, FiMapPin, FiCheck } from 'react-icons/fi';
import type { CartItem } from '@/types/cart';

export default function BuyerCartPage() {
  const { cart, updateItem, removeItem, clearCart, isUpdating, isRemoving } = useCart();
  const { requireAuth } = useRequireAuth();
  const { isAuthenticated } = useAuth();
  const { getAndClearPendingAction } = useAuthRedirect();
  const { selectedAddress } = useAddress();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>('');
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string>('');

  const { data: addresses = [] } = useQuery({
    queryKey: ['buyer', 'addresses'],
    queryFn: () => buyerService.getAddresses(),
    enabled: isAuthenticated && showCheckout,
  });

  const checkoutMutation = useMutation({
    mutationFn: () => {
      // Track that the user actually initiated payment/order placement. Pairing
      // this with checkout_started lets us detect abandoned checkouts (started
      // but never placed).
      analyticsService.paymentInitiated({
        itemCount: cart?.total_items ?? cart?.items?.length ?? 0,
        total: cart?.total_amount,
        payment_method: 'cod',
      });
      return orderService.createOrder({
        shipping_address: selectedShippingAddress,
        billing_address: selectedBillingAddress || selectedShippingAddress,
        payment_method: 'cod',
      });
    },
    onSuccess: (order: any) => {
      // Mark the checkout as completed so abandoned-cart/payment detection
      // does NOT flag this user (they finished the order).
      analyticsService.track('order_placed', 'order', order?.id, {
        total: cart?.total_amount,
      });
      toast.success('Order placed successfully!');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate('/buyer/orders');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
      // If the cart was updated by the backend (e.g. price change), refetch it
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Track that the user entered the checkout/payment step. Fires once each time
  // the checkout view opens (drives abandoned-checkout detection).
  useEffect(() => {
    if (!showCheckout) return;
    analyticsService.checkoutStarted({
      itemCount: cart?.total_items ?? cart?.items?.length ?? 0,
      total: cart?.total_amount,
    });
  }, [showCheckout, cart?.items?.length, cart?.total_items, cart?.total_amount]);

  // Auto-open checkout if redirected after login with CHECKOUT pending action
  useEffect(() => {
    const pendingAction = getAndClearPendingAction();
    if (pendingAction?.action === PendingAction.CHECKOUT && (cart?.items?.length ?? 0) > 0) {
      setShowCheckout(true);
    }
  }, [getAndClearPendingAction, cart?.items?.length]);

  // Prefill address from global selected address when entering checkout
  useEffect(() => {
    if (showCheckout && selectedAddress && !selectedShippingAddress) {
      setSelectedShippingAddress(selectedAddress.id);
      setSelectedBillingAddress(selectedAddress.id);
    }
  }, [showCheckout, selectedAddress, selectedShippingAddress]);

  // Also prefill when addresses load from API
  useEffect(() => {
    if (showCheckout && addresses.length > 0 && !selectedShippingAddress) {
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
      if (defaultAddr) {
        setSelectedShippingAddress(defaultAddr.id);
        setSelectedBillingAddress(defaultAddr.id);
      }
    }
  }, [showCheckout, addresses, selectedShippingAddress]);

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
        <h1 className="text-xl font-bold sm:text-2xl">Shopping Cart</h1>
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FiShoppingBag className="h-8 w-8 text-muted-foreground" />}
              title="Your cart is empty"
              description="Browse the marketplace and add products to get started"
              action={{ label: 'Browse Products', href: '/products' }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + parseFloat(item.total_price || '0'), 0);
  const itemCount = cart.items.length;

  // Group items by seller (B2B: one product can come from multiple sellers)
  const groups = cart.items.reduce<Record<string, { name: string; items: CartItem[] }>>((acc, item) => {
    const key = item.seller || item.seller_name || 'seller';
    if (!acc[key]) acc[key] = { name: item.seller_name || 'Seller', items: [] };
    acc[key].items.push(item);
    return acc;
  }, {});
  const sellerGroups = Object.values(groups);

  const shippingAddresses = Array.isArray(addresses) ? addresses.filter((a) => a.address_type === 'shipping' || a.is_default) : [];
  const billingAddresses = Array.isArray(addresses) ? addresses.filter((a) => a.address_type === 'billing' || a.is_default) : [];
  const allAddresses = [...shippingAddresses, ...billingAddresses.filter((a) => !shippingAddresses.find((s) => s.id === a.id))];

  const Summary = ({ cta }: { cta: React.ReactNode }) => (
    <Card className="lg:sticky lg:top-20">
      <CardHeader className="pb-3"><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Shipping</span>
          <span className="text-success">Free</span>
        </div>
        <p className="text-xs text-muted-foreground">Inclusive of all applicable taxes (GST)</p>
        <hr />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-brand">{formatCurrency(subtotal)}</span>
        </div>
        {cta}
      </CardContent>
    </Card>
  );

  // ---- Checkout view ----
  if (showCheckout) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6">
        <button onClick={() => setShowCheckout(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <FiArrowLeft className="h-4 w-4" /> Back to cart
        </button>
        <h1 className="text-xl font-bold sm:text-2xl">Checkout</h1>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><FiMapPin className="h-4 w-4 text-brand" /> Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {allAddresses.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-center">
                    <p className="mb-3 text-sm text-muted-foreground">No saved addresses yet.</p>
                    <Link to="/buyer/profile"><Button variant="outline" size="sm">Add an address</Button></Link>
                  </div>
                ) : (
                  allAddresses.map((addr) => {
                    const active = selectedShippingAddress === addr.id;
                    return (
                      <label key={addr.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${active ? 'border-brand bg-brand/5' : 'hover:bg-muted/50'}`}>
                        <input type="radio" name="shipping" value={addr.id} checked={active} onChange={() => { setSelectedShippingAddress(addr.id); if (!selectedBillingAddress) setSelectedBillingAddress(addr.id); }} className="mt-1 accent-brand" />
                        <div className="text-sm">
                          <p className="font-medium">{addr.label} <Badge variant="secondary" className="ml-1 text-[10px] capitalize">{addr.address_type}</Badge></p>
                          <p className="text-muted-foreground">{addr.contact_name}, {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                          <p className="text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                      </label>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><FiCreditCard className="h-4 w-4 text-brand" /> Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 rounded-lg border border-brand bg-brand/5 p-3">
                  <FiCheck className="h-5 w-5 text-brand" />
                  <div className="text-sm">
                    <p className="font-medium">Cash on Delivery (COD)</p>
                    <p className="text-muted-foreground">Pay when you receive your order</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Summary cta={
              <>
                <Button className="w-full" size="lg" disabled={!selectedShippingAddress || checkoutMutation.isPending} onClick={() => checkoutMutation.mutate()}>
                  {checkoutMutation.isPending ? 'Placing Order…' : 'Place Order'}
                </Button>
                {!selectedShippingAddress && allAddresses.length > 0 && <p className="text-center text-xs text-muted-foreground">Select a delivery address to continue</p>}
              </>
            } />
          </div>
        </div>
      </div>
    );
  }

  // ---- Cart view ----
  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-20 sm:space-y-6 sm:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Cart <span className="text-muted-foreground">({cart.items.length})</span></h1>
        <Button variant="ghost" onClick={() => clearCart()} size="sm" className="text-destructive hover:bg-destructive/10">Clear cart</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {sellerGroups.map((group, gi) => (
            <Card key={gi}>
              <div className="flex items-center gap-2 border-b px-4 py-2.5 text-sm">
                <FiShoppingBag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Sold by</span>
                <span className="font-medium">{group.name}</span>
              </div>
              <CardContent className="divide-y p-0">
                {group.items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 sm:gap-4 sm:p-4">
                    <Link to={item.variant_detail?.product?.slug ? `/products/${item.variant_detail.product.slug}` : '/products'} className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border bg-muted sm:h-20 sm:w-20">
                      <ProductImage src={item.variant_image || item.variant_detail?.image} name={item.variant_name || 'Product'} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-medium">{item.variant_detail?.product?.name || item.variant_name}</h3>
                      {item.variant_detail?.name && <p className="line-clamp-1 text-xs text-muted-foreground">{item.variant_detail.name}</p>}
                      <p className="mt-1 text-sm font-bold text-brand">{formatCurrency(item.unit_price)} <span className="text-xs font-normal text-muted-foreground">/ unit</span></p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center rounded-md border">
                          <button onClick={() => updateItem({ itemId: item.id, quantity: item.quantity - 1 })} disabled={item.quantity <= 1 || isUpdating} className="min-h-[44px] min-w-[44px] p-2 transition-colors hover:bg-muted disabled:opacity-50"><FiMinus className="h-4 w-4" /></button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateItem({ itemId: item.id, quantity: item.quantity + 1 })} disabled={isUpdating} className="min-h-[44px] min-w-[44px] p-2 transition-colors hover:bg-muted disabled:opacity-50"><FiPlus className="h-4 w-4" /></button>
                        </div>
                        <button onClick={() => removeItem(item.id)} disabled={isRemoving} className="flex min-h-[44px] items-center gap-1 rounded px-2 text-xs text-muted-foreground transition-colors hover:text-destructive">
                          <FiTrash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-bold sm:text-base">{formatCurrency(item.total_price)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Summary cta={
            <>
              <Button className="w-full" size="lg" onClick={() => {
                if (!requireAuth('checkout', { action: PendingAction.CHECKOUT })) return;
                setShowCheckout(true);
              }}>
                Proceed to Checkout <FiArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link to="/products" className="block"><Button variant="outline" className="w-full">Continue Shopping</Button></Link>
            </>
          } />
        </div>
      </div>

      {/* Fixed mobile checkout bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white p-3 shadow-lg sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-muted-foreground">Total ({cart.items.length} items)</p>
            <p className="text-lg font-bold text-brand">{formatCurrency(subtotal)}</p>
          </div>
          <Button
            size="lg"
            onClick={() => {
              if (!requireAuth('checkout', { action: PendingAction.CHECKOUT })) return;
              setShowCheckout(true);
            }}
            className="flex-1"
          >
            Checkout <FiArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
