import { ProjectCard } from "@/components/ProjectCard";
import { StatusBadge } from "@/components/StatusBadge";
import { MOCK_CONTRACTORS, MOCK_PROJECTS } from "@/data/mock";
import { PageHeader, StatCard } from "@/pages/admin";
import { Users, FolderKanban, DollarSign, TrendingUp, CheckCircle } from "lucide-react";

const AdminDashboard = () => {
  const pendingContractors = MOCK_CONTRACTORS.filter(c => c.status === 'PENDING');
  const disputedProjects = MOCK_PROJECTS.filter(p => p.status === 'DISPUTED');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of platform activity"
      />

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Contractors" value="2,547" icon={Users} trend={{ value: 12, positive: true }} />
        <StatCard title="Active Projects" value="342" icon={FolderKanban} trend={{ value: 8, positive: true }} />
        <StatCard title="Revenue (MTD)" value="$1.2M" icon={DollarSign} trend={{ value: 15, positive: true }} />
        <StatCard title="Completion Rate" value="94%" icon={TrendingUp} trend={{ value: 2, positive: true }} />
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
                  <p className="text-xs text-muted-foreground">{c.location} · {c.specialties.join(', ')}</p>
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
              <ProjectCard key={p.id} project={p} />
            ))}
            {disputedProjects.length === 0 && <p className="text-sm text-muted-foreground">No active disputes</p>}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">Recent Projects</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_PROJECTS.slice(0, 3).map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
