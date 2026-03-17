import { useEffect, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader, StatCard } from "@/pages/admin";
import { Users, FolderKanban, DollarSign, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Using types from @/types - no need to redefine here

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [pendingContractors, setPendingContractors] = useState<Contractor[]>([]);
  const [disputedProjects, setDisputedProjects] = useState<Project[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  const token = localStorage.getItem('nexa_auth_token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch analytics
        const analyticsRes = await axios.get(`${API_BASE_URL}/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(analyticsRes.data.data);

        // Fetch contractors
        const contractorsRes = await axios.get(`${API_BASE_URL}/admin/contractors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const contractors = Array.isArray(contractorsRes.data.data?.contractors) 
          ? contractorsRes.data.data.contractors 
          : contractorsRes.data.data && typeof contractorsRes.data.data === 'object'
            ? []
            : [];
        const pending = contractors.filter((c: Contractor) => c.status === 'PENDING' || c.isVerified === false);
        setPendingContractors(pending.slice(0, 5));

        // Fetch projects
        const projectsRes = await axios.get(`${API_BASE_URL}/admin/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const projects = Array.isArray(projectsRes.data.data?.projects)
          ? projectsRes.data.data.projects
          : projectsRes.data.data && typeof projectsRes.data.data === 'object'
            ? []
            : [];
        const disputed = projects.filter((p: Project) => p.status === 'DISPUTED').slice(0, 5);
        const recent = projects
          .sort((a: Project, b: Project) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 3);
        setDisputedProjects(disputed);
        setRecentProjects(recent);

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load dashboard data';
        setError(errorMsg);
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Admin Dashboard"
          description="Overview of platform activity"
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Admin Dashboard"
          description="Overview of platform activity"
        />
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error loading dashboard</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of platform activity"
      />

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Contractors" 
          value={analytics?.users.contractors || 0} 
          icon={Users} 
          trend={{ value: 12, positive: true }} 
        />
        <StatCard 
          title="Active Projects" 
          value={analytics?.projects.total || 0} 
          icon={FolderKanban} 
          trend={{ value: 8, positive: true }} 
        />
        <StatCard 
          title="Revenue (MTD)" 
          value={`$${(analytics?.payments.totalRevenue || 0) / 1000}K`} 
          icon={DollarSign} 
          trend={{ value: 15, positive: true }} 
        />
        <StatCard 
          title="Open Disputes" 
          value={analytics?.disputes.open || 0} 
          icon={TrendingUp} 
          trend={{ value: 2, positive: false }} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending approvals */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">Pending Approvals</h2>
            <StatusBadge status="PENDING" label={`${pendingContractors.length} pending`} />
          </div>
          <div className="mt-4 space-y-3">
            {pendingContractors.length > 0 ? pendingContractors.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium text-foreground">{c.businessName}</p>
                  <p className="text-xs text-muted-foreground">{c.location} · {c.specialties?.join(', ')}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-md bg-success/10 px-3 py-1 text-xs font-medium text-success hover:bg-success/20">
                    <CheckCircle className="mr-1 inline h-3 w-3" /> Approve
                  </button>
                  <button className="rounded-md bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/20">
                    Reject
                  </button>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">No pending approvals</p>}
          </div>
        </div>

        {/* Disputes */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">Active Disputes</h2>
            <StatusBadge status="DISPUTED" label={`${disputedProjects.length} active`} />
          </div>
          <div className="mt-4 space-y-3">
            {disputedProjects.map(p => (
              <ProjectCard key={p.id} project={p as any} />
            ))}
            {disputedProjects.length === 0 && <p className="text-sm text-muted-foreground">No active disputes</p>}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">Recent Projects</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentProjects.map(p => <ProjectCard key={p.id} project={p as any} />)}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
