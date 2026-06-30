import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import type { Category } from '@/types/product';

interface BreadcrumbProps {
  ancestors: Category[];
  current: Category | string;
}

/**
 * Breadcrumb navigation showing category hierarchy.
 * Electronics > Networking > Wireless Routers
 */
export function CategoryBreadcrumbs({ ancestors, current }: BreadcrumbProps) {
  const currentName = typeof current === 'string' ? current : current.name;
  const currentSlug = typeof current === 'string' ? undefined : current.slug;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
      <Link to="/" className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
        <FiHome className="h-3 w-3" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      <FiChevronRight className="h-3 w-3" />

      <Link to="/products" className="text-muted-foreground transition-colors hover:text-foreground">
        Products
      </Link>

      {ancestors.map((ancestor) => (
        <span key={ancestor.id} className="flex items-center gap-1.5">
          <FiChevronRight className="h-3 w-3" />
          <Link
            to={`/products?category=${ancestor.id}`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {ancestor.name}
          </Link>
        </span>
      ))}

      <FiChevronRight className="h-3 w-3" />

      {currentSlug ? (
        <span className="font-medium text-foreground">{currentName}</span>
      ) : (
        <span className="font-medium text-foreground">{currentName}</span>
      )}
    </nav>
  );
}
