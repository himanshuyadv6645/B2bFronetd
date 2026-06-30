import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardService } from '@/services/dashboard.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/common/StatCard';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import { FiUsers, FiDollarSign, FiShoppingCart, FiPackage, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => dashboardService.getAdminDashboard(),
  });

  if (isLoading) return <PageLoading />;

  const recentOrders = dashboard?.recent_orders || [];
  const topSellers = dashboard?.top_sellers || [];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview and operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Total Users" value={dashboard?.total_users || 0} subtitle={`${dashboard?.total_buyers || 0} buyers · ${dashboard?.total_sellers || 0} sellers`} tone="blue" icon={<FiUsers className="h-5 w-5" />} />
        <StatCard title="Revenue" value={formatCurrency(dashboard?.total_revenue || '0')} subtitle={`Today: ${formatCurrency(dashboard?.revenue_today || '0')}`} tone="green" icon={<FiDollarSign className="h-5 w-5" />} />
        <StatCard title="Orders" value={dashboard?.total_orders || 0} subtitle={`${dashboard?.orders_today || 0} today`} tone="amber" icon={<FiShoppingCart className="h-5 w-5" />} />
        <StatCard title="Products" value={dashboard?.total_products || 0} subtitle={`${dashboard?.active_products || 0} active`} tone="violet" icon={<FiPackage className="h-5 w-5" />} />
      </div>

      {/* Pending Approvals */}
      {dashboard?.pending_seller_approvals && dashboard.pending_seller_approvals > 0 ? (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <FiCheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{dashboard.pending_seller_approvals} seller approval{dashboard.pending_seller_approvals !== 1 ? 's' : ''} pending</p>
                  <p className="text-xs text-muted-foreground">Review and approve new seller registrations</p>
                </div>
              </div>
              <Link to="/admin/approvals"><Button size="sm">Review Now</Button></Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Revenue Chart */}
      {dashboard?.revenue_chart && dashboard.revenue_chart.length > 0 && (
        <RevenueChart data={dashboard.revenue_chart} title="Revenue Overview" />
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Recent Orders</CardTitle></CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No orders yet</p>
            ) : (
              <div className="divide-y">
                {recentOrders.slice(0, 6).map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <FiShoppingCart className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{order.order_number}</p>
                        <p className="truncate text-xs text-muted-foreground">{order.buyer_name} → {order.seller_name}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-bold">{formatCurrency(order.total_amount)}</p>
                      <Badge className={`${getStatusColor(order.status)} text-[10px] capitalize`}>{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Sellers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Top Sellers</CardTitle>
            <Link to="/admin/users"><Button variant="ghost" size="sm" className="text-brand">All users <FiArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          </CardHeader>
          <CardContent>
            {topSellers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No seller data yet</p>
            ) : (
              <div className="divide-y">
                {topSellers.slice(0, 6).map((seller, i) => (
                  <div key={seller.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-brand text-white' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{seller.company_name}</p>
                        <p className="text-xs text-muted-foreground">{seller.total_orders} orders</p>
                      </div>
                    </div>
                    <p className="flex-shrink-0 text-sm font-bold">{formatCurrency(seller.total_revenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
