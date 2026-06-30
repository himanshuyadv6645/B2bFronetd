import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { pricingService } from '@/services/pricing.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/lib/utils';
import { ProductImage } from '@/components/common/ProductImage';
import { FiSearch, FiPackage, FiPlus, FiEdit2, FiDollarSign } from 'react-icons/fi';

export default function SellerProductsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['seller-pricing', search],
    queryFn: () => pricingService.getPricing({ search, page_size: 50 }),
  });

  if (isLoading) return <PageLoading />;

  const pricings = data?.results || [];

  const uniqueProducts = new Map<string, { name: string; id: string; pricings: typeof pricings }>();
  pricings.forEach(p => {
    const name = p.variant_detail?.product?.name || 'Unknown';
    const pid = p.variant_detail?.product?.id || p.id;
    if (!uniqueProducts.has(pid)) {
      uniqueProducts.set(pid, { name, id: pid, pricings: [] });
    }
    uniqueProducts.get(pid)!.pricings.push(p);
  });

  const products = Array.from(uniqueProducts.values());

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">My Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} products listed</p>
        </div>
        <Link to="/seller/pricing">
          <Button size="sm">
            <FiPlus className="mr-1 h-4 w-4" /> List a Product
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FiPackage className="h-8 w-8 text-muted-foreground" />}
              title="No products yet"
              description="List a product by adding pricing for a variant to start selling"
              action={{ label: 'List a Product', href: '/seller/pricing' }}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Variants</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Price Range</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => {
                      const prices = prod.pricings.map(p => parseFloat(p.selling_price)).filter(n => !isNaN(n));
                      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                      const activeCount = prod.pricings.filter(p => p.is_active).length;

                      return (
                        <tr key={prod.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                <ProductImage src={prod.pricings[0]?.variant_detail?.image} name={prod.name} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate max-w-[200px]">{prod.name}</p>
                                <p className="text-xs text-muted-foreground">{prod.pricings.length} pricing entries</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {prod.pricings.slice(0, 3).map((p, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px]">{p.variant_detail?.name || 'Variant'}</Badge>
                              ))}
                              {prod.pricings.length > 3 && (
                                <Badge variant="secondary" className="text-[10px]">+{prod.pricings.length - 3}</Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-semibold text-sm">{formatCurrency(minPrice)}</span>
                            {minPrice !== maxPrice && (
                              <span className="text-xs text-muted-foreground"> - {formatCurrency(maxPrice)}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={activeCount > 0 ? 'success' : 'destructive'} className="text-xs">
                              {activeCount}/{prod.pricings.length} Active
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link to="/seller/pricing">
                                <Button variant="ghost" size="icon" className="h-8 w-8" title="Manage Pricing">
                                  <FiDollarSign className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link to="/seller/inventory">
                                <Button variant="ghost" size="icon" className="h-8 w-8" title="Manage Inventory">
                                  <FiEdit2 className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {products.map((prod) => {
              const prices = prod.pricings.map(p => parseFloat(p.selling_price)).filter(n => !isNaN(n));
              const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
              const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
              const activeCount = prod.pricings.filter(p => p.is_active).length;

              return (
                <Card key={prod.id}>
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <ProductImage src={prod.pricings[0]?.variant_detail?.image} name={prod.name} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-medium">{prod.name}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{prod.pricings.length} pricing entries</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold">{formatCurrency(minPrice)}</span>
                          {minPrice !== maxPrice && (
                            <span className="text-xs text-muted-foreground">- {formatCurrency(maxPrice)}</span>
                          )}
                          <Badge variant={activeCount > 0 ? 'success' : 'destructive'} className="text-[10px]">
                            {activeCount}/{prod.pricings.length}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link to="/seller/pricing" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          <FiDollarSign className="mr-1 h-3 w-3" /> Pricing
                        </Button>
                      </Link>
                      <Link to="/seller/inventory" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          <FiEdit2 className="mr-1 h-3 w-3" /> Inventory
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
