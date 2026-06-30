import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';
import toast from 'react-hot-toast';

export function useInventory() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryService.getInventory({ page_size: 50 }),
  });

  const adjustStockMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { quantity: number; change_type: 'add' | 'remove' | 'adjustment'; notes?: string } }) =>
      inventoryService.adjustStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Stock updated');
    },
    onError: () => toast.error('Failed to update stock'),
  });

  return {
    items: data?.results || [],
    count: data?.count || 0,
    isLoading,
    adjustStock: adjustStockMutation.mutate,
    isAdjusting: adjustStockMutation.isPending,
  };
}
