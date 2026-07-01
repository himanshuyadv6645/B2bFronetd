import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { registerSchema, type RegisterFormData } from '@/lib/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiUser } from 'react-icons/fi';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'buyer' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success('Registration successful!');
      // GuestRoute detects isAuthenticated and redirects back to the saved page
      // (e.g. the product the user was buying), falling back to the role dashboard/home.
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] sm:min-h-[80vh] flex items-center justify-center px-4 py-8 sm:py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-xl sm:text-2xl">Create Account</CardTitle>
          <CardDescription className="text-sm">Join India's leading B2B electronics marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>I want to</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'buyer' as const, label: 'Buy' },
                  { value: 'seller' as const, label: 'Sell' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all text-sm font-medium ${
                      selectedRole === option.value
                        ? 'border-brand bg-brand/5 text-brand'
                        : 'border-input hover:border-brand/50'
                    }`}
                  >
                    <input type="radio" value={option.value} {...register('role')} className="sr-only" />
                    <FiUser className="mr-2 h-4 w-4" />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10" {...register('email')} error={errors.email?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" type="tel" placeholder="+91 98765 43210" className="pl-10" {...register('phone')} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput id="password" placeholder="Min. 8 characters" autoComplete="new-password" {...register('password')} error={errors.password?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <PasswordInput id="confirm_password" placeholder="Re-enter password" autoComplete="new-password" {...register('confirm_password')} error={errors.confirm_password?.message} />
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-brand hover:underline">Terms</Link>{' '}and{' '}
              <Link to="/privacy" className="text-brand hover:underline">Privacy Policy</Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-brand hover:underline font-medium">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
