import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiX, FiClock } from 'react-icons/fi';

export default function AdminApprovalsPage() {
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-approvals'],
    queryFn: () => adminService.getSellerApprovals({ page_size: 50 }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.approveSeller(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('Seller approved');
    },
    onError: () => toast.error('Failed to approve seller'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminService.rejectSeller(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('Seller rejected');
      setRejectingId(null);
      setRejectReason('');
    },
    onError: () => toast.error('Failed to reject seller'),
  });

  if (isLoading) return <PageLoading />;

  const sellers = data?.results || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Seller Approvals</h1>
          <p className="text-sm text-muted-foreground">{data?.count || 0} pending approvals</p>
        </div>
      </div>

      {sellers.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FiCheckCircle className="h-8 w-8 text-muted-foreground" />}
              title="No pending approvals"
              description="All seller applications have been reviewed"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sellers.map((seller) => (
            <Card key={seller.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base">{seller.company_name}</h3>
                      <Badge variant="warning" className="text-[10px]">
                        <FiClock className="mr-1 h-3 w-3" /> Pending
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{seller.user_detail?.email}</p>
                    {seller.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{seller.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                      {seller.gst_number && <span>GST: {seller.gst_number}</span>}
                      {seller.business_type && <span>Type: {seller.business_type}</span>}
                      <span>Applied: {formatDate(seller.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    {rejectingId === seller.id ? (
                      <div className="flex flex-col gap-2">
                        <Textarea
                          placeholder="Rejection reason..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-64 text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectMutation.mutate({ id: seller.id, reason: rejectReason })}
                            disabled={!rejectReason.trim()}
                            isLoading={rejectMutation.isPending}
                          >
                            Confirm Reject
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setRejectingId(null); setRejectReason(''); }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(seller.id)}
                          isLoading={approveMutation.isPending}
                        >
                          <FiCheckCircle className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRejectingId(seller.id)}
                        >
                          <FiX className="mr-1 h-4 w-4" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
