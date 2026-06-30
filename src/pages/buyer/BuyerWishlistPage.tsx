import { Link } from 'react-router-dom';
import { useWishlist } from '@/hooks/useWishlist';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { ProductImage } from '@/components/common/ProductImage';
import { FiHeart, FiTrash2 } from 'react-icons/fi';

export default function BuyerWishlistPage() {
  const { items, isLoading, removeFromWishlist } = useWishlist();

  if (isLoading) return <PageLoading />;

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Wishlist ({items.length})</h1>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FiHeart className="h-8 w-8 text-muted-foreground" />}
              title="Wishlist is empty"
              description="Save products you like for later"
              action={{ label: 'Browse Products', href: '/products' }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    <ProductImage
                      src={item.variant_detail?.image}
                      name={item.variant_detail?.product?.name || 'Product'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.variant_detail?.product?.slug || ''}`}>
                      <h3 className="font-medium text-sm line-clamp-1 hover:text-brand transition-colors">{item.variant_detail?.product?.name}</h3>
                    </Link>
                    <p className="text-xs text-muted-foreground">{item.variant_detail?.name}</p>
                    <p className="text-sm font-bold text-brand mt-1">{formatCurrency(item.variant_detail?.selling_price || '0')}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFromWishlist(item.id)} className="flex-shrink-0">
                    <FiTrash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
