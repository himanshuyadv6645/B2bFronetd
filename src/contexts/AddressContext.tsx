import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { buyerService } from '@/services/buyer.service';
import { detectLocationCoords, detectLocationViaIP, reverseGeocode, clearCachedLocation } from '@/services/location.service';
import type { BuyerAddress } from '@/types/buyer';
import toast from 'react-hot-toast';

const AUTH_ADDRESS_KEY = 'b2b_auth_selected_address';
const GUEST_ADDRESS_KEY = 'b2b_guest_selected_address';
const GUEST_ADDRESSES_KEY = 'b2b_guest_addresses';
const LOCATION_DETECTED_KEY = 'b2b_location_detected';

interface AddressContextType {
  addresses: BuyerAddress[];
  selectedAddress: BuyerAddress | null;
  isLoading: boolean;
  isModalOpen: boolean;
  isDetectingLocation: boolean;
  openModal: () => void;
  closeModal: () => void;
  selectAddress: (address: BuyerAddress) => void;
  createAddress: (data: Omit<BuyerAddress, 'id' | 'created_at' | 'updated_at' | 'user'>) => Promise<BuyerAddress>;
  updateAddress: (id: string, data: Partial<BuyerAddress>) => Promise<BuyerAddress>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  refreshAddresses: () => Promise<void>;
  detectAndSaveLocation: () => Promise<void>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

function getStoredAuthAddress(): BuyerAddress | null {
  try {
    const stored = localStorage.getItem(AUTH_ADDRESS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function setStoredAuthAddress(address: BuyerAddress | null) {
  if (address) {
    localStorage.setItem(AUTH_ADDRESS_KEY, JSON.stringify(address));
  } else {
    localStorage.removeItem(AUTH_ADDRESS_KEY);
  }
}

function getStoredGuestAddress(): BuyerAddress | null {
  try {
    const stored = localStorage.getItem(GUEST_ADDRESS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function setStoredGuestAddress(address: BuyerAddress | null) {
  if (address) {
    localStorage.setItem(GUEST_ADDRESS_KEY, JSON.stringify(address));
  } else {
    localStorage.removeItem(GUEST_ADDRESS_KEY);
  }
}

function getGuestAddresses(): BuyerAddress[] {
  try {
    const stored = localStorage.getItem(GUEST_ADDRESSES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setGuestAddresses(addresses: BuyerAddress[]) {
  localStorage.setItem(GUEST_ADDRESSES_KEY, JSON.stringify(addresses));
}

function generateGuestId(): string {
  return 'guest-' + crypto.randomUUID();
}

function hasLocationBeenDetected(): boolean {
  return localStorage.getItem(LOCATION_DETECTED_KEY) === 'true';
}

function markLocationDetected() {
  localStorage.setItem(LOCATION_DETECTED_KEY, 'true');
}

export function AddressProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isBuyer } = useAuth();

  useEffect(() => {
    localStorage.removeItem('b2b_selected_address');
  }, []);

  const [addresses, setAddresses] = useState<BuyerAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<BuyerAddress | null>(() => {
    const tokens = (() => {
      try {
        const stored = localStorage.getItem('b2b_tokens');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })();
    if (tokens) {
      return getStoredAuthAddress();
    }
    return getStoredGuestAddress();
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated && isBuyer) {
        const apiAddresses = await buyerService.getAddresses();
        setAddresses(apiAddresses);

        const stored = getStoredAuthAddress();
        if (stored) {
          const updated = apiAddresses.find((a) => a.id === stored.id);
          if (updated) {
            setSelectedAddress(updated);
            setStoredAuthAddress(updated);
          } else if (apiAddresses.length > 0) {
            const defaultAddr = apiAddresses.find((a) => a.is_default) || apiAddresses[0];
            setSelectedAddress(defaultAddr);
            setStoredAuthAddress(defaultAddr);
          } else {
            setSelectedAddress(null);
            setStoredAuthAddress(null);
          }
        } else if (apiAddresses.length > 0) {
          const defaultAddr = apiAddresses.find((a) => a.is_default) || apiAddresses[0];
          setSelectedAddress(defaultAddr);
          setStoredAuthAddress(defaultAddr);
        } else {
          setSelectedAddress(null);
          setStoredAuthAddress(null);
        }
      } else {
        const guestAddrs = getGuestAddresses();
        setAddresses(guestAddrs);

        const stored = getStoredGuestAddress();
        if (stored) {
          const found = guestAddrs.find((a) => a.id === stored.id);
          setSelectedAddress(found || stored);
        } else if (guestAddrs.length > 0) {
          const defaultAddr = guestAddrs.find((a) => a.is_default) || guestAddrs[0];
          setSelectedAddress(defaultAddr);
          setStoredGuestAddress(defaultAddr);
        } else {
          setSelectedAddress(null);
        }
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
      const guestAddrs = getGuestAddresses();
      setAddresses(guestAddrs);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isBuyer]);

  const prevAuthRef = useRef(isAuthenticated);

  useEffect(() => {
    const wasAuthenticated = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;

    if (wasAuthenticated && !isAuthenticated) {
      setStoredAuthAddress(null);
      setSelectedAddress(null);
      setAddresses([]);
      localStorage.removeItem(LOCATION_DETECTED_KEY);
    }

    loadAddresses();
  }, [isAuthenticated, isBuyer, loadAddresses]);

  // Sync guest addresses to backend after login
  useEffect(() => {
    if (isAuthenticated && isBuyer) {
      const guestAddrs = getGuestAddresses();
      if (guestAddrs.length > 0) {
        Promise.all(
          guestAddrs.map((addr) =>
            buyerService.createAddress({
              address_type: addr.address_type,
              label: addr.label,
              contact_name: addr.contact_name,
              contact_phone: addr.contact_phone,
              address_line1: addr.address_line1,
              address_line2: addr.address_line2,
              city: addr.city,
              state: addr.state,
              pincode: addr.pincode,
              country: addr.country,
              latitude: addr.latitude,
              longitude: addr.longitude,
              is_default: addr.is_default,
            })
          )
        ).then(() => {
          localStorage.removeItem(GUEST_ADDRESSES_KEY);
          loadAddresses();
        }).catch(() => {});
      }
    }
  }, [isAuthenticated, isBuyer, loadAddresses]);

  const detectAndSaveLocation = useCallback(async () => {
    setIsDetectingLocation(true);
    try {
      // 1. Get coordinates. detectLocationCoords(true) triggers the browser's
      //    native permission prompt. Distinguish an explicit denial (code 1) from
      //    a transient failure (unavailable/timeout) — only fall back to coarse IP
      //    geolocation for the latter, so we never mask a denial with a wrong city.
      let coords;
      try {
        coords = await detectLocationCoords(true);
      } catch (geoErr: any) {
        if (geoErr?.code === 1) {
          toast.error('Location access blocked. Click the 🔒 lock icon in the address bar → Location → Allow, then try again.', { duration: 7000 });
          return;
        }
        try {
          coords = await detectLocationViaIP();
        } catch {
          toast.error('Could not detect your location. Please enter your address manually.', { duration: 5000 });
          return;
        }
      }

      // 2. Turn coordinates into a saved delivery address.
      if (isAuthenticated && isBuyer) {
        // Authenticated buyer → backend reverse-geocodes and persists the address.
        const savedAddress = await buyerService.saveDetectedLocation(coords);
        const apiAddresses = await buyerService.getAddresses();
        setAddresses(apiAddresses);
        setSelectedAddress(savedAddress);
        setStoredAuthAddress(savedAddress);
        markLocationDetected();
        toast.success(`Location set: ${[savedAddress.city, savedAddress.state].filter(Boolean).join(', ')}`);
      } else {
        // Guest → reverse-geocode client-side and save to guest storage.
        const geo = await reverseGeocode(coords);
        if (!geo.city && !geo.state && !geo.pincode) {
          toast.error('Could not determine your address. Please enter it manually.', { duration: 5000 });
          return;
        }
        const guestAddr = {
          id: generateGuestId(),
          address_type: 'shipping',
          label: 'Current Location',
          contact_name: '',
          contact_phone: '',
          address_line1: geo.address_line1,
          address_line2: null,
          city: geo.city,
          state: geo.state,
          pincode: geo.pincode,
          country: geo.country,
          latitude: coords.latitude,
          longitude: coords.longitude,
          is_default: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as BuyerAddress;

        // Replace any previous "Current Location" entry so it doesn't pile up.
        const updated = [guestAddr, ...getGuestAddresses().filter((a) => a.label !== 'Current Location')];
        setAddresses(updated);
        setGuestAddresses(updated);
        setSelectedAddress(guestAddr);
        setStoredGuestAddress(guestAddr);
        markLocationDetected();
        toast.success(`Location set: ${[geo.city, geo.state].filter(Boolean).join(', ')}`);
      }
    } catch (err: any) {
      toast.error('Could not detect location. Please enter your address manually.', { duration: 5000 });
    } finally {
      setIsDetectingLocation(false);
    }
  }, [isAuthenticated, isBuyer]);

  const selectAddress = useCallback((address: BuyerAddress) => {
    setSelectedAddress(address);
    if (isAuthenticated && isBuyer) {
      setStoredAuthAddress(address);
    } else {
      setStoredGuestAddress(address);
    }
  }, [isAuthenticated, isBuyer]);

  const createAddress = useCallback(async (data: Omit<BuyerAddress, 'id' | 'created_at' | 'updated_at' | 'user'>): Promise<BuyerAddress> => {
    if (isAuthenticated && isBuyer) {
      const newAddr = await buyerService.createAddress(data);
      setAddresses((prev) => [...prev, newAddr]);
      if (data.is_default || addresses.length === 0) {
        setSelectedAddress(newAddr);
        setStoredAuthAddress(newAddr);
      }
      return newAddr;
    } else {
      const guestAddr = {
        id: generateGuestId(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as BuyerAddress;
      const updated = [...addresses, guestAddr];
      setAddresses(updated);
      setGuestAddresses(updated);
      if (data.is_default || addresses.length === 0) {
        setSelectedAddress(guestAddr);
        setStoredGuestAddress(guestAddr);
      }
      return guestAddr;
    }
  }, [isAuthenticated, isBuyer, addresses.length]);

  const updateAddress = useCallback(async (id: string, data: Partial<BuyerAddress>): Promise<BuyerAddress> => {
    if (isAuthenticated && isBuyer) {
      const updated = await buyerService.updateAddress(id, data);
      setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)));
      if (selectedAddress?.id === id) {
        setSelectedAddress(updated);
        setStoredAuthAddress(updated);
      }
      return updated;
    } else {
      const updatedAddr = addresses.find((a) => a.id === id);
      if (!updatedAddr) throw new Error('Address not found');
      const merged = { ...updatedAddr, ...data, updated_at: new Date().toISOString() } as BuyerAddress;
      const updatedList = addresses.map((a) => (a.id === id ? merged : a));
      setAddresses(updatedList);
      setGuestAddresses(updatedList);
      if (selectedAddress?.id === id) {
        setSelectedAddress(merged);
        setStoredGuestAddress(merged);
      }
      return merged;
    }
  }, [isAuthenticated, isBuyer, addresses, selectedAddress]);

  const deleteAddress = useCallback(async (id: string) => {
    if (isAuthenticated && isBuyer) {
      await buyerService.deleteAddress(id);
      const refreshed = await buyerService.getAddresses();
      setAddresses(refreshed);
      if (selectedAddress?.id === id) {
        const next = refreshed.find((a) => a.is_default) || refreshed[0] || null;
        setSelectedAddress(next ?? null);
        setStoredAuthAddress(next);
      }
    } else {
      const remaining = addresses.filter((a) => a.id !== id);
      setAddresses(remaining);
      setGuestAddresses(remaining);
      if (selectedAddress?.id === id) {
        const next = remaining.find((a) => a.is_default) || remaining[0] || null;
        setSelectedAddress(next ?? null);
        setStoredGuestAddress(next);
      }
    }
  }, [isAuthenticated, isBuyer, addresses, selectedAddress]);

  const setDefaultAddress = useCallback(async (id: string) => {
    if (isAuthenticated && isBuyer) {
      await buyerService.setDefaultAddress(id);
      const refreshed = await buyerService.getAddresses();
      setAddresses(refreshed);
      const defaultAddr = refreshed.find((a) => a.id === id) || refreshed.find((a) => a.is_default) || null;
      setSelectedAddress(defaultAddr);
      setStoredAuthAddress(defaultAddr);
    } else {
      const updatedList = addresses.map((a) => ({
        ...a,
        is_default: a.id === id,
      }));
      setAddresses(updatedList);
      setGuestAddresses(updatedList);
      const defaultAddr = updatedList.find((a) => a.id === id) || null;
      setSelectedAddress(defaultAddr);
      setStoredGuestAddress(defaultAddr);
    }
  }, [isAuthenticated, isBuyer, addresses]);

  return (
    <AddressContext.Provider
      value={{
        addresses,
        selectedAddress,
        isLoading,
        isModalOpen,
        isDetectingLocation,
        openModal: () => setIsModalOpen(true),
        closeModal: () => setIsModalOpen(false),
        selectAddress,
        createAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        refreshAddresses: loadAddresses,
        detectAndSaveLocation,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
}
