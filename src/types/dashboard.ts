export interface BuyerDashboard {
  total_orders: number;
  total_spent: string;
  average_order_value: string;
  pending_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  wishlist_count: number;
  recent_orders: Array<{
    id: string;
    order_number: string;
    status: string;
    total_amount: string;
    created_at: string;
  }>;
  top_sellers: Array<{
    id: string;
    company_name: string;
    total_orders: number;
    total_spent: string;
  }>;
}

export interface SellerDashboard {
  total_products: number;
  active_products: number;
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  total_revenue: string;
  pending_revenue: string;
  average_order_value: string;
  total_customers: number;
  new_customers_today: number;
  recent_orders: Array<{
    id: string;
    order_number: string;
    buyer_name: string;
    status: string;
    total_amount: string;
    created_at: string;
  }>;
  top_products: Array<{
    id: string;
    name: string;
    total_sold: number;
    total_revenue: string;
  }>;
  low_stock_products: Array<{
    id: string;
    name: string;
    current_stock: number;
    threshold: number;
  }>;
}

export interface AdminDashboard {
  total_users: number;
  total_buyers: number;
  total_sellers: number;
  pending_seller_approvals: number;
  active_sellers: number;
  total_products: number;
  active_products: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: string;
  revenue_today: string;
  revenue_this_month: string;
  revenue_this_year: string;
  recent_orders: Array<{
    id: string;
    order_number: string;
    buyer_name: string;
    seller_name: string;
    status: string;
    total_amount: string;
    created_at: string;
  }>;
  new_users_today: number;
  orders_today: number;
  revenue_chart: Array<{
    date: string;
    revenue: string;
    orders: number;
  }>;
  top_sellers: Array<{
    id: string;
    company_name: string;
    total_revenue: string;
    total_orders: number;
  }>;
}
