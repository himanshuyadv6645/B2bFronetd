import { Link } from 'react-router-dom';
import type { SEOBreadcrumb } from '@/types/seo';
import { FiChevronRight } from 'react-icons/fi';

interface SEOBreadcrumbsProps {
  items: SEOBreadcrumb[];
}

export function SEOBreadcrumbs({ items }: SEOBreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && <FiChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
              {item.url && !isLast ? (
                <Link
                  to={item.url}
                  className="transition-colors hover:text-brand"
                >
                  {item.name}
                </Link>
              ) : (
                <span className={isLast ? 'font-medium text-foreground' : ''}>
                  {item.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
