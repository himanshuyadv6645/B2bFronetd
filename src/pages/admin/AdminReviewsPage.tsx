import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  FiCheckCircle,
  FiX,
  FiStar,
  FiMessageSquare,
  FiClock,
  FiThumbsUp,
  FiThumbsDown,
  FiUser,
} from 'react-icons/fi';

type StatusFilter = 'pending' | 'approved' | 'rejected';

const STATUS_CONFIG: Record<StatusFilter, { label: string; icon: typeof FiClock; badgeVariant: 'warning' | 'success' | 'destructive'; color: string }> = {
  pending:  { label: 'Pending',  icon: FiClock,      badgeVariant: 'warning',     color: 'text-amber-600' },
  approved: { label: 'Approved', icon: FiThumbsUp,   badgeVariant: 'success',     color: 'text-green-600' },
  rejected: { label: 'Rejected', icon: FiThumbsDown,  badgeVariant: 'destructive', color: 'text-red-600' },
};

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');

  const { data: sellerData, isLoading } = useQuery({
    queryKey: ['admin-seller-reviews'],
    queryFn: () => adminService.getSellerReviews({ page_size: 100 }),
  });

  // Helper: optimistically update a single review's status in cache
  const updateReviewInCache = (queryKey: string[], reviewId: string, newStatus: string) => {
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old?.results) return old;
      return {
        ...old,
        results: old.results.map((r: any) =>
          r.id === reviewId ? { ...r, status: newStatus } : r
        ),
      };
    });
  };

  const approveSellerMutation = useMutation({
    mutationFn: (id: string) => adminService.approveSellerReview(id),
    onMutate: (id) => updateReviewInCache(['admin-seller-reviews'], id, 'approved'),
    onSuccess: () => toast.success('Review approved'),
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-seller-reviews'] });
      const message = error.response?.data?.message || 'Failed to approve review';
      toast.error(message);
    },
  });

  const rejectSellerMutation = useMutation({
    mutationFn: (id: string) => adminService.rejectSellerReview(id),
    onMutate: (id) => updateReviewInCache(['admin-seller-reviews'], id, 'rejected'),
    onSuccess: () => toast.success('Review rejected'),
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-seller-reviews'] });
      const message = error.response?.data?.message || 'Failed to reject review';
      toast.error(message);
    },
  });

  const allReviews = sellerData?.results || [];
  // Filter client-side by status
  const reviews = allReviews.filter((r: any) => r.status === statusFilter);
  const totalCount = reviews.length;
  // Counts for pills
  const pendingCount = allReviews.filter((r: any) => r.status === 'pending').length;
  const approvedCount = allReviews.filter((r: any) => r.status === 'approved').length;
  const rejectedCount = allReviews.filter((r: any) => r.status === 'rejected').length;

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
          style={i < rating ? { fill: '#fbbf24' } : {}}
        />
      ))}
      <span className="ml-1.5 text-xs font-semibold text-gray-700">{rating}.0</span>
    </div>
  );

  const statusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status as StatusFilter] || STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
      <Badge variant={cfg.badgeVariant} className="text-[10px] gap-1">
        <Icon className="h-3 w-3" /> {cfg.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Seller Reviews</h1>
        <p className="text-sm text-gray-500">
          Approve or reject seller reviews before they appear on the storefront
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Status Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          {([
            { key: 'pending' as StatusFilter, count: pendingCount },
            { key: 'approved' as StatusFilter, count: approvedCount },
            { key: 'rejected' as StatusFilter, count: rejectedCount },
          ]).map(({ key, count }) => {
            const cfg = STATUS_CONFIG[key];
            const Icon = cfg.icon;
            const isActive = statusFilter === key;
            const activeStyles = key === 'pending'
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : key === 'approved'
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-red-50 border-red-300 text-red-700';
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isActive ? activeStyles : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <Icon className="h-3 w-3" />
                {cfg.label}
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/70' : 'bg-gray-100'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100">
        <span className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{totalCount}</span>{' '}
          <span className="lowercase">{STATUS_CONFIG[statusFilter].label}</span>{' '}
          seller review{totalCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <PageLoading />
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FiMessageSquare className="h-8 w-8 text-gray-400" />}
              title={`No ${statusFilter} reviews`}
              description={
                statusFilter === 'pending'
                  ? 'All reviews have been moderated. Great job!'
                  : `No ${statusFilter} seller reviews found`
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {reviews.map((review: any) => (
            <Card
              key={review.id}
              className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <CardContent className="p-0">
                <div className="p-4 sm:p-5">
                  {/* Top Row: Title + Stars + Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {review.title || 'Untitled Review'}
                        </h3>
                        {statusBadge(review.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <FiUser className="h-3 w-3" /> {review.seller_name}
                        </span>
                        <span>by <span className="font-medium text-gray-700">{review.buyer_name}</span></span>
                        <span>{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 mb-3">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Actions - Only for pending */}
                  {review.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => approveSellerMutation.mutate(review.id)}
                        disabled={approveSellerMutation.isPending}
                        style={{ backgroundColor: '#16a34a', color: '#fff' }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiCheckCircle className="h-4 w-4" /> Approve
                      </button>
                      <button
                        onClick={() => rejectSellerMutation.mutate(review.id)}
                        disabled={rejectSellerMutation.isPending}
                        style={{ backgroundColor: '#fff', color: '#dc2626', border: '1px solid #fca5a5' }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiX className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  )}

                  {/* Status info for non-pending */}
                  {review.status !== 'pending' && (
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        review.status === 'approved' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {review.status === 'approved' ? (
                          <><FiCheckCircle className="h-3.5 w-3.5" /> Visible on storefront</>
                        ) : (
                          <><FiX className="h-3.5 w-3.5" /> Hidden from storefront</>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
