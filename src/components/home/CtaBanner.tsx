import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function CtaBanner() {
  return (
    <section className="py-10 sm:py-14 bg-brand">
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-xl font-bold text-white sm:text-2xl">Ready to Grow Your Business?</h2>
        <p className="mt-2 text-sm text-white/70">
          Join thousands of businesses buying and selling electronics.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto bg-white text-brand-dark hover:bg-white/90">
              Get Started Free
            </Button>
          </Link>
          <Link to="/products">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
