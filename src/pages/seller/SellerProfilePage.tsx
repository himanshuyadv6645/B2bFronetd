import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerService } from '@/services/seller.service';
import type { SellerProfile } from '@/types/seller';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiUser, FiCheck, FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useState } from 'react';

export default function SellerProfilePage() {
  const queryClient = useQueryClient();
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['seller-profile'],
    queryFn: () => sellerService.getProfile(),
  });

  const { data: warehouses, isLoading: warehousesLoading } = useQuery({
    queryKey: ['seller-warehouses'],
    queryFn: () => sellerService.getWarehouses(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<NonNullable<typeof profile>>) => sellerService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-profile'] });
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const createWarehouseMutation = useMutation({
    mutationFn: (data: Parameters<typeof sellerService.createWarehouse>[0]) => sellerService.createWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-warehouses'] });
      toast.success('Warehouse created');
      setShowWarehouseForm(false);
    },
    onError: () => toast.error('Failed to create warehouse'),
  });

  const deleteWarehouseMutation = useMutation({
    mutationFn: (id: string) => sellerService.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-warehouses'] });
      toast.success('Warehouse deleted');
    },
    onError: () => toast.error('Failed to delete warehouse'),
  });

  const { register, handleSubmit } = useForm({
    values: profile ? {
      company_name: profile.company_name || '',
      business_type: profile.business_type || '',
      gstin: profile.gstin || '',
      pan_number: profile.pan_number || '',
      website: profile.website || '',
      description: profile.description || '',
    } : undefined,
  });

  const { register: registerWarehouse, handleSubmit: handleWarehouseSubmit, reset: resetWarehouseForm } = useForm({
    defaultValues: {
      name: '', contact_phone: '', address_line1: '', city: '', state: '', pincode: '',
    },
  });

  if (profileLoading) return <PageLoading />;

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Seller Profile</h1>
        {profile?.status && (
          <Badge variant={
            profile.status === 'approved' ? 'success' :
            profile.status === 'rejected' ? 'destructive' : 'warning'
          } className="flex items-center gap-1 capitalize">
            <FiCheck className="h-3 w-3" /> {profile.status}
          </Badge>
        )}
      </div>

      {/* Profile Form */}
      <Card>
        <div className="p-4 sm:p-6 border-b">
          <h2 className="font-semibold flex items-center gap-2"><FiUser className="h-4 w-4" /> Business Information</h2>
        </div>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit((data) => updateMutation.mutate(data as Partial<SellerProfile>))} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Company Name</Label>
                <Input {...register('company_name')} />
              </div>
              <div className="space-y-1.5">
                <Label>Business Type</Label>
                <Input {...register('business_type')} />
              </div>
              <div className="space-y-1.5">
                <Label>GST Number</Label>
                <Input {...register('gstin')} />
              </div>
              <div className="space-y-1.5">
                <Label>PAN Number</Label>
                <Input {...register('pan_number')} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Website</Label>
                <Input {...register('website')} placeholder="https://" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Description</Label>
                <textarea {...register('description')} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <Button type="submit" isLoading={updateMutation.isPending}>Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      {/* Warehouses */}
      <Card>
        <div className="p-4 sm:p-6 border-b flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2"><FiMapPin className="h-4 w-4" /> Warehouses</h2>
          <Button size="sm" onClick={() => setShowWarehouseForm(!showWarehouseForm)}>
            <FiPlus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
        <CardContent className="p-4 sm:p-6">
          {showWarehouseForm && (
            <form onSubmit={handleWarehouseSubmit((data) => {
              createWarehouseMutation.mutate({
                ...data,
                address_line2: null,
                country: 'India',
                is_active: true,
                is_primary: false,
              });
              resetWarehouseForm();
            })} className="mb-4 p-4 border rounded-lg space-y-3 bg-muted/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Warehouse name" {...registerWarehouse('name', { required: true })} />
                <Input placeholder="Phone" {...registerWarehouse('contact_phone', { required: true })} />
                <Input placeholder="Address" className="sm:col-span-2" {...registerWarehouse('address_line1', { required: true })} />
                <Input placeholder="City" {...registerWarehouse('city', { required: true })} />
                <Input placeholder="State" {...registerWarehouse('state', { required: true })} />
                <Input placeholder="Pincode" {...registerWarehouse('pincode', { required: true })} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" isLoading={createWarehouseMutation.isPending}>Create</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowWarehouseForm(false)}>Cancel</Button>
              </div>
            </form>
          )}

          {warehousesLoading ? (
            <p className="text-sm text-muted-foreground">Loading warehouses...</p>
          ) : !warehouses || warehouses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No warehouses added yet</p>
          ) : (
            <div className="space-y-2">
              {warehouses.map((wh) => (
                <div key={wh.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{wh.name} {wh.is_primary && <Badge variant="secondary" className="text-[10px] ml-1">Primary</Badge>}</p>
                    <p className="text-xs text-muted-foreground">{wh.address_line1}, {wh.city}, {wh.state} - {wh.pincode}</p>
                  </div>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                    onClick={() => {
                      if (confirm('Delete this warehouse?')) deleteWarehouseMutation.mutate(wh.id);
                    }}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
