import { Outlet, NavLink } from 'react-router-dom';

const tabs = [
  { to: '/buyer/dashboard', label: 'Dashboard' },
  { to: '/buyer/orders', label: 'Orders' },
  { to: '/buyer/cart', label: 'Cart' },
  { to: '/buyer/wishlist', label: 'Wishlist' },
  { to: '/buyer/profile', label: 'Profile' },
  { to: '/buyer/notifications', label: 'Notifications' },
];

/**
 * Buyer account shell — renders inside the public website header (no sidebar).
 * A horizontal "My Account" tab bar replaces the old dashboard sidebar so buyer
 * pages feel like an ecommerce site and use the full content width.
 */
export function BuyerLayout() {
  return (
    <div className="min-h-[60vh] bg-muted/30">
      <div className="border-b bg-white">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                    isActive ? 'border-brand text-brand' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <div className="container mx-auto px-3 py-5 sm:px-4 sm:py-6 lg:px-6">
        <Outlet />
      </div>
    </div>
  );
}
