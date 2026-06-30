import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiHelpCircle } from 'react-icons/fi';

interface SEOFAQSectionProps {
  faqs: Array<{ question: string; answer: string }>;
}

export function SEOFAQSection({ faqs }: SEOFAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <FiHelpCircle className="h-5 w-5 text-brand" />
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          Frequently Asked Questions
        </h2>
      </div>
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-border bg-white"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/30 sm:text-base"
            >
              <span className="pr-4">{faq.question}</span>
              {openIndex === index ? (
                <FiChevronUp className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              ) : (
                <FiChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              )}
            </button>
            {openIndex === index && (
              <div className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
