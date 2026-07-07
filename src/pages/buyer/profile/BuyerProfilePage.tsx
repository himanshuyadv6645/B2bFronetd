import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buyerService } from '@/services/buyer.service';
import type { BuyerProfile } from '@/types/buyer';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiUser, FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useState } from 'react';

export default function BuyerProfilePage() {
  const queryClient = useQueryClient();
  const [showAddressForm, setShowAddressForm] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['buyer-profile'],
    queryFn: () => buyerService.getProfile(),
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['buyer-addresses'],
    queryFn: () => buyerService.getAddresses(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<NonNullable<typeof profile>>) => buyerService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-profile'] });
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const createAddressMutation = useMutation({
    mutationFn: (data: Parameters<typeof buyerService.createAddress>[0]) => buyerService.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-addresses'] });
      toast.success('Address added');
      setShowAddressForm(false);
    },
    onError: () => toast.error('Failed to add address'),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => buyerService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-addresses'] });
      toast.success('Address deleted');
    },
    onError: () => toast.error('Failed to delete address'),
  });

  const { register, handleSubmit } = useForm({
    values: profile ? {
      company_name: profile.company_name || '',
      business_type: profile.business_type || '',
      gst_number: profile.gst_number || '',
      pan_number: profile.pan_number || '',
      website: profile.website || '',
      description: profile.description || '',
    } : undefined,
  });

  const { register: registerAddress, handleSubmit: handleAddressSubmit, reset: resetAddressForm } = useForm({
    defaultValues: {
      label: 'Office', contact_name: '', contact_phone: '', address_line1: '', city: '', state: '', pincode: '',
    },
  });

  if (profileLoading) return <PageLoading />;

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Buyer Profile</h1>

      {/* Profile Form */}
      <Card>
        <div className="p-4 sm:p-6 border-b">
          <h2 className="font-semibold flex items-center gap-2"><FiUser className="h-4 w-4" /> Business Information</h2>
        </div>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit((data) => updateMutation.mutate(data as Partial<BuyerProfile>))} className="space-y-4">
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
                <Input {...register('gst_number')} />
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

      {/* Addresses */}
      <Card>
        <div className="p-4 sm:p-6 border-b flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2"><FiMapPin className="h-4 w-4" /> Addresses</h2>
          <Button size="sm" onClick={() => setShowAddressForm(!showAddressForm)}>
            <FiPlus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
        <CardContent className="p-4 sm:p-6">
          {showAddressForm && (
            <form onSubmit={handleAddressSubmit((data) => {
              createAddressMutation.mutate({
                ...data,
                address_line2: null,
                address_type: 'shipping',
                country: 'India',
                latitude: null,
                longitude: null,
                is_default: false,
              });
              resetAddressForm();
            })} className="mb-4 p-4 border rounded-lg space-y-3 bg-muted/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Label (Home/Office)" {...registerAddress('label')} />
                <Input placeholder="Contact name" {...registerAddress('contact_name', { required: true })} />
                <Input placeholder="Phone" {...registerAddress('contact_phone', { required: true })} />
                <Input placeholder="Address" className="sm:col-span-2" {...registerAddress('address_line1', { required: true })} />
                <Input placeholder="City" {...registerAddress('city', { required: true })} />
                <Input placeholder="State" {...registerAddress('state', { required: true })} />
                <Input placeholder="Pincode" {...registerAddress('pincode', { required: true })} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" isLoading={createAddressMutation.isPending}>Create</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowAddressForm(false)}>Cancel</Button>
              </div>
            </form>
          )}

          {addressesLoading ? (
            <p className="text-sm text-muted-foreground">Loading addresses...</p>
          ) : !addresses || addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No addresses added yet</p>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <div key={addr.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{addr.label}</p>
                      {addr.is_default && <Badge variant="secondary" className="text-[10px]">Default</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{addr.contact_name} | {addr.contact_phone}</p>
                    <p className="text-xs text-muted-foreground">{addr.address_line1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                    if (confirm('Delete this address?')) deleteAddressMutation.mutate(addr.id);
                  }}>
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
