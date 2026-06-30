import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { formatDateTime } from '@/lib/utils';
import { FiBell, FiCheck } from 'react-icons/fi';

function NotificationsPage() {
  const { notifications, isLoading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  if (isLoading) return <PageLoading />;

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          Notifications
          {unreadCount > 0 && <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>}
        </h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
            <FiCheck className="mr-1 h-4 w-4" /> Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FiBell className="h-8 w-8 text-muted-foreground" />}
              title="No notifications"
              description="You're all caught up! New notifications will appear here."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-sm ${
                !notification.is_read ? 'border-brand/50 bg-brand/5' : ''
              }`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.is_read ? 'bg-brand' : 'bg-muted-foreground/30'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">{formatDateTime(notification.created_at)}</p>
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

export { NotificationsPage };
export default NotificationsPage;
