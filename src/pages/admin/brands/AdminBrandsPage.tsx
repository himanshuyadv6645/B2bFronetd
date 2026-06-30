import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { SmartImage } from '@/components/common/SmartImage';
import { getBrandImage } from '@/lib/images';
import toast from 'react-hot-toast';
import { FiSearch, FiTag, FiPlus, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import type { Brand } from '@/types/product';

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

const emptyForm = { name: '', description: '', website: '', is_featured: false, sort_order: 0 };

export default function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-brands', search],
    queryFn: () => productService.getBrands({ search, page_size: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      productService.createBrand({
        name: form.name,
        slug: slugify(form.name),
        description: form.description || null,
        website: form.website || null,
        is_featured: form.is_featured,
        sort_order: Number(form.sort_order) || 0,
      } as Partial<Brand>),
    onSuccess: () => {
      toast.success('Brand created');
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      setOpen(false);
      setForm(emptyForm);
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || 'Failed to create brand'),
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => productService.deleteBrand(slug),
    onSuccess: () => {
      toast.success('Brand deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
    },
    onError: () => toast.error('Failed to delete brand'),
  });

  const brands = data?.results || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Brands</h1>
          <p className="text-sm text-muted-foreground">{data?.count ?? brands.length} brands total</p>
        </div>
        <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
          <FiPlus className="mr-2 h-4 w-4" /> Add Brand
        </Button>
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search brands..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <PageLoading />
      ) : brands.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FiTag className="h-8 w-8 text-muted-foreground" />}
              title="No brands found"
              description={search ? 'Try a different search' : 'Add brands to categorize products'}
              action={!search ? { label: 'Add Brand', onClick: () => setOpen(true) } : undefined}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <Card key={brand.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <SmartImage
                      src={brand.logo || getBrandImage(brand.name)}
                      alt={brand.name}
                      name={brand.name}
                      rounded="lg"
                      objectFit="cover"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{brand.name}</h3>
                      <Badge variant={brand.is_active ? 'success' : 'destructive'} className="text-[10px]">
                        {brand.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {brand.is_featured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}
                    </div>
                    {brand.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{brand.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{brand.product_count || 0} products</span>
                      {brand.website && (
                        <a href={brand.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 hover:text-brand">
                          Website <FiExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => { if (confirm(`Delete brand "${brand.name}"?`)) deleteMutation.mutate(brand.slug); }}
                    className="p-1.5 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                    title="Delete brand"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Brand</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="brand-name">Name *</Label>
              <Input id="brand-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Hikvision" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand-desc">Description</Label>
              <Textarea id="brand-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand-web">Website</Label>
              <Input id="brand-web" type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex items-end gap-4">
              <div className="space-y-1.5 flex-1">
                <Label htmlFor="brand-sort">Sort order</Label>
                <Input id="brand-sort" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
              <label className="flex items-center gap-2 text-sm h-10">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="h-4 w-4" />
                Featured
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={createMutation.isPending} disabled={!form.name.trim()}>Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
