import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export function useCart() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    enabled: isAuthenticated && user?.role === 'buyer',
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ sellerId, variantId, quantity, notes }: { sellerId: string; variantId: string; quantity: number; notes?: string }) =>
      cartService.addToCart(sellerId, variantId, quantity, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item added to cart');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update cart item';
      toast.error(message);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => cartService.removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to remove cart item';
      toast.error(message);
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Cart cleared');
    },
  });

  return {
    cart,
    isLoading,
    itemCount: cart?.total_items || 0,
    totalAmount: cart?.total_amount || '0.00',
    addToCart: addToCartMutation.mutate,
    updateItem: updateItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAdding: addToCartMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isRemoving: removeItemMutation.isPending,
  };
}
