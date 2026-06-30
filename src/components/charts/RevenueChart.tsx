import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

interface RevenueChartProps {
  data: Array<{ date: string; revenue: string; orders: number }>;
  title?: string;
}

export function RevenueChart({ data, title = 'Revenue Overview' }: RevenueChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: parseFloat(item.revenue) || 0,
    orders: item.orders,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e5e5',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
                formatter={(value, name) =>
                  name === 'revenue' ? formatCurrency(Number(value)) : value
                }
              />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="orders" name="Orders" fill="#818CF8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
