import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/common/EmptyState';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { ProductImage } from '@/components/common/ProductImage';
import { OrderStatusStepper } from '@/components/common/OrderStatusStepper';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiX, FiChevronDown, FiChevronUp, FiPackage, FiStar } from 'react-icons/fi';
import { useState } from 'react';
import { ReviewModal } from '@/components/reviews/ReviewModal';

export default function BuyerOrdersPage() {
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  const [reviewState, setReviewState] = useState<{
    open: boolean;
    type: 'product' | 'seller';
    targetId: string;
    orderItemId?: string;
    orderId?: string;
    variantId?: string;
    itemName: string;
  }>({
    open: false,
    type: 'product',
    targetId: '',
    itemName: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['buyer-orders'],
    queryFn: () => orderService.getOrders({ page_size: 50 }),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ orderNumber, reason }: { orderNumber: string; reason: string }) => orderService.cancelOrder(orderNumber, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
      toast.success('Order cancelled');
      setCancellingId(null);
      setCancelReason('');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to cancel order';
      toast.error(message);
    },
  });

  if (isLoading) return <PageLoading />;

  const orders = data?.results || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">My Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FiShoppingCart className="h-8 w-8 text-muted-foreground" />}
              title="No orders yet"
              description="You haven't placed any orders. Browse products to get started!"
              action={{ label: 'Browse Products', href: '/products' }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order) => {
            const cancelled = ['cancelled', 'refunded', 'returned'].includes(order.status);
            const expanded = expandedOrder === order.id;
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  {/* Header */}
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <FiPackage className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold sm:text-base">{order.order_number}</p>
                          <Badge className={`${getStatusColor(order.status)} text-[10px] capitalize`}>{order.status}</Badge>
                          <Badge variant="outline" className="text-[10px] capitalize">{order.payment_status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(order.created_at)} · {order.item_count} item{order.item_count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <p className="text-lg font-bold sm:text-xl">{formatCurrency(order.total_amount)}</p>
                      {order.status === 'pending' && (
                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => setCancellingId(cancellingId === order.id ? null : order.id)}>
                          <FiX className="mr-1 h-4 w-4" /> Cancel
                        </Button>
                      )}
                      {order.status === 'delivered' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-1"
                          onClick={() => setReviewState({
                            open: true,
                            type: 'seller',
                            targetId: order.items?.[0]?.seller || '',
                            orderId: order.id,
                            itemName: order.items?.[0]?.seller_name || 'Seller',
                          })}
                        >
                          <FiStar className="mr-1 h-3.5 w-3.5" /> Rate Seller
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  {cancelled ? (
                    <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                      Order {order.status}{order.cancellation_reason ? ` · ${order.cancellation_reason}` : ''}
                    </div>
                  ) : (
                    <OrderStatusStepper status={order.status} />
                  )}

                  {/* Cancel form */}
                  {cancellingId === order.id && (
                    <div className="mt-3 flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 sm:flex-row">
                      <Input placeholder="Reason for cancellation..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="flex-1" />
                      <Button size="sm" variant="destructive" onClick={() => cancelMutation.mutate({ orderNumber: order.order_number, reason: cancelReason })} disabled={!cancelReason.trim()} isLoading={cancelMutation.isPending}>
                        Confirm Cancel
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setCancellingId(null); setCancelReason(''); }}>Keep</Button>
                    </div>
                  )}

                  {/* Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <button onClick={() => setExpandedOrder(expanded ? null : order.id)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">
                        {expanded ? <FiChevronUp className="h-3.5 w-3.5" /> : <FiChevronDown className="h-3.5 w-3.5" />}
                        {expanded ? 'Hide' : 'View'} {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </button>
                      {expanded && (
                        <div className="mt-2 space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg bg-muted/30 p-2">
                              <div className="flex flex-1 items-center gap-3">
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                                  <ProductImage src={item.product_image || item.variant_detail?.image} name={item.product_name || item.variant_name || 'Product'} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium">{item.product_name || item.variant_detail?.product?.name || 'Product'}</p>
                                  <p className="text-xs text-muted-foreground">{item.seller_name} · Qty {item.quantity} × {formatCurrency(item.unit_price)}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 px-2 sm:px-0">
                                <p className="text-sm font-semibold">{formatCurrency(item.total_price)}</p>
                                {order.status === 'delivered' && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 px-2 text-xs text-brand hover:bg-brand/10"
                                    onClick={() => setReviewState({
                                      open: true,
                                      type: 'product',
                                      targetId: item.variant_detail?.product?.id || '',
                                      orderItemId: item.id,
                                      variantId: item.variant,
                                      itemName: item.product_name || 'Product',
                                    })}
                                  >
                                    Write Review
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {reviewState.open && (
        <ReviewModal
          open={reviewState.open}
          onClose={() => setReviewState(prev => ({ ...prev, open: false }))}
          type={reviewState.type}
          targetId={reviewState.targetId}
          orderItemId={reviewState.orderItemId}
          orderId={reviewState.orderId}
          variantId={reviewState.variantId}
          itemName={reviewState.itemName}
        />
      )}
    </div>
  );
}
