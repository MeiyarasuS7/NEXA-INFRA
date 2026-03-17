import { NavLink, Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import {
  LayoutDashboard, Users, FolderKanban, DollarSign, Shield, Star,
  BarChart3, Settings, UserCircle, MessageSquare, Bell, FileText, AlertTriangle, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ADMIN_LINKS = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/contractors", icon: Users, label: "Contractors" },
  { to: "/admin/projects", icon: FolderKanban, label: "Projects" },
  { to: "/admin/payments", icon: DollarSign, label: "Payments" },
  { to: "/admin/disputes", icon: AlertTriangle, label: "Disputes" },
  { to: "/admin/reviews", icon: Star, label: "Reviews" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

const CONTRACTOR_LINKS = [
  { to: "/contractor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/contractor/projects", icon: FolderKanban, label: "My Projects" },
  { to: "/contractor/profile", icon: UserCircle, label: "Profile" },
  { to: "/contractor/reviews", icon: Star, label: "Reviews" },
  { to: "/contractor/chat", icon: MessageSquare, label: "Messages" },
];

const USER_LINKS = [
  { to: "/user/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/user/projects", icon: FolderKanban, label: "My Projects" },
  { to: "/user/request-contractor", icon: FileText, label: "Request Contractor" },
  { to: "/user/chat", icon: MessageSquare, label: "Messages" },
  { to: "/user/profile", icon: UserCircle, label: "Profile" },
];

export const DashboardLayout = () => {
  const { role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const links = role === 'super_admin' ? ADMIN_LINKS : role === 'contractor' ? CONTRACTOR_LINKS : USER_LINKS;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] border-r border-border bg-card transition-all duration-300",
          sidebarExpanded ? "w-60" : "w-16",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <nav className="flex h-full flex-col gap-1 p-3">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary/10 text-secondary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  !sidebarExpanded && "justify-center"
                )}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {sidebarExpanded && <span>{link.label}</span>}
              </NavLink>
            ))}
            
            {/* Toggle Button at Bottom */}
            <div className="mt-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="hidden w-full justify-center lg:flex"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </nav>
        </aside>

        {/* Mobile Menu Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full shadow-lg lg:hidden"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Main content */}
        <main className={cn(
          "flex-1 p-4 transition-all duration-300 lg:p-6",
          sidebarExpanded ? "lg:ml-60" : "lg:ml-16"
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
