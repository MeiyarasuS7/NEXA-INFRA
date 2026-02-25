import { NavLink, Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, FolderKanban, DollarSign, Shield, Star,
  BarChart3, Settings, UserCircle, MessageSquare, Bell, FileText, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const links = role === 'SUPER_ADMIN' ? ADMIN_LINKS : role === 'CONTRACTOR' ? CONTRACTOR_LINKS : USER_LINKS;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
          <nav className="sticky top-16 flex flex-col gap-1 p-3">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary/10 text-secondary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
