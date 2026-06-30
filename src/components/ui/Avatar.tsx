import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cn, generateInitials } from '@/lib/utils';
import { getInitialsColor } from '@/lib/images';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(({ className, src, alt, name, size = 'md', ...props }, ref) => {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = name ? generateInitials(name) : '?';
  const bgColor = getInitialsColor(name || 'A');
  const showImage = src && !imgFailed;

  return (
    <div
      ref={ref}
      className={cn('relative flex shrink-0 overflow-hidden rounded-full', sizeClasses[size], className)}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name}
          className="aspect-square h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-bold text-white"
          style={{ backgroundColor: `#${bgColor}` }}
        >
          {initials}
        </div>
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export { Avatar };
