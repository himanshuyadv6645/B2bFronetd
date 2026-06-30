import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h3 className="font-semibold mb-3 text-sm">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-foreground transition-colors">Shipping</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm">For Business</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/register" className="hover:text-foreground transition-colors">Sell on B2B Market</Link></li>
              <li><Link to="/bulk-orders" className="hover:text-foreground transition-colors">Bulk Orders</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} B2B Market. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
