import { FiTruck, FiShield, FiHeadphones, FiCreditCard, FiRefreshCw } from 'react-icons/fi';

const FEATURES = [
  { icon: FiTruck, label: '24 Hrs Delivery', sub: 'Across India' },
  { icon: FiShield, label: 'Verified Sellers', sub: 'Quality Assured' },
  { icon: FiHeadphones, label: 'Best Prices', sub: 'Wholesale Rates' },
  { icon: FiCreditCard, label: 'GST Invoicing', sub: 'For Your Business' },
  { icon: FiRefreshCw, label: 'Easy Returns', sub: '7-Day Policy' },
];

export function ServiceFeatures() {
  return (
    <section className="bg-white pb-2">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3 md:grid-cols-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white px-4 py-3 transition-colors hover:bg-brand/5"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10">
                <f.icon className="h-4.5 w-4.5 text-brand" />
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-900">{f.label}</span>
                <span className="block text-[10px] text-gray-400">{f.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
