import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { productService } from '@/services/product.service';
import type { Category } from '@/types/product';

// Static fallback categories with correct database slugs
const FALLBACK_CATEGORIES: Category[] = [
  { id: 'cameras-photography', name: 'Cameras & Photography', slug: 'cameras-photography', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/cameras-photography', is_active: true, is_featured: false, sort_order: 0, created_at: '', updated_at: '' },
  { id: 'cctv-surveillance', name: 'CCTV & Surveillance', slug: 'cctv-surveillance', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/cctv-surveillance', is_active: true, is_featured: false, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'computer-peripherals', name: 'Computer Peripherals', slug: 'computer-peripherals', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/computer-peripherals', is_active: true, is_featured: false, sort_order: 2, created_at: '', updated_at: '' },
  { id: 'desktops-monitors', name: 'Desktops & Monitors', slug: 'desktops-monitors', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/desktops-monitors', is_active: true, is_featured: false, sort_order: 3, created_at: '', updated_at: '' },
  { id: 'laptops', name: 'Laptops', slug: 'laptops', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/laptops', is_active: true, is_featured: true, sort_order: 4, created_at: '', updated_at: '' },
  { id: 'printers-scanners', name: 'Printers & Scanners', slug: 'printers-scanners', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/printers-scanners', is_active: true, is_featured: false, sort_order: 5, created_at: '', updated_at: '' },
  { id: 'networking', name: 'Networking', slug: 'networking', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/networking', is_active: true, is_featured: true, sort_order: 6, created_at: '', updated_at: '' },
  { id: 'storage-memory', name: 'Storage & Memory', slug: 'storage-memory', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/storage-memory', is_active: true, is_featured: false, sort_order: 7, created_at: '', updated_at: '' },
  { id: 'computer-components', name: 'Computer Components', slug: 'computer-components', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/computer-components', is_active: true, is_featured: true, sort_order: 8, created_at: '', updated_at: '' },
  { id: 'audio-video', name: 'Audio & Video', slug: 'audio-video', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/audio-video', is_active: true, is_featured: false, sort_order: 9, created_at: '', updated_at: '' },
  { id: 'power-ups', name: 'Power & UPS', slug: 'power-ups', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/power-ups', is_active: true, is_featured: true, sort_order: 10, created_at: '', updated_at: '' },
  { id: 'industrial-electronics', name: 'Industrial Electronics', slug: 'industrial-electronics', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/industrial-electronics', is_active: true, is_featured: false, sort_order: 11, created_at: '', updated_at: '' },
  { id: 'automation-iot', name: 'Automation & IoT', slug: 'automation-iot', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/automation-iot', is_active: true, is_featured: false, sort_order: 12, created_at: '', updated_at: '' },
  { id: 'mobile-accessories', name: 'Mobile & Accessories', slug: 'mobile-accessories', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/mobile-accessories', is_active: true, is_featured: false, sort_order: 13, created_at: '', updated_at: '' },
  { id: 'wearable-technology', name: 'Wearable Technology', slug: 'wearable-technology', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/wearable-technology', is_active: true, is_featured: false, sort_order: 14, created_at: '', updated_at: '' },
  { id: 'server-enterprise', name: 'Server & Enterprise', slug: 'server-enterprise', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/server-enterprise', is_active: true, is_featured: false, sort_order: 15, created_at: '', updated_at: '' },
  { id: 'security-devices', name: 'Security Devices', slug: 'security-devices', description: null, image: null, thumbnail: null, icon: null, parent: null, level: 1, path: '/security-devices', is_active: true, is_featured: false, sort_order: 16, created_at: '', updated_at: '' },
];

/**
 * Hook for fetching categories with fallback.
 * Categories NEVER depend on products.
 */
export function useCategories(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ['nav-categories'],
    queryFn: () => productService.getCategories({ page_size: 50 }),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: options?.enabled !== false,
  });

  const categories = useMemo(() => {
    const apiCats = (query.data?.results || []).filter((c) => !c.parent);
    if (apiCats.length > 0) return apiCats;
    return FALLBACK_CATEGORIES;
  }, [query.data]);

  return { ...query, categories };
}

/**
 * Hook for fetching the full category tree.
 */
export function useCategoryTree() {
  const query = useQuery({
    queryKey: ['category-tree'],
    queryFn: () => productService.getCategoryTree(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return { ...query, tree: query.data || [] };
}
