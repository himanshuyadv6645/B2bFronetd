import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/wishlist.service';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export function useWishlist() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getWishlist(),
    enabled: isAuthenticated,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: ({ variantId, notes }: { variantId: string; notes?: string }) =>
      wishlistService.addToWishlist(variantId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Added to wishlist');
    },
    onError: () => {
      toast.error('Failed to add to wishlist');
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (itemId: string) => wishlistService.removeFromWishlist(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
    onError: () => {
      toast.error('Failed to remove from wishlist');
    },
  });

  return {
    items: wishlist?.results || [],
    isLoading,
    count: wishlist?.count || 0,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    isAdding: addToWishlistMutation.isPending,
    isRemoving: removeFromWishlistMutation.isPending,
  };
}
