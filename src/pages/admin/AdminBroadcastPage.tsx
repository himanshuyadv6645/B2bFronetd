import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/config/api';
import toast from 'react-hot-toast';
import { FiSend } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

interface BroadcastForm {
  title: string;
  body: string;
  action_url?: string;
  image_url?: string;
  button_text?: string;
}

export default function AdminBroadcastPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BroadcastForm>();

  const onSubmit = async (data: BroadcastForm) => {
    setLoading(true);
    try {
      const res = await api.post('/notifications/admin/broadcast/', data);
      toast.success(res.data?.message || 'Broadcast sent successfully!');
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Broadcast Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Send a push notification to all active users.
        </p>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Title <span className="text-destructive">*</span></label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="e.g., Diwali Mega Sale! 🪔"
              />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Message Body <span className="text-destructive">*</span></label>
              <textarea
                {...register('body', { required: 'Message body is required' })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand min-h-[100px]"
                placeholder="e.g., Get 50% OFF on all electronics. Valid till Sunday!"
              />
              {errors.body && <p className="text-xs text-destructive mt-1">{errors.body.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
              <input
                {...register('image_url')}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="e.g., https://example.com/banner.jpg"
              />
              <p className="text-[11px] text-muted-foreground mt-1">A large image to show in the notification.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Button Text (Optional)</label>
              <input
                {...register('button_text')}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="e.g., Claim Offer"
              />
              <p className="text-[11px] text-muted-foreground mt-1">A custom button that users can click.</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Action URL (Optional)</label>
              <input
                {...register('action_url')}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="e.g., /products?offer=diwali"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Where to take the user when they click.</p>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
              <FiSend />
              {loading ? 'Sending...' : 'Send Broadcast to All Users'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
