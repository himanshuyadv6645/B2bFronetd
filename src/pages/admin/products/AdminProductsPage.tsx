import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductImage } from '@/components/common/ProductImage';
import ImageManagerModal from '@/components/common/ImageManagerModal';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { FiSearch, FiPackage, FiPlus, FiTrash2, FiImage } from 'react-icons/fi';
import type { Product, Category, Brand } from '@/types/product';

type ProductForm = {
  name: string;
  description: string;
  short_description: string;
  category: string;
  brand: string;
  sku: string;
  hsn_code: string;
  retail_price: string;
  wholesale_price: string;
  gst: string;
  moq: string;
  warranty: string;
  country_of_origin: string;
  is_active: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_top_seller: boolean;
};

const emptyForm: ProductForm = {
  name: '', description: '', short_description: '', category: '', brand: '',
  sku: '', hsn_code: '', retail_price: '', wholesale_price: '', gst: '18',
  moq: '1', warranty: '', country_of_origin: 'India', is_active: true,
  is_featured: false, is_trending: false, is_top_seller: false,
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => productService.getProducts({ search, page, page_size: 20 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories-tree'],
    queryFn: () => productService.getCategoryTree(),
    enabled: modalOpen,
  });

  const { data: brandsData } = useQuery({
    queryKey: ['admin-brands-list'],
    queryFn: () => productService.getBrands({ page_size: 200 }),
    enabled: modalOpen,
  });

  // --- Image management ---
  const [imageProduct, setImageProduct] = useState<Product | null>(null);
  const { data: imageProductImages = [] } = useQuery({
    queryKey: ['admin-product-images', imageProduct?.id],
    queryFn: () => productService.getProductImages(imageProduct!.id),
    enabled: !!imageProduct,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const payload: Partial<Product> = {
        name: form.name,
        description: form.description || undefined,
        short_description: form.short_description || undefined,
        category: form.category,
        brand: form.brand || undefined,
        sku: form.sku,
        hsn_code: form.hsn_code || undefined,
        retail_price: form.retail_price || undefined,
        wholesale_price: form.wholesale_price || undefined,
        gst: form.gst || undefined,
        moq: form.moq ? Number(form.moq) : undefined,
        warranty: form.warranty || undefined,
        country_of_origin: form.country_of_origin || undefined,
        is_active: form.is_active,
        is_featured: form.is_featured,
        is_trending: form.is_trending,
        is_top_seller: form.is_top_seller,
      };
      return productService.createProduct(payload);
    },
    onSuccess: () => {
      toast.success('Product created');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setModalOpen(false);
      setForm(emptyForm);
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || 'Failed to create product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  if (isLoading) return <PageLoading />;

  const products = data?.results || [];
  const totalPages = Math.ceil((data?.count || 0) / 20);

  // Flatten category tree into options
  const categoryOptions = flattenCategories(categoriesData || []);
  const brandOptions = (brandsData?.results || []).map((b: Brand) => ({ value: b.id, label: b.name }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{data?.count || 0} products total</p>
        </div>
        <Button size="sm" onClick={() => { setForm(emptyForm); setModalOpen(true); }}>
          <FiPlus className="mr-1 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FiPackage className="h-8 w-8 text-muted-foreground" />}
              title="No products found"
              description={search ? "Try a different search" : "Click 'Add Product' to create your first product"}
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
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Stock</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                              <ProductImage src={product.primary_image} name={product.name} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate max-w-[200px]">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.total_sellers} sellers</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {product.category_detail?.name || '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-sm">
                          {formatCurrency(product.min_selling_price)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-sm ${product.total_stock < 10 ? 'text-red-600 font-medium' : ''}`}>{product.total_stock}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={product.is_active ? 'success' : 'destructive'} className="text-xs">
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8 text-blue-600"
                              onClick={() => setImageProduct(product)}
                              title="Manage Images"
                            >
                              <FiImage className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                              onClick={() => {
                                if (confirm('Delete this product?')) deleteMutation.mutate(product.id);
                              }}
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      <ProductImage src={product.primary_image} name={product.name} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{product.total_sellers} sellers</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold">{formatCurrency(product.min_selling_price)}</span>
                        <span className={`text-xs ${product.total_stock < 10 ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                          Stock: {product.total_stock}
                        </span>
                        <Badge variant={product.is_active ? 'success' : 'destructive'} className="text-[10px]">
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      variant="ghost" size="sm" className="text-blue-600 text-xs"
                      onClick={() => setImageProduct(product)}
                    >
                      <FiImage className="mr-1 h-3 w-3" /> Images
                    </Button>
                    <Button
                      variant="ghost" size="sm" className="text-destructive text-xs"
                      onClick={() => {
                        if (confirm('Delete this product?')) deleteMutation.mutate(product.id);
                      }}
                    >
                      <FiTrash2 className="mr-1 h-3 w-3" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}

      {/* Add Product Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-1.5">
              <Label>Product Name *</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dell Latitude 5540 Laptop" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Select category"
                  options={categoryOptions}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Brand</Label>
                <Select
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="Select brand"
                  options={brandOptions}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>SKU *</Label>
                <Input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Unique SKU" />
              </div>
              <div className="space-y-1.5">
                <Label>HSN Code</Label>
                <Input value={form.hsn_code} onChange={(e) => setForm({ ...form, hsn_code: e.target.value })} placeholder="HSN code" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Short Description</Label>
              <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} placeholder="Brief description (max 500 chars)" maxLength={500} />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Full product description"
              />
            </div>

            {/* Pricing */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Pricing & Stock</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label>Retail Price (MRP)</Label>
                  <Input type="number" value={form.retail_price} onChange={(e) => setForm({ ...form, retail_price: e.target.value })} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Wholesale Price</Label>
                  <Input type="number" value={form.wholesale_price} onChange={(e) => setForm({ ...form, wholesale_price: e.target.value })} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>GST %</Label>
                  <Input type="number" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>MOQ</Label>
                  <Input type="number" min="1" value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Extra Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Warranty</Label>
                <Input value={form.warranty} onChange={(e) => setForm({ ...form, warranty: e.target.value })} placeholder="e.g. 1 Year" />
              </div>
              <div className="space-y-1.5">
                <Label>Country of Origin</Label>
                <Input value={form.country_of_origin} onChange={(e) => setForm({ ...form, country_of_origin: e.target.value })} />
              </div>
            </div>

            {/* Flags */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Visibility</h3>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4" />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="h-4 w-4" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_trending} onChange={(e) => setForm({ ...form, is_trending: e.target.checked })} className="h-4 w-4" />
                  Trending
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_top_seller} onChange={(e) => setForm({ ...form, is_top_seller: e.target.checked })} className="h-4 w-4" />
                  Top Seller
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                isLoading={createMutation.isPending}
                disabled={!form.name || !form.category || !form.sku}
              >
                Create Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Manager Modal */}
      <ImageManagerModal
        open={!!imageProduct}
        onClose={() => setImageProduct(null)}
        targetType="product"
        targetId={imageProduct?.id || ''}
        targetName={imageProduct?.name || ''}
        images={imageProductImages}
        queryKey={['admin-product-images', imageProduct?.id || '']}
      />
    </div>
  );
}

/** Flatten nested category tree into { value, label } options with indentation */
function flattenCategories(
  nodes: (Category & { children?: Category[] })[],
  depth = 0
): { value: string; label: string }[] {
  const result: { value: string; label: string }[] = [];
  for (const node of nodes) {
    result.push({
      value: node.id,
      label: '\u00A0'.repeat(depth * 2) + (depth > 0 ? '└ ' : '') + node.name,
    });
    if (node.children && node.children.length > 0) {
      result.push(...flattenCategories(node.children, depth + 1));
    }
  }
  return result;
}
