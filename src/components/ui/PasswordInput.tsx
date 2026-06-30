import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

/**
 * Password field with a lock icon and a show/hide toggle.
 * Drop-in for react-hook-form: spread `register('password')` onto it.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [show, setShow] = useState(false);
    return (
      <div className="w-full">
        <div className="relative">
          <FiLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={ref}
            type={show ? 'text' : 'password'}
            className={cn(
              'flex h-11 w-full rounded-md border border-input bg-background pl-10 pr-11 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10',
              error && 'border-destructive focus-visible:ring-destructive',
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
          >
            {show ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';
