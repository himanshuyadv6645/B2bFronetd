import { useState } from 'react';
import { FiBookOpen, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface SEOBuyingGuideProps {
  content: string;
  title?: string;
}

export function SEOBuyingGuide({ content, title = 'Buying Guide' }: SEOBuyingGuideProps) {
  const [expanded, setExpanded] = useState(false);

  if (!content) return null;

  const isLong = content.length > 300;
  const displayText = isLong && !expanded ? content.slice(0, 300) + '...' : content;

  return (
    <section className="rounded-lg border border-border bg-white p-4 sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <FiBookOpen className="h-5 w-5 text-brand" />
        <h2 className="text-lg font-bold text-foreground sm:text-xl">{title}</h2>
      </div>
      <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
        {displayText}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs font-bold text-brand transition-colors hover:text-brand-dark sm:text-sm"
        >
          {expanded ? 'Show Less' : 'Read More'}
          {expanded ? <FiChevronUp className="h-3.5 w-3.5" /> : <FiChevronDown className="h-3.5 w-3.5" />}
        </button>
      )}
    </section>
  );
}
