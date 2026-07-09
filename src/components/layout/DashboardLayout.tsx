import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Logo } from '@/components/ui/Logo';
import { useState, useRef, useEffect } from 'react';
import {
  FiHome, FiPackage, FiShoppingCart, FiCreditCard, FiBell, FiSettings, FiLogOut,
  FiMenu, FiX, FiUser, FiGrid, FiTag, FiCheckCircle, FiBarChart2, FiUsers, FiTruck,
  FiChevronDown, FiPackage as FiBox, FiStar
} from 'react-icons/fi';

interface DashboardLayoutProps {
  role: 'buyer' | 'seller' | 'admin';
}

const sidebarConfig = {
  buyer: [
    { icon: FiHome, label: 'Dashboard', path: '/buyer/dashboard' },
    { icon: FiPackage, label: 'Products', path: '/products' },
    { icon: FiShoppingCart, label: 'Cart', path: '/buyer/cart' },
    { icon: FiGrid, label: 'Orders', path: '/buyer/orders' },
    { icon: FiCreditCard, label: 'Wishlist', path: '/buyer/wishlist' },
    { icon: FiUser, label: 'Profile', path: '/buyer/profile' },
    { icon: FiBell, label: 'Notifications', path: '/buyer/notifications' },
  ],
  seller: [
    { icon: FiHome, label: 'Dashboard', path: '/seller/dashboard' },
    { icon: FiBox, label: 'Products', path: '/seller/products' },
    { icon: FiTag, label: 'Pricing', path: '/seller/pricing' },
    { icon: FiTruck, label: 'Inventory', path: '/seller/inventory' },
    { icon: FiGrid, label: 'Orders', path: '/seller/orders' },
    { icon: FiUser, label: 'Profile', path: '/seller/profile' },
    { icon: FiBell, label: 'Notifications', path: '/seller/notifications' },
  ],
  admin: [
    { icon: FiHome, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FiUsers, label: 'Users', path: '/admin/users' },
    { icon: FiCheckCircle, label: 'Approvals', path: '/admin/approvals' },
    { icon: FiStar, label: 'Reviews', path: '/admin/reviews' },
    { icon: FiPackage, label: 'Products', path: '/admin/products' },
    { icon: FiGrid, label: 'Categories', path: '/admin/categories' },
    { icon: FiTag, label: 'Brands', path: '/admin/brands' },
    { icon: FiBarChart2, label: 'Analytics', path: '/admin/analytics' },
    { icon: FiBell, label: 'Broadcast', path: '/admin/broadcast' },
    { icon: FiBell, label: 'Notifications', path: '/admin/notifications' },
  ],
};

const roleNames = { buyer: 'Buyer', seller: 'Seller', admin: 'Admin' };

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const menuItems = sidebarConfig[role];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 sm:h-16 items-center justify-between border-b px-4 sm:px-6">
            <Link to="/" className="flex items-center gap-2">
              <Logo size={30} />
            </Link>
            <button className="lg:hidden p-1 hover:bg-accent rounded" onClick={() => setSidebarOpen(false)}>
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="px-3 py-2 border-b lg:hidden">
            <Badge variant="secondary" className="capitalize text-xs">{roleNames[role]} Panel</Badge>
          </div>

          <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
            <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Menu</p>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand/10 text-brand'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {isActive && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />}
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-brand' : ''}`} />
                  <span className="truncate">{item.label}</span>
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <Badge className="ml-auto" variant="destructive">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-3 space-y-1">
            <Link
              to={`/${role}/profile`}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <FiSettings className="h-5 w-5" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <FiLogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-3 sm:px-6">
          <button
            className="lg:hidden p-2 hover:bg-accent rounded-md"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu className="h-5 w-5" />
          </button>

          <div className="flex-1 hidden md:block">
            <h2 className="text-sm font-medium text-muted-foreground capitalize">{roleNames[role]} Dashboard</h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to={`/${role}/notifications`} className="relative p-2 hover:bg-accent rounded-md transition-colors">
              <FiBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-md p-1.5 hover:bg-accent transition-colors"
              >
                <Avatar src={user?.avatar} name={user?.full_name || ''} size="sm" />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-tight truncate max-w-[120px]">{user?.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role}</p>
                </div>
                <FiChevronDown className={`h-4 w-4 hidden md:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-background p-2 shadow-lg z-50">
                  <div className="px-3 py-2 border-b mb-1">
                    <p className="text-sm font-medium truncate">{user?.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px] capitalize">{role}</Badge>
                  </div>
                  <Link
                    to={`/${role}/profile`}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <FiSettings className="h-4 w-4" />
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent"
                  >
                    <FiLogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
