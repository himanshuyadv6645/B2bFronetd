import { Outlet } from 'react-router-dom';
import { CategoryBar } from '@/components/layout/CategoryBar';

/**
 * Marketplace layout — wraps shopping pages (home, products, categories, search)
 * with the horizontal CategoryBar navigation.
 *
 * This layout is rendered INSIDE PublicLayout, so the header (logo, search,
 * actions) and footer are already provided by PublicLayout.
 *
 * Buyer dashboard pages use PublicLayout directly (without this wrapper),
 * so they never see the CategoryBar.
 * Seller/Admin pages use DashboardLayout (sidebar-based, no CategoryBar).
 */
export function MarketplaceLayout() {
  return (
    <>
      {/* Category navigation — only on shopping pages */}
      <CategoryBar />

      {/* Page content */}
      <Outlet />
    </>
  );
}
