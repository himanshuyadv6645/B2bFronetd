import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { StatCard } from '@/components/common/StatCard';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { StatusChart } from '@/components/charts/StatusChart';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { FiDollarSign, FiShoppingCart, FiUsers, FiPackage } from 'react-icons/fi';

export default function AdminAnalyticsPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => dashboardService.getAdminDashboard(),
  });

  if (isLoading) return <PageLoading />;

  const userStatusData = [
    { name: 'Buyers', value: dashboard?.total_buyers || 0, color: '#3b82f6' },
    { name: 'Sellers', value: dashboard?.active_sellers || 0, color: '#22c55e' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Analytics</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(dashboard?.total_revenue || '0')}
          subtitle={`Month: ${formatCurrency(dashboard?.revenue_this_month || '0')}`}
          icon={<FiDollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Orders"
          value={dashboard?.total_orders || 0}
          icon={<FiShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />}
        />
        <StatCard
          title="Total Users"
          value={dashboard?.total_users || 0}
          subtitle={`${dashboard?.new_users_today || 0} new today`}
          icon={<FiUsers className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        />
        <StatCard
          title="Products"
          value={dashboard?.total_products || 0}
          subtitle={`${dashboard?.active_products || 0} active`}
          icon={<FiPackage className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {dashboard?.revenue_chart && dashboard.revenue_chart.length > 0 && (
          <RevenueChart data={dashboard.revenue_chart} title="Revenue Trend" />
        )}
        <StatusChart data={userStatusData} title="User Distribution" />
      </div>
    </div>
  );
}
