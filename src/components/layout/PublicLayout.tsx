import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useNotifications } from '@/hooks/useNotifications';
import { useAddress } from '@/contexts/AddressContext';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Logo } from '@/components/ui/Logo';
import { MegaMenu } from '@/components/layout/MegaMenu';
import { Footer } from '@/components/layout/Footer';
import { AddressModal } from '@/components/address/AddressModal';
import { useState, useRef, useEffect } from 'react';
import {
  FiMenu, FiX, FiShoppingCart, FiUser, FiSearch, FiLogOut, FiHome, FiGrid,
  FiChevronDown, FiMapPin, FiTruck, FiHeart, FiBell, FiPackage,
} from 'react-icons/fi';

export function PublicLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { unreadCount } = useNotifications();
  const { selectedAddress, openModal } = useAddress();
  const isBuyer = user?.role === 'buyer';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [mobileSearchOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setMobileSearchOpen(false);
      setMobileMenuOpen(false);
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const cartHref = isAuthenticated && user?.role === 'buyer' ? '/buyer/cart' : '/login';
  const dashboardHref = isAuthenticated ? `/${user?.role}/dashboard` : '/login';
  const ordersHref = isAuthenticated ? `/${user?.role}/orders` : '/login';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        {/* Row 1: Logo · Search · Actions */}
        <div className="border-b">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex h-14 items-center gap-2 sm:h-16 sm:gap-5">
              {/* Logo */}
              <Link to="/" className="flex items-center flex-shrink-0">
                <Logo size={30} />
              </Link>

              {/* Deliver to — desktop only */}
              <button
                onClick={openModal}
                className="hidden lg:flex flex-shrink-0 items-center gap-1.5 text-left hover:bg-muted/50 rounded-lg px-2 py-1 -ml-2 transition-colors"
              >
                <FiMapPin className="h-5 w-5 text-brand" />
                <span className="leading-tight">
                  <span className="block text-[11px] text-muted-foreground">Deliver to</span>
                  {selectedAddress ? (
                    <span className="flex items-center gap-1 text-sm font-semibold">
                      {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                      <FiChevronDown className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-semibold">
                      Select location <FiChevronDown className="h-3 w-3" />
                    </span>
                  )}
                </span>
              </button>

              {/* Desktop search */}
              <form onSubmit={handleSearch} className="hidden flex-1 max-w-2xl md:flex">
                <div className="flex w-full items-center overflow-hidden rounded-md border border-input transition-colors focus-within:border-brand">
                  <MegaMenu />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, categories, brands..."
                    className="h-10 min-w-0 flex-1 px-3 text-sm focus:outline-none"
                  />
                  <button type="submit" aria-label="Search" className="flex h-10 w-11 flex-shrink-0 items-center justify-center bg-brand text-white transition-colors hover:bg-brand-dark">
                    <FiSearch className="h-5 w-5" />
                  </button>
                </div>
              </form>

              {/* Mobile search trigger */}
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="flex md:hidden flex-1 items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
                aria-label="Open search"
              >
                <FiSearch className="h-4 w-4" />
                <span className="truncate">Search products...</span>
              </button>

              {/* Right actions */}
              <div className="flex flex-shrink-0 items-center gap-1 sm:gap-3">
                {/* Wishlist (buyers) — show on sm+ */}
                {isAuthenticated && isBuyer && (
                  <Link to="/buyer/wishlist" className="hidden p-1.5 text-foreground hover:text-brand sm:block" aria-label="Wishlist">
                    <FiHeart className="h-5 w-5" />
                  </Link>
                )}

                {/* Notifications (buyers) — show on sm+ */}
                {isAuthenticated && isBuyer && (
                  <Link to="/buyer/notifications" className="relative hidden p-1.5 text-foreground hover:text-brand sm:block" aria-label="Notifications">
                    <FiBell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                  </Link>
                )}

                {/* Track Order — md+ only */}
                <Link to={ordersHref} className="hidden items-center gap-2 text-sm hover:text-brand md:flex">
                  <FiTruck className="h-5 w-5" />
                  <span className="leading-tight">
                    <span className="block text-[11px] text-muted-foreground">Track</span>
                    <span className="font-semibold">Order</span>
                  </span>
                </Link>

                {/* Cart */}
                {(!isAuthenticated || isBuyer) && (
                  <Link to={cartHref} className="relative p-1.5 text-foreground hover:text-brand" aria-label="Cart">
                    <FiShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                    {itemCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Account — desktop */}
                {isAuthenticated ? (
                  <div className="relative hidden sm:block" ref={userMenuRef}>
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 rounded-md p-1.5 hover:bg-muted transition-colors">
                      <Avatar src={user?.avatar} name={user?.full_name || ''} size="sm" />
                      <span className="hidden max-w-[100px] truncate text-sm font-medium lg:block">{user?.full_name}</span>
                      <FiChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border bg-background p-2 text-foreground shadow-xl">
                        <div className="mb-1 border-b px-3 py-2">
                          <p className="truncate text-sm font-medium">{user?.full_name}</p>
                          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                          <Badge variant="secondary" className="mt-1 text-[10px] capitalize">{user?.role}</Badge>
                        </div>
                        <Link to={dashboardHref} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setUserMenuOpen(false)}><FiHome className="h-4 w-4" /> Dashboard</Link>
                        <Link to={ordersHref} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setUserMenuOpen(false)}><FiGrid className="h-4 w-4" /> Orders</Link>
                        {isBuyer && <Link to="/buyer/wishlist" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setUserMenuOpen(false)}><FiHeart className="h-4 w-4" /> Wishlist</Link>}
                        {isBuyer && <Link to="/buyer/notifications" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setUserMenuOpen(false)}><FiBell className="h-4 w-4" /> Notifications</Link>}
                        <Link to={`/${user?.role}/profile`} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setUserMenuOpen(false)}><FiUser className="h-4 w-4" /> Profile</Link>
                        <hr className="my-1" />
                        <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent"><FiLogOut className="h-4 w-4" /> Logout</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login" className="hidden items-center gap-2 text-sm hover:text-brand sm:flex">
                    <FiUser className="h-5 w-5" />
                    <span className="leading-tight">
                      <span className="block text-[11px] text-muted-foreground">Welcome</span>
                      <span className="font-semibold">Login / Sign Up</span>
                    </span>
                  </Link>
                )}

                {/* Hamburger — mobile only */}
                <button
                  className="rounded-md p-2 hover:bg-muted lg:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {mobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu — slide down */}
        {mobileMenuOpen && (
          <div className="border-t bg-white lg:hidden max-h-[80vh] overflow-y-auto">
            <div className="container mx-auto px-4 py-4 space-y-1">
              {/* User info for authenticated users */}
              {isAuthenticated && (
                <div className="mb-3 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <Avatar src={user?.avatar} name={user?.full_name || ''} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user?.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              )}

              {!isAuthenticated && (
                <Link to="/login" className="flex items-center gap-3 rounded-lg bg-brand/5 px-3 py-3 text-sm font-semibold text-brand" onClick={() => setMobileMenuOpen(false)}>
                  <FiUser className="h-5 w-5" /> Login / Sign Up
                </Link>
              )}

              {/* Deliver to — mobile */}
              <button
                onClick={() => { setMobileMenuOpen(false); openModal(); }}
                className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-3 text-sm w-full text-left"
              >
                <FiMapPin className="h-4 w-4 text-brand" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] text-muted-foreground">Deliver to</span>
                  {selectedAddress ? (
                    <span className="block truncate font-semibold">{selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}</span>
                  ) : (
                    <span className="block font-semibold text-brand">Select delivery location</span>
                  )}
                </span>
                <FiChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>

              {/* Primary navigation */}
              <Link to="/products" className="flex items-center gap-3 py-3 text-sm font-medium hover:text-brand" onClick={() => setMobileMenuOpen(false)}>
                <FiPackage className="h-4 w-4 text-muted-foreground" /> All Products
              </Link>
              <Link to="/products" className="flex items-center gap-3 py-3 text-sm font-medium hover:text-brand" onClick={() => setMobileMenuOpen(false)}>
                <FiGrid className="h-4 w-4 text-muted-foreground" /> Categories
              </Link>
              <Link to={ordersHref} className="flex items-center gap-3 py-3 text-sm font-medium hover:text-brand" onClick={() => setMobileMenuOpen(false)}>
                <FiTruck className="h-4 w-4 text-muted-foreground" /> Track Order
              </Link>

              {isAuthenticated && (
                <>
                  <hr className="my-2" />
                  <Link to={dashboardHref} className="flex items-center gap-3 py-3 text-sm font-medium hover:text-brand" onClick={() => setMobileMenuOpen(false)}>
                    <FiHome className="h-4 w-4 text-muted-foreground" /> Dashboard
                  </Link>
                  <Link to={ordersHref} className="flex items-center gap-3 py-3 text-sm font-medium hover:text-brand" onClick={() => setMobileMenuOpen(false)}>
                    <FiGrid className="h-4 w-4 text-muted-foreground" /> My Orders
                  </Link>
                  {isBuyer && (
                    <>
                      <Link to="/buyer/wishlist" className="flex items-center gap-3 py-3 text-sm font-medium hover:text-brand" onClick={() => setMobileMenuOpen(false)}>
                        <FiHeart className="h-4 w-4 text-muted-foreground" /> Wishlist
                      </Link>
                      <Link to="/buyer/cart" className="flex items-center gap-3 py-3 text-sm font-medium hover:text-brand" onClick={() => setMobileMenuOpen(false)}>
                        <FiShoppingCart className="h-4 w-4 text-muted-foreground" /> Cart {itemCount > 0 && <Badge variant="secondary" className="text-[10px]">{itemCount}</Badge>}
                      </Link>
                      <Link to="/buyer/notifications" className="flex items-center gap-3 py-3 text-sm font-medium hover:text-brand" onClick={() => setMobileMenuOpen(false)}>
                        <FiBell className="h-4 w-4 text-muted-foreground" /> Notifications
                        {unreadCount > 0 && <Badge variant="destructive" className="text-[10px]">{unreadCount}</Badge>}
                      </Link>
                    </>
                  )}
                  <Link to={`/${user?.role}/profile`} className="flex items-center gap-3 py-3 text-sm font-medium hover:text-brand" onClick={() => setMobileMenuOpen(false)}>
                    <FiUser className="h-4 w-4 text-muted-foreground" /> Profile
                  </Link>
                  <hr className="my-2" />
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex w-full items-center gap-3 py-3 text-sm font-medium text-destructive hover:text-destructive">
                    <FiLogOut className="h-4 w-4" /> Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mobile search overlay */}
        {mobileSearchOpen && (
          <div className="fixed inset-0 z-[60] bg-white md:hidden">
            <div className="flex h-14 items-center gap-2 border-b px-3">
              <button onClick={() => setMobileSearchOpen(false)} className="p-2 hover:bg-muted rounded-md" aria-label="Close search">
                <FiX className="h-5 w-5" />
              </button>
              <form onSubmit={handleMobileSearch} className="flex flex-1">
                <div className="flex w-full items-center overflow-hidden rounded-md border border-input focus-within:border-brand">
                  <input
                    ref={mobileSearchRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, categories, brands..."
                    className="h-10 min-w-0 flex-1 px-3 text-sm focus:outline-none"
                  />
                  <button type="submit" aria-label="Search" className="flex h-10 w-11 flex-shrink-0 items-center justify-center bg-brand text-white">
                    <FiSearch className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
            <div className="p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Laptops', 'Cameras', 'Networking', 'Printers', 'Storage', 'Audio'].map((term) => (
                  <Link
                    key={term}
                    to={`/products?search=${encodeURIComponent(term)}`}
                    onClick={() => setMobileSearchOpen(false)}
                    className="rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-brand hover:text-brand"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Address modal */}
      <AddressModal />

      {/* Footer */}
      <Footer />
    </div>
  );
}
