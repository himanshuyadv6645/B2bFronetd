import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductImage } from '@/components/common/ProductImage';
import toast from 'react-hot-toast';
import { FiSearch, FiPackage, FiAlertTriangle, FiEdit2, FiX } from 'react-icons/fi';

export default function SellerInventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'remove' | 'adjustment'>('add');
  const [adjustNotes, setAdjustNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['seller-inventory', search],
    queryFn: () => inventoryService.getInventory({ search, page_size: 50 }),
  });

  const adjustMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { quantity: number; change_type: 'add' | 'remove' | 'adjustment'; notes?: string } }) =>
      inventoryService.adjustStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
      toast.success('Stock updated');
      setAdjustingId(null);
      setAdjustQty('');
      setAdjustNotes('');
    },
    onError: () => toast.error('Failed to update stock'),
  });

  if (isLoading) return <PageLoading />;

  const items = data?.results || [];
  const lowStockItems = items.filter(i => i.available_stock <= i.low_stock_threshold);

  const StockAdjustForm = ({ itemId }: { itemId: string }) => (
    <div className="mt-3 rounded-lg border bg-muted/20 p-3 space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
        <div className="space-y-1 w-full sm:w-auto">
          <Label className="text-xs">Action</Label>
          <select value={adjustType} onChange={(e) => setAdjustType(e.target.value as 'add' | 'remove' | 'adjustment')} className="h-9 w-full rounded-md border bg-background px-2 text-sm">
            <option value="add">Add Stock</option>
            <option value="remove">Remove Stock</option>
            <option value="adjustment">Set Exact</option>
          </select>
        </div>
        <div className="space-y-1 w-full sm:w-auto">
          <Label className="text-xs">Quantity</Label>
          <Input type="number" min="0" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} className="h-9 w-full sm:w-24" placeholder="e.g. 10" />
        </div>
        <div className="space-y-1 flex-1 w-full sm:w-auto">
          <Label className="text-xs">Notes</Label>
          <Input value={adjustNotes} onChange={(e) => setAdjustNotes(e.target.value)} className="h-9" placeholder="Optional reason" />
        </div>
        <Button
          size="sm"
          onClick={() => {
            const qty = Math.abs(parseInt(adjustQty));
            if (!qty && qty !== 0) return;
            adjustMutation.mutate({
              id: itemId,
              data: { quantity: qty, change_type: adjustType, notes: adjustNotes || undefined },
            });
          }}
          isLoading={adjustMutation.isPending}
          disabled={adjustQty === ''}
          className="w-full sm:w-auto"
        >
          Update
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Inventory</h1>
        <p className="text-sm text-muted-foreground">{data?.count || 0} items tracked</p>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FiAlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-yellow-800">{lowStockItems.length} items low on stock</p>
                <p className="text-xs text-yellow-600">Restock soon to avoid stockouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FiPackage className="h-8 w-8 text-muted-foreground" />}
              title="No inventory items"
              description="Add products with pricing to start tracking inventory"
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
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Warehouse</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Total</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Reserved</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Available</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const isLow = item.available_stock <= item.low_stock_threshold;
                      return (
                        <Fragment key={item.id}>
                          <tr className={`border-b hover:bg-muted/50 transition-colors ${isLow ? 'bg-yellow-50/30' : ''}`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                  <ProductImage src={item.variant_detail?.image} name={item.variant_detail?.product?.name || item.variant_detail?.name || 'Product'} />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate max-w-[180px]">{item.variant_detail?.product?.name || '-'}</p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">{item.variant_detail?.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {item.warehouse_detail?.name || '-'}
                            </td>
                            <td className="py-3 px-4 text-center text-sm font-medium">{item.total_stock}</td>
                            <td className="py-3 px-4 text-center text-sm text-muted-foreground">{item.reserved_stock}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-sm font-semibold ${isLow ? 'text-red-600' : 'text-green-600'}`}>
                                {item.available_stock}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant={isLow ? 'destructive' : 'success'} className="text-xs">
                                {isLow ? 'Low Stock' : 'In Stock'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAdjustingId(adjustingId === item.id ? null : item.id)}>
                                {adjustingId === item.id ? <FiX className="h-4 w-4" /> : <FiEdit2 className="h-4 w-4" />}
                              </Button>
                            </td>
                          </tr>
                          {adjustingId === item.id && (
                            <tr>
                              <td colSpan={7} className="py-3 px-4 bg-muted/20">
                                <StockAdjustForm itemId={item.id} />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {items.map((item) => {
              const isLow = item.available_stock <= item.low_stock_threshold;
              return (
                <Card key={item.id} className={isLow ? 'border-yellow-200 bg-yellow-50/30' : ''}>
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <ProductImage src={item.variant_detail?.image} name={item.variant_detail?.product?.name || item.variant_detail?.name || 'Product'} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-1 text-sm font-medium">{item.variant_detail?.product?.name || '-'}</h3>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{item.variant_detail?.name}</p>
                        <div className="mt-1.5 grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Total</p>
                            <p className="text-xs font-semibold">{item.total_stock}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Reserved</p>
                            <p className="text-xs text-muted-foreground">{item.reserved_stock}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Available</p>
                            <p className={`text-xs font-semibold ${isLow ? 'text-red-600' : 'text-green-600'}`}>{item.available_stock}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant={isLow ? 'destructive' : 'success'} className="text-[10px]">
                            {isLow ? 'Low Stock' : 'In Stock'}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAdjustingId(adjustingId === item.id ? null : item.id)}>
                            {adjustingId === item.id ? <FiX className="mr-1 h-3 w-3" /> : <FiEdit2 className="mr-1 h-3 w-3" />}
                            {adjustingId === item.id ? 'Cancel' : 'Adjust'}
                          </Button>
                        </div>
                      </div>
                    </div>
                    {adjustingId === item.id && <StockAdjustForm itemId={item.id} />}
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
