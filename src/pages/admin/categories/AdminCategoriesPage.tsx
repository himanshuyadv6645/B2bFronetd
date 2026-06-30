import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { SmartImage } from '@/components/common/SmartImage';
import { getCategoryImage } from '@/lib/images';
import toast from 'react-hot-toast';
import { FiSearch, FiGrid, FiPlus, FiChevronRight, FiChevronDown, FiTrash2 } from 'react-icons/fi';
import type { Category } from '@/types/product';

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

const emptyForm = { name: '', description: '', parent: '', sort_order: 0 };

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories', search],
    queryFn: () => productService.getCategories({ search, page_size: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      productService.createCategory({
        name: form.name,
        slug: slugify(form.name),
        description: form.description || null,
        parent: form.parent || null,
        sort_order: Number(form.sort_order) || 0,
      } as Partial<Category>),
    onSuccess: () => {
      toast.success('Category created');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setOpen(false);
      setForm(emptyForm);
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || 'Failed to create category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => productService.deleteCategory(slug),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: () => toast.error('Failed to delete category'),
  });

  const categories = data?.results || [];
  const topLevel = categories.filter((c) => !c.parent);
  const childrenOf = (parentId: string) => categories.filter((c) => c.parent === parentId);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">{data?.count ?? categories.length} categories total</p>
        </div>
        <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
          <FiPlus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <PageLoading />
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FiGrid className="h-8 w-8 text-muted-foreground" />}
              title="No categories found"
              description={search ? 'Try a different search' : 'Create categories to organize products'}
              action={!search ? { label: 'Add Category', onClick: () => setOpen(true) } : undefined}
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
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Level</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Products</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topLevel.map((cat) => {
                      const kids = childrenOf(cat.id);
                      const isExpanded = expanded.has(cat.id);
                      return (
                        <Fragment key={cat.id}>
                          <tr className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                  <SmartImage src={getCategoryImage(cat.name)} alt={cat.name} name={cat.name} rounded="md" objectFit="cover" className="w-full h-full" />
                                </div>
                                <div className="flex items-center gap-2 min-w-0">
                                  {kids.length > 0 && (
                                    <button onClick={() => toggleExpand(cat.id)} className="p-0.5 hover:bg-muted rounded">
                                      {isExpanded ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
                                    </button>
                                  )}
                                  <div>
                                    <p className="font-medium text-sm">{cat.name}</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{cat.description || 'No description'}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center text-sm">Level {cat.level}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant={cat.is_active ? 'success' : 'destructive'} className="text-xs">
                                {cat.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-center text-sm">{cat.product_count || 0}</td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm(`Delete category "${cat.name}"?`)) deleteMutation.mutate(cat.slug); }}>
                                <FiTrash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                          {isExpanded && kids.map((kid) => (
                            <tr key={kid.id} className="border-b bg-muted/20 hover:bg-muted/40 transition-colors">
                              <td className="py-2 px-4 pl-12">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded overflow-hidden bg-muted flex-shrink-0">
                                    <SmartImage src={getCategoryImage(kid.name)} alt={kid.name} name={kid.name} rounded="md" objectFit="cover" className="w-full h-full" />
                                  </div>
                                  <span className="text-sm">{kid.name}</span>
                                </div>
                              </td>
                              <td className="py-2 px-4 text-center text-sm">Level {kid.level}</td>
                              <td className="py-2 px-4 text-center">
                                <Badge variant={kid.is_active ? 'success' : 'destructive'} className="text-xs">{kid.is_active ? 'Active' : 'Inactive'}</Badge>
                              </td>
                              <td className="py-2 px-4 text-center text-sm">{kid.product_count || 0}</td>
                              <td className="py-2 px-4 text-right">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm(`Delete category "${kid.name}"?`)) deleteMutation.mutate(kid.slug); }}>
                                  <FiTrash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
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
            {topLevel.map((cat) => {
              const kids = childrenOf(cat.id);
              const isExpanded = expanded.has(cat.id);
              return (
                <Card key={cat.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <SmartImage src={getCategoryImage(cat.name)} alt={cat.name} name={cat.name} rounded="lg" objectFit="cover" className="w-full h-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {kids.length > 0 && (
                            <button onClick={() => toggleExpand(cat.id)} className="p-0.5 hover:bg-muted rounded">
                              {isExpanded ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
                            </button>
                          )}
                          <h3 className="text-sm font-medium">{cat.name}</h3>
                        </div>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{cat.description || 'No description'}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <Badge variant={cat.is_active ? 'success' : 'destructive'} className="text-[10px]">{cat.is_active ? 'Active' : 'Inactive'}</Badge>
                          <span className="text-[11px] text-muted-foreground">Level {cat.level}</span>
                          <span className="text-[11px] text-muted-foreground">{cat.product_count || 0} products</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive flex-shrink-0" onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteMutation.mutate(cat.slug); }}>
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {isExpanded && kids.length > 0 && (
                      <div className="mt-3 space-y-2 border-t pt-3 pl-13">
                        {kids.map((kid) => (
                          <div key={kid.id} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded bg-muted">
                                <SmartImage src={getCategoryImage(kid.name)} alt={kid.name} name={kid.name} rounded="md" objectFit="cover" className="w-full h-full" />
                              </div>
                              <span className="text-xs truncate">{kid.name}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant={kid.is_active ? 'success' : 'destructive'} className="text-[9px]">{kid.is_active ? 'Active' : 'Inactive'}</Badge>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => { if (confirm(`Delete "${kid.name}"?`)) deleteMutation.mutate(kid.slug); }}>
                                <FiTrash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name *</Label>
              <Input id="cat-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. CCTV Cameras" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-parent">Parent category</Label>
              <Select
                id="cat-parent"
                placeholder="None (top level)"
                value={form.parent}
                onChange={(e) => setForm({ ...form, parent: e.target.value })}
                options={[
                  { value: '', label: 'None (top level)' },
                  ...topLevel.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea id="cat-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-sort">Sort order</Label>
              <Input id="cat-sort" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
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
