import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { FiMail, FiInfo } from 'react-icons/fi';

export default function LoginPage() {
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);


  const redirectMessage = (location.state as { message?: string })?.message;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      // GuestRoute will detect isAuthenticated and handle redirect
      // (checks sessionStorage for saved state, then falls back to redirectTo)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] sm:min-h-[80vh] flex items-center justify-center px-4 py-8 sm:py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-xl sm:text-2xl">Welcome Back</CardTitle>
          <CardDescription className="text-sm">Sign in to your B2B Market account</CardDescription>
        </CardHeader>
        <CardContent>
          {redirectMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              <FiInfo className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{redirectMessage}</span>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-brand hover:underline">
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
