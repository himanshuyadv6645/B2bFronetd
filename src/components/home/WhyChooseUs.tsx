import { Card, CardContent } from '@/components/ui/Card';
import { FiPackage, FiStar, FiUsers, FiTruck, FiShield, FiCreditCard } from 'react-icons/fi';

const ITEMS = [
  { icon: FiPackage, title: 'Wide Range', desc: 'Access thousands of electronics from verified sellers' },
  { icon: FiStar, title: 'Best Prices', desc: 'Compare prices from multiple sellers for the best deal' },
  { icon: FiUsers, title: 'Verified Sellers', desc: 'All sellers verified with proper documentation' },
  { icon: FiTruck, title: 'Fast Shipping', desc: 'Quick shipping to your doorstep or warehouse' },
  { icon: FiShield, title: 'Secure Payments', desc: 'Multiple payment options with buyer protection' },
  { icon: FiCreditCard, title: 'Flexible Credit', desc: 'Net banking, UPI, cards, and business credit' },
];

export function WhyChooseUs() {
  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-xl font-bold sm:text-2xl">Why Choose B2B Market?</h2>
          <p className="mt-1 text-xs text-muted-foreground">Trusted by thousands of businesses across India</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <Card key={i} className="transition-all hover:shadow-md hover:border-brand/20">
              <CardContent className="p-4 sm:p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                  <item.icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="text-sm font-bold">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
