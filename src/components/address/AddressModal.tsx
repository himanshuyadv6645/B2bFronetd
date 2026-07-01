import { useState, useEffect } from 'react';
import { useAddress } from '@/contexts/AddressContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { FiX, FiMapPin, FiEdit2, FiTrash2, FiStar, FiPlus, FiCrosshair } from 'react-icons/fi';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
  'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
];

const ADDRESS_TYPES = [
  { value: 'home', label: 'Home' },
  { value: 'office', label: 'Office' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'other', label: 'Other' },
] as const;

type View = 'list' | 'form' | 'delete';

interface AddressForm {
  label: string;
  contact_name: string;
  contact_phone: string;
  address_line1: string;
  address_line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  address_type: string;
  is_default: boolean;
}

const emptyForm: AddressForm = {
  label: '',
  contact_name: '',
  contact_phone: '',
  address_line1: '',
  address_line2: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  address_type: 'home',
  is_default: false,
};

export function AddressModal() {
  const {
    addresses,
    selectedAddress,
    isModalOpen,
    closeModal,
    selectAddress,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    isDetectingLocation,
    detectAndSaveLocation,
  } = useAddress();

  const [view, setView] = useState<View>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setView('list');
      setEditingId(null);
      setDeletingId(null);
      setForm(emptyForm);
      setErrors({});
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (editingId) {
      const addr = addresses.find((a) => a.id === editingId);
      if (addr) {
        setForm({
          label: addr.label || '',
          contact_name: addr.contact_name || '',
          contact_phone: addr.contact_phone || '',
          address_line1: addr.address_line1 || '',
          address_line2: addr.address_line2 || '',
          landmark: '',
          city: addr.city || '',
          state: addr.state || '',
          pincode: addr.pincode || '',
          country: addr.country || 'India',
          address_type: addr.address_type || 'shipping',
          is_default: addr.is_default || false,
        });
        setView('form');
      }
    }
  }, [editingId, addresses]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AddressForm, string>> = {};
    if (!form.contact_name.trim()) newErrors.contact_name = 'Name is required';
    if (!form.contact_phone.trim()) newErrors.contact_phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.contact_phone.trim())) newErrors.contact_phone = 'Enter 10 digits';
    if (!form.address_line1.trim()) newErrors.address_line1 = 'Address is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.pincode.trim()) newErrors.pincode = 'PIN is required';
    else if (!/^\d{6}$/.test(form.pincode.trim())) newErrors.pincode = 'Enter 6 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        label: form.label || form.address_type,
        contact_name: form.contact_name.trim(),
        contact_phone: form.contact_phone.trim(),
        address_line1: form.address_line1.trim(),
        address_line2: form.address_line2.trim() || null,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: form.country.trim() || 'India',
        address_type: form.address_type as 'billing' | 'shipping',
        latitude: null,
        longitude: null,
        is_default: form.is_default,
      };

      if (editingId) {
        await updateAddress(editingId, payload);
        toast.success('Address updated');
      } else {
        await createAddress(payload);
        toast.success('Address added');
      }
      setView('list');
      setEditingId(null);
      setForm(emptyForm);
    } catch {
      toast.error(editingId ? 'Failed to update address' : 'Failed to add address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteAddress(deletingId);
      toast.success('Address deleted');
      setView('list');
      setDeletingId(null);
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      toast.success('Default address updated');
    } catch {
      toast.error('Failed to update default address');
    }
  };

  const updateField = (field: keyof AddressForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

      {/* Modal — bottom sheet on mobile, centered on desktop */}
      <div className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FiMapPin className="h-5 w-5 text-brand" />
            <h2 className="text-base font-bold sm:text-lg">
              {view === 'list' ? 'Select Delivery Address' : view === 'delete' ? 'Delete Address' : editingId ? 'Edit Address' : 'Add New Address'}
            </h2>
          </div>
          <button onClick={closeModal} className="rounded-lg p-1.5 hover:bg-muted transition-colors" aria-label="Close">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* LIST VIEW */}
          {view === 'list' && (
            <div className="p-4 sm:p-6 space-y-3">
              {/* Use Current Location button */}
              <button
                onClick={async () => {
                  await detectAndSaveLocation();
                }}
                disabled={isDetectingLocation}
                className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-brand/30 bg-brand/5 p-4 text-left transition-all hover:border-brand hover:bg-brand/10 disabled:opacity-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                  <FiCrosshair className={`h-5 w-5 text-brand ${isDetectingLocation ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand">
                    {isDetectingLocation ? 'Detecting location...' : 'Use Current Location'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isDetectingLocation ? 'Please allow location access in the browser popup' : 'Auto-fill your delivery area using GPS'}
                  </p>
                </div>
              </button>

              {/* Location permission help */}
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                <p className="font-semibold mb-1">If location is denied:</p>
                <p>Click 🔒 lock icon in address bar → Find "Location" → Set to "Allow"</p>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <FiMapPin className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground mb-4">No saved addresses yet</p>
                  <Button onClick={() => { setEditingId(null); setForm(emptyForm); setView('form'); }}>
                    <FiPlus className="mr-1 h-4 w-4" /> Add Address
                  </Button>
                </div>
              ) : (
                <>
                  {addresses.map((addr) => {
                    const isSelected = selectedAddress?.id === addr.id;
                    return (
                      <div
                        key={addr.id}
                        className={`relative rounded-xl border-2 p-3 sm:p-4 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-brand bg-brand/5'
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                        onClick={() => { selectAddress(addr); closeModal(); }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0">
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-brand' : 'border-gray-300'}`}>
                              {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-brand" />}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold">{addr.contact_name}</span>
                              {addr.is_default && (
                                <Badge variant="success" className="text-[9px] px-1.5 py-0">Default</Badge>
                              )}
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 capitalize">
                                {addr.label || addr.address_type}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {addr.address_line1}
                              {addr.address_line2 && <>, {addr.address_line2}</>}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Phone: {addr.contact_phone}</p>
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingId(addr.id); }}
                              className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              aria-label="Edit"
                            >
                              <FiEdit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingId(addr.id); setView('delete'); }}
                              className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                              aria-label="Delete"
                            >
                              <FiTrash2 className="h-3.5 w-3.5" />
                            </button>
                            {!addr.is_default && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSetDefault(addr.id); }}
                                className="rounded-lg p-1.5 hover:bg-amber-50 transition-colors text-muted-foreground hover:text-amber-600"
                                aria-label="Set as default"
                              >
                                <FiStar className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { setEditingId(null); setForm(emptyForm); setView('form'); }}
                  >
                    <FiPlus className="mr-1 h-4 w-4" /> Add New Address
                  </Button>
                </>
              )}
            </div>
          )}

          {/* FORM VIEW */}
          {view === 'form' && (
            <div className="p-4 sm:p-6 space-y-4">
              {/* Address Type */}
              <div>
                <Label className="text-xs font-semibold mb-2 block">Address Type</Label>
                <div className="flex flex-wrap gap-2">
                  {ADDRESS_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => updateField('address_type', t.value)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        form.address_type === t.value
                          ? 'border-brand bg-brand/5 text-brand'
                          : 'border-gray-200 text-muted-foreground hover:border-gray-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="addr-name" className="text-xs">Recipient Name *</Label>
                  <Input
                    id="addr-name"
                    value={form.contact_name}
                    onChange={(e) => updateField('contact_name', e.target.value)}
                    placeholder="Full name"
                    className={`mt-1 h-10 ${errors.contact_name ? 'border-destructive' : ''}`}
                  />
                  {errors.contact_name && <p className="mt-0.5 text-[11px] text-destructive">{errors.contact_name}</p>}
                </div>
                <div>
                  <Label htmlFor="addr-phone" className="text-xs">Phone *</Label>
                  <Input
                    id="addr-phone"
                    value={form.contact_phone}
                    onChange={(e) => updateField('contact_phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile"
                    className={`mt-1 h-10 ${errors.contact_phone ? 'border-destructive' : ''}`}
                  />
                  {errors.contact_phone && <p className="mt-0.5 text-[11px] text-destructive">{errors.contact_phone}</p>}
                </div>
              </div>

              {/* Address Lines */}
              <div>
                <Label htmlFor="addr-line1" className="text-xs">Address Line 1 *</Label>
                <Input
                  id="addr-line1"
                  value={form.address_line1}
                  onChange={(e) => updateField('address_line1', e.target.value)}
                  placeholder="House/Flat no., Building, Street"
                  className={`mt-1 h-10 ${errors.address_line1 ? 'border-destructive' : ''}`}
                />
                {errors.address_line1 && <p className="mt-0.5 text-[11px] text-destructive">{errors.address_line1}</p>}
              </div>
              <div>
                <Label htmlFor="addr-line2" className="text-xs">Address Line 2 (Optional)</Label>
                <Input
                  id="addr-line2"
                  value={form.address_line2}
                  onChange={(e) => updateField('address_line2', e.target.value)}
                  placeholder="Landmark, Area, Colony"
                  className="mt-1 h-10"
                />
              </div>

              {/* City, State, PIN */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="addr-city" className="text-xs">City *</Label>
                  <Input
                    id="addr-city"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="City"
                    className={`mt-1 h-10 ${errors.city ? 'border-destructive' : ''}`}
                  />
                  {errors.city && <p className="mt-0.5 text-[11px] text-destructive">{errors.city}</p>}
                </div>
                <div>
                  <Label htmlFor="addr-pincode" className="text-xs">PIN Code *</Label>
                  <Input
                    id="addr-pincode"
                    value={form.pincode}
                    onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6 digits"
                    className={`mt-1 h-10 ${errors.pincode ? 'border-destructive' : ''}`}
                  />
                  {errors.pincode && <p className="mt-0.5 text-[11px] text-destructive">{errors.pincode}</p>}
                </div>
              </div>

              {/* State */}
              <div>
                <Label htmlFor="addr-state" className="text-xs">State *</Label>
                <select
                  id="addr-state"
                  value={form.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className={`mt-1 flex h-10 w-full rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 ${errors.state ? 'border-destructive' : 'border-input'}`}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.state && <p className="mt-0.5 text-[11px] text-destructive">{errors.state}</p>}
              </div>

              {/* Default checkbox */}
              <label className="flex items-center gap-2 cursor-pointer rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => updateField('is_default', e.target.checked)}
                  className="filter-checkbox"
                />
                <span className="text-sm">Set as default delivery address</span>
              </label>

              {/* Buttons */}
              <div className="flex gap-3 pt-2 pb-4">
                <Button variant="outline" className="flex-1" onClick={() => { setView('list'); setEditingId(null); }}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSubmit} isLoading={isSubmitting}>
                  {editingId ? 'Update Address' : 'Save Address'}
                </Button>
              </div>
            </div>
          )}

          {/* DELETE CONFIRMATION */}
          {view === 'delete' && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="text-center py-4">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                  <FiTrash2 className="h-7 w-7 text-destructive" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete this address? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setView('list'); setDeletingId(null); }}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                  Delete Address
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
