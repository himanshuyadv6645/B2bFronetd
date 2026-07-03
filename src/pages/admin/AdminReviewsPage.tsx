import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiX, FiStar, FiMessageSquare } from 'react-icons/fi';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('products');

  const { data: productReviewsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['admin-product-reviews'],
    queryFn: () => adminService.getPendingProductReviews({ page_size: 50 }),
  });

  const { data: sellerReviewsData, isLoading: isLoadingSellers } = useQuery({
    queryKey: ['admin-seller-reviews'],
    queryFn: () => adminService.getPendingSellerReviews({ page_size: 50 }),
  });

  const approveProductMutation = useMutation({
    mutationFn: (id: string) => adminService.approveProductReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product-reviews'] });
      toast.success('Product review approved');
    },
    onError: () => toast.error('Failed to approve review'),
  });

  const rejectProductMutation = useMutation({
    mutationFn: (id: string) => adminService.rejectProductReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product-reviews'] });
      toast.success('Product review rejected');
    },
    onError: () => toast.error('Failed to reject review'),
  });

  const approveSellerMutation = useMutation({
    mutationFn: (id: string) => adminService.approveSellerReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-seller-reviews'] });
      toast.success('Seller review approved');
    },
    onError: () => toast.error('Failed to approve review'),
  });

  const rejectSellerMutation = useMutation({
    mutationFn: (id: string) => adminService.rejectSellerReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-seller-reviews'] });
      toast.success('Seller review rejected');
    },
    onError: () => toast.error('Failed to reject review'),
  });

  if (isLoadingProducts || isLoadingSellers) return <PageLoading />;

  const productReviews = productReviewsData?.results || [];
  const sellerReviews = sellerReviewsData?.results || [];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FiStar key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Review Approvals</h1>
        <p className="text-muted-foreground">Manage pending product and seller reviews</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="products">
            Product Reviews
            {productReviews.length > 0 && (
              <Badge variant="primary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {productReviews.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sellers">
            Seller Reviews
            {sellerReviews.length > 0 && (
              <Badge variant="primary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {sellerReviews.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {productReviews.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <EmptyState
                  icon={<FiMessageSquare className="h-8 w-8 text-muted-foreground" />}
                  title="No pending product reviews"
                  description="All product reviews have been moderated"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {productReviews.map((review: any) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{review.title || 'No Title'}</h3>
                            <div className="text-sm text-muted-foreground">
                              Product: <span className="font-medium text-foreground">{review.product_name}</span>
                            </div>
                          </div>
                          <div className="flex">{renderStars(review.rating)}</div>
                        </div>
                        <p className="text-sm bg-muted/50 p-3 rounded-md italic">"{review.comment}"</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>By: {review.buyer_name}</span>
                          <span>Date: {formatDate(review.created_at)}</span>
                          <Badge variant="warning">Pending</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => approveProductMutation.mutate(review.id)}
                          isLoading={approveProductMutation.isPending}
                        >
                          <FiCheckCircle className="mr-2" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectProductMutation.mutate(review.id)}
                          isLoading={rejectProductMutation.isPending}
                        >
                          <FiX className="mr-2" /> Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sellers">
          {sellerReviews.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <EmptyState
                  icon={<FiMessageSquare className="h-8 w-8 text-muted-foreground" />}
                  title="No pending seller reviews"
                  description="All seller reviews have been moderated"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sellerReviews.map((review: any) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{review.title || 'No Title'}</h3>
                            <div className="text-sm text-muted-foreground">
                              Seller: <span className="font-medium text-foreground">{review.seller_name}</span>
                            </div>
                          </div>
                          <div className="flex">{renderStars(review.rating)}</div>
                        </div>
                        <p className="text-sm bg-muted/50 p-3 rounded-md italic">"{review.comment}"</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>By: {review.buyer_name}</span>
                          <span>Date: {formatDate(review.created_at)}</span>
                          <Badge variant="warning">Pending</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => approveSellerMutation.mutate(review.id)}
                          isLoading={approveSellerMutation.isPending}
                        >
                          <FiCheckCircle className="mr-2" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectSellerMutation.mutate(review.id)}
                          isLoading={rejectSellerMutation.isPending}
                        >
                          <FiX className="mr-2" /> Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
