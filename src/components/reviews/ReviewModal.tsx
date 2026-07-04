import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import toast from 'react-hot-toast';
import { FiStar } from 'react-icons/fi';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  type: 'product' | 'seller';
  targetId: string; // productId or sellerId
  orderItemId?: string; // required for product review
  orderId?: string; // required for seller review
  variantId?: string; // optional for product review
  itemName: string;
}

export function ReviewModal({ open, onClose, type, targetId, orderItemId, orderId, variantId, itemName }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (type === 'product') {
        if (!orderItemId) throw new Error('Order item ID is required');
        return productService.createProductReview(targetId, {
          order_item_id: orderItemId,
          variant_id: variantId || null,
          rating,
          title,
          comment,
        } as any);
      } else {
        if (!orderId) throw new Error('Order ID is required');
        return productService.createSellerReview(targetId, {
          order: orderId,
          rating,
          title,
          comment,
        } as any);
      }
    },
    onSuccess: () => {
      toast.success('Review submitted successfully! It will be visible after moderation.');
      onClose();
      setRating(0);
      setTitle('');
      setComment('');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit review';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    submitMutation.mutate();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a Review for {itemName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2 text-center">
            <Label className="text-sm font-medium">Rating</Label>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-colors"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <FiStar
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Headline (Optional)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's most important to know?"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Written Review (Optional)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike?"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitMutation.isPending} disabled={rating === 0}>
              Submit Review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
