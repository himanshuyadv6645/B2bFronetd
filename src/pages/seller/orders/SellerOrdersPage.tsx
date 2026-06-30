import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { OrderStatusStepper } from '@/components/common/OrderStatusStepper';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import { FiSearch, FiShoppingCart, FiCheck, FiTruck, FiPackage } from 'react-icons/fi';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function SellerOrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['seller-orders', search, statusFilter],
    queryFn: () => orderService.getSellerOrders({ search, status: statusFilter, page_size: 50 }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['seller-orders'] });

  const shipMutation = useMutation({
    mutationFn: (id: string) => orderService.shipSellerOrder(id, {}),
    onSuccess: () => { invalidate(); toast.success('Order marked shipped'); },
    onError: () => toast.error('Failed to ship order'),
  });

  const deliverMutation = useMutation({
    mutationFn: (id: string) => orderService.deliverSellerOrder(id),
    onSuccess: () => { invalidate(); toast.success('Order marked delivered'); },
    onError: () => toast.error('Failed to deliver order'),
  });

  if (isLoading) return <PageLoading />;

  const orders = data?.results || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Orders</h1>
        <p className="text-sm text-muted-foreground">{data?.count || 0} orders total</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-md flex-1">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FiShoppingCart className="h-8 w-8 text-muted-foreground" />}
              title="No orders found"
              description={search || statusFilter ? 'Try different filters' : 'Orders from buyers will appear here'}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order) => {
            const cancelled = ['cancelled', 'refunded', 'returned'].includes(order.status);
            return (
              <Card key={order.id}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <FiPackage className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold sm:text-base">{order.order_detail?.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}</p>
                          <Badge className={`${getStatusColor(order.status)} text-[10px] capitalize`}>{order.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {order.buyer_name ? `${order.buyer_name} · ` : ''}{formatDate(order.created_at)}
                          {order.tracking_number ? ` · Tracking: ${order.tracking_number}` : ''}
                        </p>
                        {order.notes && <p className="mt-1 text-xs text-muted-foreground">Note: {order.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <p className="text-lg font-bold sm:text-xl">{formatCurrency(order.total_amount)}</p>
                      <div className="flex gap-2">
                        {(order.status === 'confirmed' || order.status === 'processing') && (
                          <Button size="sm" onClick={() => shipMutation.mutate(order.id)} isLoading={shipMutation.isPending}>
                            <FiTruck className="mr-1 h-4 w-4" /> Ship
                          </Button>
                        )}
                        {order.status === 'shipped' && (
                          <Button size="sm" onClick={() => deliverMutation.mutate(order.id)} isLoading={deliverMutation.isPending}>
                            <FiCheck className="mr-1 h-4 w-4" /> Mark Delivered
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {cancelled ? (
                    <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive capitalize">Order {order.status}</div>
                  ) : (
                    <OrderStatusStepper status={order.status} />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
