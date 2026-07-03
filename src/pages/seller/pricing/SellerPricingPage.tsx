import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingService } from '@/services/pricing.service';
import { productService } from '@/services/product.service';
import { sellerService } from '@/services/seller.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

import { SearchableSelect } from '@/components/common/SearchableSelect';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/lib/utils';
import { ProductImage } from '@/components/common/ProductImage';
import ImageManagerModal from '@/components/common/ImageManagerModal';
import toast from 'react-hot-toast';
import { FiSearch, FiDollarSign, FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiImage } from 'react-icons/fi';
import type { SellerPricing } from '@/types/pricing';

type PricingForm = {
  variant: string;
  warehouse: string;
  selling_price: string;
  offer_price: string;
  tax_rate: string;
  minimum_order_quantity: string;
  delivery_time_days: string;
  shipping_charge: string;
  free_shipping: boolean;
  is_active: boolean;
};

const emptyForm: PricingForm = {
  variant: '', warehouse: '', selling_price: '', offer_price: '', tax_rate: '18',
  minimum_order_quantity: '1', delivery_time_days: '7', shipping_charge: '0',
  free_shipping: false, is_active: true,
};

export default function SellerPricingPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PricingForm>(emptyForm);
  const [tierForm, setTierForm] = useState<{ min: string; max: string; price: string; discount: string }>({ min: '', max: '', price: '', discount: '0' });
  const [tierFor, setTierFor] = useState<string | null>(null);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantForm, setVariantForm] = useState({ product: '', name: '', sku: '', description: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['seller-pricing', search],
    queryFn: () => pricingService.getPricing({ search, page_size: 50 }),
  });

  const { data: variants } = useQuery({
    queryKey: ['variants-options'],
    queryFn: () => productService.getVariants({ page_size: 200 }),
    enabled: modalOpen && !editingId,
  });

  const { data: warehouses } = useQuery({
    queryKey: ['seller-warehouses'],
    queryFn: () => sellerService.getWarehouses(),
    enabled: modalOpen,
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-for-variant'],
    queryFn: () => productService.getProducts({ page_size: 200 }),
    enabled: variantModalOpen,
  });

  // --- Variant image management ---
  const [imageVariant, setImageVariant] = useState<{ id: string; name: string } | null>(null);
  const { data: variantImages = [] } = useQuery({
    queryKey: ['seller-variant-images', imageVariant?.id],
    queryFn: () => productService.getVariantImages(imageVariant!.id),
    enabled: !!imageVariant,
  });

  const createVariantMutation = useMutation({
    mutationFn: () => productService.createVariant(variantForm),
    onSuccess: (newVariant) => {
      toast.success('Variant created');
      queryClient.invalidateQueries({ queryKey: ['variants-options'] });
      // Auto-select the newly created variant
      setForm((prev) => ({ ...prev, variant: newVariant.id }));
      setVariantModalOpen(false);
      setVariantForm({ product: '', name: '', sku: '', description: '' });
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || 'Failed to create variant'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['seller-pricing'] });

  const savePricing = useMutation({
    mutationFn: () => {
      const payload = {
        variant: form.variant,
        warehouse: form.warehouse,
        selling_price: form.selling_price,
        offer_price: form.offer_price || null,
        tax_rate: form.tax_rate || '0',
        minimum_order_quantity: Number(form.minimum_order_quantity) || 1,
        delivery_time_days: Number(form.delivery_time_days) || 0,
        shipping_charge: form.free_shipping ? '0' : (form.shipping_charge || '0'),
        free_shipping: form.free_shipping,
        is_active: form.is_active,
      } as Partial<SellerPricing>;
      return editingId ? pricingService.updatePricing(editingId, payload) : pricingService.createPricing(payload);
    },
    onSuccess: () => {
      toast.success(editingId ? 'Pricing updated' : 'Pricing created');
      invalidate();
      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || 'Failed to save pricing'),
  });

  const deletePricing = useMutation({
    mutationFn: (id: string) => pricingService.deletePricing(id),
    onSuccess: () => { toast.success('Pricing deleted'); invalidate(); },
    onError: () => toast.error('Failed to delete pricing'),
  });

  const addTier = useMutation({
    mutationFn: (pricingId: string) => pricingService.createWholesaleTier(pricingId, {
      min_quantity: Number(tierForm.min),
      max_quantity: tierForm.max ? Number(tierForm.max) : null,
      price_per_unit: tierForm.price,
      discount_percent: tierForm.discount || '0',
      notes: null,
    } as never),
    onSuccess: () => { toast.success('Tier added'); invalidate(); setTierForm({ min: '', max: '', price: '', discount: '0' }); setTierFor(null); },
    onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message || 'Failed to add tier'),
  });

  const removeTier = useMutation({
    mutationFn: ({ pricingId, tierId }: { pricingId: string; tierId: string }) => pricingService.deleteWholesaleTier(pricingId, tierId),
    onSuccess: () => { toast.success('Tier removed'); invalidate(); },
    onError: () => toast.error('Failed to remove tier'),
  });

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p: SellerPricing) => {
    setEditingId(p.id);
    setForm({
      variant: p.variant,
      warehouse: p.warehouse || '',
      selling_price: p.selling_price || '',
      offer_price: p.offer_price || '',
      tax_rate: p.tax_rate || '18',
      minimum_order_quantity: String(p.minimum_order_quantity ?? 1),
      delivery_time_days: String(p.delivery_time_days ?? 7),
      shipping_charge: p.shipping_charge || '0',
      free_shipping: p.free_shipping,
      is_active: p.is_active,
    });
    setModalOpen(true);
  };

  const toggleExpand = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const pricings = data?.results || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Pricing Management</h1>
          <p className="text-sm text-muted-foreground">{data?.count ?? pricings.length} pricing entries</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <FiPlus className="mr-1 h-4 w-4" /> Add Pricing
        </Button>
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search pricing..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <PageLoading />
      ) : pricings.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FiDollarSign className="h-8 w-8 text-muted-foreground" />}
              title="No pricing entries found"
              description="Set pricing for your product variants to start selling"
              action={{ label: 'Add Pricing', onClick: openCreate }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pricings.map((p) => {
            const isExpanded = expanded.has(p.id);
            const tiers = p.wholesale_tiers || [];
            const productName = p.variant_detail?.product?.name || p.variant_name || 'Product';
            return (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <ProductImage src={p.variant_detail?.image} name={productName} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{productName}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.variant_detail?.name || p.variant_name} {p.variant_detail?.sku ? `· ${p.variant_detail.sku}` : ''}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-right">
                        <p className="font-bold text-brand text-lg">{formatCurrency(p.selling_price)}</p>
                        {p.offer_price && <p className="text-xs text-green-600">Offer: {formatCurrency(p.offer_price)}</p>}
                      </div>
                      <Badge variant={p.is_active ? 'success' : 'destructive'} className="text-xs">
                        {p.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600"
                          onClick={() => setImageVariant({ id: p.variant, name: productName })}
                          title="Manage variant images">
                          <FiImage className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleExpand(p.id)} title="Wholesale tiers">
                          {isExpanded ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)} title="Edit pricing">
                          <FiEdit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Delete pricing"
                          onClick={() => { if (confirm('Delete this pricing entry?')) deletePricing.mutate(p.id); }}>
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>MOQ: {p.minimum_order_quantity}</span>
                    {p.max_order_quantity && <span>Max: {p.max_order_quantity}</span>}
                    <span>Delivery: {p.delivery_time_days} days</span>
                    {p.free_shipping ? <span className="text-green-600">Free Shipping</span> : <span>Shipping: {formatCurrency(p.shipping_charge)}</span>}
                    <span>GST: {p.tax_rate}%</span>
                    {tiers.length > 0 && <span className="text-brand">{tiers.length} wholesale tier{tiers.length !== 1 ? 's' : ''}</span>}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Wholesale Tiers</h4>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setTierFor(tierFor === p.id ? null : p.id)}>
                          <FiPlus className="mr-1 h-3 w-3" /> Add Tier
                        </Button>
                      </div>

                      {tierFor === p.id && (
                        <div className="mb-3 p-3 rounded-lg border bg-muted/30 grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
                          <div className="space-y-1">
                            <Label className="text-[11px]">Min Qty</Label>
                            <Input type="number" min="1" className="h-8" value={tierForm.min} onChange={(e) => setTierForm({ ...tierForm, min: e.target.value })} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">Max Qty</Label>
                            <Input type="number" className="h-8" placeholder="No limit" value={tierForm.max} onChange={(e) => setTierForm({ ...tierForm, max: e.target.value })} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">Price/Unit</Label>
                            <Input type="number" className="h-8" value={tierForm.price} onChange={(e) => setTierForm({ ...tierForm, price: e.target.value })} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">Discount %</Label>
                            <Input type="number" className="h-8" value={tierForm.discount} onChange={(e) => setTierForm({ ...tierForm, discount: e.target.value })} />
                          </div>
                          <Button size="sm" className="h-8" disabled={!tierForm.min || !tierForm.price} isLoading={addTier.isPending} onClick={() => addTier.mutate(p.id)}>
                            Add
                          </Button>
                        </div>
                      )}

                      {tiers.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No wholesale tiers configured. Add tiers to offer bulk discounts.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b text-muted-foreground">
                                <th className="text-left py-2 pr-4 font-medium">Min Qty</th>
                                <th className="text-left py-2 pr-4 font-medium">Max Qty</th>
                                <th className="text-right py-2 pr-4 font-medium">Price/Unit</th>
                                <th className="text-right py-2 pr-4 font-medium">Discount</th>
                                <th className="text-right py-2 font-medium">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tiers.map((tier) => (
                                <tr key={tier.id} className="border-b last:border-0">
                                  <td className="py-2 pr-4">{tier.min_quantity}</td>
                                  <td className="py-2 pr-4">{tier.max_quantity ?? 'No limit'}</td>
                                  <td className="py-2 pr-4 text-right font-medium">{formatCurrency(tier.price_per_unit)}</td>
                                  <td className="py-2 pr-4 text-right text-green-600">{tier.discount_percent}%</td>
                                  <td className="py-2 text-right">
                                    <button className="text-destructive hover:underline" onClick={() => removeTier.mutate({ pricingId: p.id, tierId: tier.id })}>Remove</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Pricing' : 'Add Pricing'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); savePricing.mutate(); }} className="space-y-4">
            {!editingId && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Variant *</Label>
                  <button type="button" onClick={() => setVariantModalOpen(true)} className="text-xs font-medium text-brand hover:underline">+ Create Variant</button>
                </div>
                <SearchableSelect
                  placeholder="Search by product name, variant, or SKU..."
                  searchPlaceholder="Type to filter variants..."
                  value={form.variant}
                  onChange={(v) => setForm({ ...form, variant: v })}
                  options={(variants?.results || []).map((v) => ({
                    value: v.id,
                    label: `${v.product_name || 'Product'} — ${v.name}`,
                    subtitle: v.sku,
                  }))}
                />
                {/* Show selected variant's SKU */}
                {form.variant && (() => {
                  const selectedVariant = (variants?.results || []).find((v) => v.id === form.variant);
                  if (!selectedVariant?.sku) return null;
                  return (
                    <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 text-xs">
                      <span className="text-muted-foreground">SKU:</span>
                      <span className="font-mono font-semibold">{selectedVariant.sku}</span>
                    </div>
                  );
                })()}
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Warehouse *</Label>
              <SearchableSelect
                placeholder={warehouses && warehouses.length ? 'Search warehouses...' : 'Add a warehouse in your profile first'}
                searchPlaceholder="Type to search..."
                value={form.warehouse}
                onChange={(v) => setForm({ ...form, warehouse: v })}
                options={(warehouses || []).map((w) => ({
                  value: w.id,
                  label: w.name,
                  subtitle: w.city,
                }))}
                disabled={!warehouses || warehouses.length === 0}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Selling Price *</Label>
                <Input type="number" required value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label>Offer Price</Label>
                <Input type="number" value={form.offer_price} onChange={(e) => setForm({ ...form, offer_price: e.target.value })} placeholder="Optional" />
              </div>
              <div className="space-y-1.5">
                <Label>MOQ</Label>
                <Input type="number" min="1" value={form.minimum_order_quantity} onChange={(e) => setForm({ ...form, minimum_order_quantity: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>GST %</Label>
                <Input type="number" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Delivery (days)</Label>
                <Input type="number" value={form.delivery_time_days} onChange={(e) => setForm({ ...form, delivery_time_days: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Shipping Charge</Label>
                <Input type="number" disabled={form.free_shipping} value={form.shipping_charge} onChange={(e) => setForm({ ...form, shipping_charge: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.free_shipping} onChange={(e) => setForm({ ...form, free_shipping: e.target.checked })} className="h-4 w-4" />
                Free shipping
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4" />
                Active
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={savePricing.isPending} disabled={(!editingId && !form.variant) || !form.warehouse || !form.selling_price}>
                {editingId ? 'Save' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Variant Modal */}
      <Dialog open={variantModalOpen} onClose={() => setVariantModalOpen(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Variant</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createVariantMutation.mutate(); }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Product *</Label>
              <SearchableSelect
                placeholder="Search products by name or SKU..."
                searchPlaceholder="Type to search products..."
                value={variantForm.product}
                onChange={(v) => setVariantForm({ ...variantForm, product: v, sku: '' })}
                options={(productsData?.results || []).map((p) => ({
                  value: p.id,
                  label: p.name,
                  subtitle: p.sku,
                }))}
                header={(() => {
                  const selectedProduct = (productsData?.results || []).find((p) => p.id === variantForm.product);
                  if (!selectedProduct) return null;
                  return (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Product SKU:</span>
                      <span className="font-mono font-semibold text-brand">{selectedProduct.sku}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-xs text-muted-foreground">Use as base for variant SKU</span>
                    </div>
                  );
                })()}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Variant Name *</Label>
              <Input required value={variantForm.name} onChange={(e) => {
                const name = e.target.value;
                // Auto-generate SKU from product SKU + variant name
                const selectedProduct = (productsData?.results || []).find((p) => p.id === variantForm.product);
                let autoSku = variantForm.sku;
                if (selectedProduct && !variantForm.sku) {
                  // First time typing — generate from product SKU
                  const suffix = name.trim().toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
                  autoSku = suffix ? `${selectedProduct.sku}-${suffix}` : selectedProduct.sku;
                }
                setVariantForm({ ...variantForm, name, sku: autoSku });
              }} placeholder="e.g. 16GB/512GB, Blue, Large" />
            </div>
            <div className="space-y-1.5">
              <Label>SKU *</Label>
              <Input required value={variantForm.sku} onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value.toUpperCase() })} placeholder="e.g. DELL-LAT-5540-16-512" className="font-mono" />
              <p className="text-[11px] text-muted-foreground">Variant SKU should be similar to product SKU for easy identification</p>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={variantForm.description} onChange={(e) => setVariantForm({ ...variantForm, description: e.target.value })} placeholder="Optional description" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setVariantModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={createVariantMutation.isPending} disabled={!variantForm.product || !variantForm.name || !variantForm.sku}>
                Create Variant
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Variant Image Manager Modal */}
      <ImageManagerModal
        open={!!imageVariant}
        onClose={() => setImageVariant(null)}
        targetType="variant"
        targetId={imageVariant?.id || ''}
        targetName={imageVariant?.name || ''}
        images={variantImages}
        queryKey={['seller-variant-images', imageVariant?.id || '']}
      />
    </div>
  );
}
