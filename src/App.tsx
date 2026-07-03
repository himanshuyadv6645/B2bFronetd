import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryProvider } from '@/contexts/QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthRedirectProvider } from '@/contexts/AuthRedirectContext';
import { AddressProvider } from '@/contexts/AddressContext';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { MarketplaceLayout } from '@/components/layout/MarketplaceLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import { ProtectedRoute, GuestRoute } from '@/routes/ProtectedRoute';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('@/pages/public/HomePage'));
const LoginPage = lazy(() => import('@/pages/public/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/public/auth/RegisterPage'));
const ProductsPage = lazy(() => import('@/pages/public/product/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/public/product/ProductDetailPage'));
const SEOLandingPage = lazy(() => import('@/pages/public/SEOLandingPage'));

const BuyerDashboard = lazy(() => import('@/pages/buyer/BuyerDashboard'));
const BuyerProfile = lazy(() => import('@/pages/buyer/profile/BuyerProfilePage'));
const BuyerOrders = lazy(() => import('@/pages/buyer/orders/BuyerOrdersPage'));
const BuyerCart = lazy(() => import('@/pages/buyer/cart/BuyerCartPage'));
const BuyerWishlist = lazy(() => import('@/pages/buyer/BuyerWishlistPage'));
const BuyerNotifications = lazy(() => import('@/pages/buyer/BuyerNotificationsPage'));

const SellerDashboard = lazy(() => import('@/pages/seller/SellerDashboard'));
const SellerProducts = lazy(() => import('@/pages/seller/products/SellerProductsPage'));
const SellerPricing = lazy(() => import('@/pages/seller/pricing/SellerPricingPage'));
const SellerInventory = lazy(() => import('@/pages/seller/inventory/SellerInventoryPage'));
const SellerOrders = lazy(() => import('@/pages/seller/orders/SellerOrdersPage'));
const SellerProfile = lazy(() => import('@/pages/seller/SellerProfilePage'));
const SellerNotifications = lazy(() => import('@/pages/seller/SellerNotificationsPage'));

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/users/AdminUsersPage'));
const AdminApprovals = lazy(() => import('@/pages/admin/AdminApprovalsPage'));
const AdminProducts = lazy(() => import('@/pages/admin/products/AdminProductsPage'));
const AdminCategories = lazy(() => import('@/pages/admin/categories/AdminCategoriesPage'));
const AdminBrands = lazy(() => import('@/pages/admin/brands/AdminBrandsPage'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalyticsPage'));
const AdminReviews = lazy(() => import('@/pages/admin/AdminReviewsPage'));
const AdminNotifications = lazy(() => import('@/pages/admin/AdminNotificationsPage'));

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <AuthRedirectProvider>
          <AddressProvider>
            <BrowserRouter>
            <Suspense fallback={<PageLoading />}>
              <Routes>
                {/* Shopping Routes — full marketplace layout with CategoryBar */}
                <Route element={<PublicLayout />}>
                  <Route element={<MarketplaceLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    <Route path="/categories" element={<ProductsPage />} />
                    <Route path="/categories/:slug" element={<ProductsPage />} />
                    <Route path="/search/*" element={<SEOLandingPage />} />
                    <Route path="/brands/*" element={<SEOLandingPage />} />
                  </Route>
                  {/* SEO Landing Pages — outside MarketplaceLayout (no CategoryBar) */}
                  <Route path="/*" element={<SEOLandingPage />} />
                </Route>

                {/* Guest Routes — no CategoryBar */}
                <Route element={<GuestRoute><PublicLayout /></GuestRoute>}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Buyer Routes — no CategoryBar, uses BuyerLayout tabs */}
                <Route element={<ProtectedRoute allowedRoles={['buyer']}><PublicLayout /></ProtectedRoute>}>
                  <Route element={<BuyerLayout />}>
                    <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
                    <Route path="/buyer/profile" element={<BuyerProfile />} />
                    <Route path="/buyer/orders" element={<BuyerOrders />} />
                    <Route path="/buyer/orders/:orderNumber" element={<BuyerOrders />} />
                    <Route path="/buyer/cart" element={<BuyerCart />} />
                    <Route path="/buyer/wishlist" element={<BuyerWishlist />} />
                    <Route path="/buyer/notifications" element={<BuyerNotifications />} />
                  </Route>
                </Route>

                {/* Seller Routes */}
                <Route element={<ProtectedRoute allowedRoles={['seller']}><DashboardLayout role="seller" /></ProtectedRoute>}>
                  <Route path="/seller/dashboard" element={<SellerDashboard />} />
                  <Route path="/seller/profile" element={<SellerProfile />} />
                  <Route path="/seller/products" element={<SellerProducts />} />
                  <Route path="/seller/products/:id" element={<SellerProducts />} />
                  <Route path="/seller/pricing" element={<SellerPricing />} />
                  <Route path="/seller/inventory" element={<SellerInventory />} />
                  <Route path="/seller/orders" element={<SellerOrders />} />
                  <Route path="/seller/orders/:id" element={<SellerOrders />} />
                  <Route path="/seller/notifications" element={<SellerNotifications />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin" /></ProtectedRoute>}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/users/:id" element={<AdminUsers />} />
                  <Route path="/admin/approvals" element={<AdminApprovals />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/categories" element={<AdminCategories />} />
                  <Route path="/admin/brands" element={<AdminBrands />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/reviews" element={<AdminReviews />} />
                  <Route path="/admin/notifications" element={<AdminNotifications />} />
                </Route>

                {/* SEO fallback - catch unmatched routes */}
                {/* (handled by the /* route above) */}
              </Routes>
            </Suspense>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  fontSize: '14px',
                  maxWidth: '360px',
                },
                success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
            </BrowserRouter>
          </AddressProvider>
          </AuthRedirectProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
