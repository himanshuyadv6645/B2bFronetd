import { FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface SEORelatedSearchesProps {
  searches: string[];
}

export function SEORelatedSearches({ searches }: SEORelatedSearchesProps) {
  if (!searches || searches.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <FiSearch className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-bold text-foreground sm:text-base">Related Searches</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((search, index) => (
          <Link
            key={index}
            to={`/search/${encodeURIComponent(search.replace(/\s+/g, '-').toLowerCase())}`}
            className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-brand/30 hover:bg-brand/5 hover:text-brand sm:text-sm"
          >
            {search}
          </Link>
        ))}
      </div>
    </section>
  );
}
