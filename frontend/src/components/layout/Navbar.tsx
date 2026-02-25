import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { HardHat, Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath = role === 'SUPER_ADMIN' ? '/admin/dashboard' : role === 'CONTRACTOR' ? '/contractor/dashboard' : '/user/dashboard';

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
            <HardHat className="h-5 w-5 text-secondary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold text-foreground">BuildPro</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/browse-contractors" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Find Contractors
          </Link>
          {user ? (
            <>
              <Link to={dashboardPath} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{user.name}</span>
                <Button variant="outline" size="sm" onClick={() => { logout(); navigate('/'); }}>
                  <LogOut className="mr-1.5 h-3.5 w-3.5" /> Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
              <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-3">
            <Link to="/browse-contractors" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">Find Contractors</Link>
            {user ? (
              <>
                <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">Dashboard</Link>
                <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }} className="text-left text-sm font-medium text-destructive">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-secondary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
