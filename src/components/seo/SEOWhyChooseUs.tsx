import { FiCheckCircle, FiShield, FiTruck, FiRefreshCw, FiHeadphones } from 'react-icons/fi';

interface SEOWhyChooseUsProps {
  content?: string;
  cityName?: string;
}

const features = [
  { icon: FiCheckCircle, title: 'Verified Sellers', desc: 'All sellers are GST verified and quality checked' },
  { icon: FiShield, title: 'Secure Payments', desc: 'Escrow protected transactions for safe ordering' },
  { icon: FiTruck, title: 'Fast Delivery', desc: 'Quick dispatch and delivery across India' },
  { icon: FiRefreshCw, title: 'Easy Returns', desc: 'Hassle-free return and refund policy' },
  { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated support for all your queries' },
];

export function SEOWhyChooseUs({ content, cityName }: SEOWhyChooseUsProps) {
  return (
    <section className="rounded-lg border border-border bg-white p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-bold text-foreground sm:text-xl">
        Why Choose Us{cityName ? ` in ${cityName}` : ''}
      </h2>
      {content && (
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{content}</p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
        {features.map((feat, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/20 p-3">
            <feat.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">{feat.title}</h3>
              <p className="text-xs text-muted-foreground">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
