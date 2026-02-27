import { HardHat } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="border-t border-border bg-primary py-12 text-primary-foreground">
    <div className="container">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <HardHat className="h-5 w-5 text-secondary" />
            <span className="font-heading text-lg font-bold">NEXA INFRA</span>
          </div>
          <p className="mt-3 text-sm text-primary-foreground/70">
            Connecting homeowners with trusted construction professionals since 2024.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/browse-contractors" className="hover:text-primary-foreground">Find Contractors</Link></li>
            <li><Link to="/register-contractor" className="hover:text-primary-foreground">Join as Contractor</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/70">
            <li><a href="#" className="hover:text-primary-foreground">About</a></li>
            <li><a href="#" className="hover:text-primary-foreground">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/70">
            <li><a href="#" className="hover:text-primary-foreground">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary-foreground">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/50">
        © 2026 NEXA INFRA. All rights reserved.
      </div>
    </div>
  </footer>
);
