import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardService } from '@/services/dashboard.service';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { FiPackage, FiDollarSign, FiShoppingCart, FiUsers, FiAlertTriangle, FiArrowRight, FiPlus, FiTag, FiTruck } from 'react-icons/fi';

export default function SellerDashboard() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['seller-dashboard'],
    queryFn: () => dashboardService.getSellerDashboard(),
  });

  if (isLoading) return <PageLoading />;

  const firstName = (user?.full_name || 'Seller').split(' ')[0];
  const lowStock = dashboard?.low_stock_products || [];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome banner */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand-dark via-brand to-brand-light p-5 text-white sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Welcome back, {firstName} 👋</h1>
            <p className="mt-1 text-sm text-white/80">Here's how your store is performing.</p>
          </div>
          <Link to="/seller/pricing">
            <Button size="lg" className="bg-white text-brand-dark hover:bg-white/90">
              <FiPlus className="mr-2 h-4 w-4" /> List a Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Products" value={dashboard?.total_products || 0} subtitle={`${dashboard?.active_products || 0} active`} tone="blue" icon={<FiPackage className="h-5 w-5" />} />
        <StatCard title="Revenue" value={formatCurrency(dashboard?.total_revenue || '0')} subtitle={`${formatCurrency(dashboard?.pending_revenue || '0')} pending`} tone="green" icon={<FiDollarSign className="h-5 w-5" />} />
        <StatCard title="Orders" value={dashboard?.total_orders || 0} subtitle={`${dashboard?.pending_orders || 0} pending`} tone="amber" icon={<FiShoppingCart className="h-5 w-5" />} />
        <StatCard title="Customers" value={dashboard?.total_customers || 0} subtitle={`${dashboard?.new_customers_today || 0} new today`} tone="violet" icon={<FiUsers className="h-5 w-5" />} />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base sm:text-lg">Recent Orders</CardTitle>
            <Link to="/seller/orders">
              <Button variant="ghost" size="sm" className="text-brand">View All <FiArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!dashboard?.recent_orders || dashboard.recent_orders.length === 0 ? (
              <EmptyState
                icon={<FiShoppingCart className="h-8 w-8 text-muted-foreground" />}
                title="No orders yet"
                description="Orders from buyers will appear here"
              />
            ) : (
              <div className="divide-y">
                {dashboard.recent_orders.map((order) => (
                  <Link key={order.id} to="/seller/orders" className="-mx-2 flex items-center justify-between gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <FiShoppingCart className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{order.order_number}</p>
                        <p className="truncate text-xs text-muted-foreground">{order.buyer_name} · {formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-bold">{formatCurrency(order.total_amount)}</p>
                      <Badge className={`${getStatusColor(order.status)} text-[10px] capitalize`}>{order.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Side: low stock + quick actions */}
        <div className="space-y-4 sm:space-y-6">
          {lowStock.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-amber-700">
                  <FiAlertTriangle className="h-5 w-5" /> Low Stock ({lowStock.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {lowStock.slice(0, 5).map((product) => (
                  <Link key={product.id} to="/seller/inventory" className="flex items-center justify-between gap-2 rounded-lg border border-amber-100 bg-white p-2.5 transition-colors hover:border-amber-300">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{product.name}</span>
                    <Badge variant="destructive" className="flex-shrink-0 text-[10px]">{product.current_stock} left</Badge>
                  </Link>
                ))}
                <Link to="/seller/inventory" className="block pt-1 text-center text-xs font-medium text-amber-700 hover:underline">Manage inventory →</Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Products', desc: 'Your listings', href: '/seller/products', icon: FiPackage, tone: 'bg-blue-50 text-blue-600' },
                { label: 'Pricing', desc: 'Prices & tiers', href: '/seller/pricing', icon: FiTag, tone: 'bg-green-50 text-green-600' },
                { label: 'Inventory', desc: 'Stock levels', href: '/seller/inventory', icon: FiTruck, tone: 'bg-violet-50 text-violet-600' },
                { label: 'Orders', desc: 'Fulfil orders', href: '/seller/orders', icon: FiShoppingCart, tone: 'bg-amber-50 text-amber-600' },
              ].map((a) => (
                <Link key={a.href} to={a.href} className="group flex items-center gap-3 rounded-lg border p-3 transition-all hover:border-brand/40 hover:bg-muted/40">
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${a.tone}`}><a.icon className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium transition-colors group-hover:text-brand">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                  <FiArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
