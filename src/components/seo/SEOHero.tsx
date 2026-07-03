import { FiMapPin, FiShield, FiTruck, FiCheckCircle } from 'react-icons/fi';

interface SEOHeroProps {
  heading: string;
  intro: string;
  cityName?: string;
  categoryName?: string;
  brandName?: string;
}

export function SEOHero({ heading, intro, cityName }: SEOHeroProps) {
  const highlights = [
    { icon: FiCheckCircle, text: 'Verified Sellers' },
    { icon: FiShield, text: 'GST Invoicing' },
    { icon: FiTruck, text: 'Fast Delivery' },
  ];
  if (cityName) {
    highlights.splice(2, 0, { icon: FiMapPin, text: `Local in ${cityName}` });
  }

  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand/5 via-white to-brand/10 border border-brand/10 px-4 py-8 sm:px-8 sm:py-12">
      <div className="relative z-10">
        <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
          {heading}
        </h1>
        {intro && (
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {intro}
          </p>
        )}
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {highlights.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow-sm border border-border sm:text-sm">
              <item.icon className="h-3.5 w-3.5 text-brand" />
              {item.text}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-brand/5 sm:h-60 sm:w-60" />
      <div className="absolute -top-5 -right-5 h-20 w-20 rounded-full bg-brand/5 sm:h-32 sm:w-32" />
    </section>
  );
}
