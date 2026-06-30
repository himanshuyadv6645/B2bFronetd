import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { FiSearch, FiUsers, FiUserCheck, FiUserX } from 'react-icons/fi';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => adminService.getUsers({ search, page, page_size: 20 }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminService.toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated');
    },
    onError: () => toast.error('Failed to update user'),
  });

  if (isLoading) return <PageLoading />;

  const users = data?.results || [];
  const totalPages = Math.ceil((data?.count || 0) / 20);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">{data?.count || 0} total users</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search users by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FiUsers className="h-8 w-8 text-muted-foreground" />}
              title="No users found"
              description={search ? "Try a different search" : "Users will appear here once they register"}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-sm">{user.full_name || user.email}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="capitalize text-xs">{user.role}</Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {user.phone || '-'}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={user.is_active ? 'success' : 'destructive'} className="text-xs">
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={user.is_active ? 'text-destructive' : 'text-green-600'}
                            onClick={() => {
                              if (confirm(` ${user.is_active ? 'Deactivate' : 'Activate'} this user?`)) {
                                toggleMutation.mutate(user.id);
                              }
                            }}
                            isLoading={toggleMutation.isPending}
                          >
                            {user.is_active ? <FiUserX className="mr-1 h-4 w-4" /> : <FiUserCheck className="mr-1 h-4 w-4" />}
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Avatar name={user.full_name || user.email} size="md" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium">{user.full_name || user.email}</h3>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="capitalize text-[10px]">{user.role}</Badge>
                        <Badge variant={user.is_active ? 'success' : 'destructive'} className="text-[10px]">
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {user.phone && <span className="text-[11px] text-muted-foreground">{user.phone}</span>}
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">Joined {formatDate(user.created_at)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-xs ${user.is_active ? 'text-destructive' : 'text-green-600'}`}
                      onClick={() => {
                        if (confirm(`${user.is_active ? 'Deactivate' : 'Activate'} this user?`)) {
                          toggleMutation.mutate(user.id);
                        }
                      }}
                      isLoading={toggleMutation.isPending}
                    >
                      {user.is_active ? <FiUserX className="mr-1 h-3 w-3" /> : <FiUserCheck className="mr-1 h-3 w-3" />}
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
