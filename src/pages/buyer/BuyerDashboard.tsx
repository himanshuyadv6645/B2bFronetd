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
import { FiShoppingCart, FiCreditCard, FiPackage, FiHeart, FiArrowRight, FiSearch } from 'react-icons/fi';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['buyer-dashboard'],
    queryFn: () => dashboardService.getBuyerDashboard(),
  });

  if (isLoading) return <PageLoading />;

  const firstName = (user?.full_name || 'there').split(' ')[0];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome banner */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand-dark via-brand to-brand-light p-5 text-white sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Welcome back, {firstName} 👋</h1>
            <p className="mt-1 text-sm text-white/80">Here's what's happening with your purchases today.</p>
          </div>
          <Link to="/products">
            <Button size="lg" className="bg-white text-brand-dark hover:bg-white/90">
              <FiSearch className="mr-2 h-4 w-4" /> Browse Products
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Total Orders" value={dashboard?.total_orders || 0} tone="blue" icon={<FiShoppingCart className="h-5 w-5" />} />
        <StatCard title="Total Spent" value={formatCurrency(dashboard?.total_spent || '0')} tone="green" icon={<FiCreditCard className="h-5 w-5" />} />
        <StatCard title="Pending Orders" value={dashboard?.pending_orders || 0} tone="amber" icon={<FiPackage className="h-5 w-5" />} />
        <StatCard title="Wishlist" value={dashboard?.wishlist_count || 0} tone="red" icon={<FiHeart className="h-5 w-5" />} />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base sm:text-lg">Recent Orders</CardTitle>
            <Link to="/buyer/orders">
              <Button variant="ghost" size="sm" className="text-brand">View All <FiArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!dashboard?.recent_orders || dashboard.recent_orders.length === 0 ? (
              <EmptyState
                icon={<FiShoppingCart className="h-8 w-8 text-muted-foreground" />}
                title="No orders yet"
                description="Start shopping to see your orders here"
                action={{ label: 'Browse Products', href: '/products' }}
              />
            ) : (
              <div className="divide-y">
                {dashboard.recent_orders.map((order) => (
                  <Link
                    key={order.id}
                    to="/buyer/orders"
                    className="-mx-2 flex items-center justify-between gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <FiPackage className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
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

        {/* Quick actions side panel */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Browse Products', desc: 'Explore the catalog', href: '/products', icon: FiPackage, tone: 'bg-blue-50 text-blue-600' },
              { label: 'My Cart', desc: 'Review & checkout', href: '/buyer/cart', icon: FiShoppingCart, tone: 'bg-green-50 text-green-600' },
              { label: 'Wishlist', desc: 'Saved for later', href: '/buyer/wishlist', icon: FiHeart, tone: 'bg-red-50 text-red-600' },
              { label: 'My Orders', desc: 'Track your orders', href: '/buyer/orders', icon: FiCreditCard, tone: 'bg-violet-50 text-violet-600' },
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
  );
}
