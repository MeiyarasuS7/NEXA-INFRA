import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FolderKanban, DollarSign, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard } from "@/pages/admin";
import { API_BASE_URL } from "@/config/env";
import { authStorage } from "@/lib/authStorage";
import axios from "axios";

interface DashboardAnalytics {
  users?: { contractors?: number };
  projects?: { total?: number };
  payments?: { totalRevenue?: number };
  disputes?: { open?: number };
}

interface DashboardContractor {
  _id?: string;
  id?: string;
  company?: string;
  businessName?: string;
  specialties?: string[];
  isVerified?: boolean;
  userId?: { name?: string };
}

interface DashboardProject {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  status: string;
  budget: number;
  createdAt?: string;
  startDate?: string;
  contractorName?: string;
  contractorId?: unknown;
  progress?: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [pendingContractors, setPendingContractors] = useState<DashboardContractor[]>([]);
  const [disputedProjects, setDisputedProjects] = useState<DashboardProject[]>([]);
  const [recentProjects, setRecentProjects] = useState<DashboardProject[]>([]);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const token = authStorage.getToken();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [analyticsRes, contractorsRes, projectsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/admin/analytics`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/admin/contractors`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/admin/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setAnalytics(analyticsRes.data.data);

        const contractors = Array.isArray(contractorsRes.data.data?.contractors)
          ? contractorsRes.data.data.contractors
          : [];
        setPendingContractors(contractors.filter((contractor: DashboardContractor) => contractor.isVerified === false).slice(0, 5));

        const projects = Array.isArray(projectsRes.data.data?.projects) ? projectsRes.data.data.projects : [];
        setDisputedProjects(
          projects.filter((project: DashboardProject) => project.status === "disputed").slice(0, 5)
        );
        setRecentProjects(
          [...projects]
            .sort(
              (a: DashboardProject, b: DashboardProject) =>
                new Date(b.createdAt || b.startDate || 0).getTime() - new Date(a.createdAt || a.startDate || 0).getTime()
            )
            .slice(0, 3)
        );
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.message || err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      void fetchData();
    }
  }, [token]);

  const handleVerifyContractor = async (contractorId: string) => {
    try {
      setVerifyingId(contractorId);
      setError(null);

      await axios.put(
        `${API_BASE_URL}/admin/contractors/${contractorId}/verify`,
        { isVerified: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPendingContractors((current) =>
        current.filter((contractor) => (contractor._id || contractor.id) !== contractorId)
      );
    } catch (err: any) {
      console.error("Error verifying contractor:", err);
      setError(err.response?.data?.message || err.message || "Failed to verify contractor");
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admin Dashboard" description="Overview of platform activity" />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admin Dashboard" description="Overview of platform activity" />
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
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
      <PageHeader title="Admin Dashboard" description="Overview of platform activity" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Contractors" value={analytics?.users?.contractors || 0} icon={Users} trend={{ value: 12, positive: true }} />
        <StatCard title="Active Projects" value={analytics?.projects?.total || 0} icon={FolderKanban} trend={{ value: 8, positive: true }} />
        <StatCard title="Revenue (MTD)" value={`$${(analytics?.payments?.totalRevenue || 0) / 1000}K`} icon={DollarSign} trend={{ value: 15, positive: true }} />
        <StatCard title="Open Disputes" value={analytics?.disputes?.open || 0} icon={TrendingUp} trend={{ value: 2, positive: false }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">Pending Contractor Verification</h2>
            <StatusBadge status="PENDING" label={`${pendingContractors.length} pending`} />
          </div>
          <div className="mt-4 space-y-3">
            {pendingContractors.length > 0 ? (
              pendingContractors.map((contractor) => {
                const contractorId = contractor._id || contractor.id || "";
                const contractorName = contractor.company || contractor.businessName || contractor.userId?.name || "Unnamed contractor";

                return (
                  <div key={contractorId} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium text-foreground">{contractorName}</p>
                      <p className="text-xs text-muted-foreground">{contractor.specialties?.join(", ") || "No specialties listed"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => void handleVerifyContractor(contractorId)}
                        disabled={!contractorId || verifyingId === contractorId}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {verifyingId === contractorId ? "Verifying..." : "Verify"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate("/admin/contractors")}>
                        Open Queue
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No pending approvals</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">Active Disputes</h2>
            <StatusBadge status="DISPUTED" label={`${disputedProjects.length} active`} />
          </div>
          <div className="mt-4 space-y-3">
            {disputedProjects.map((project) => (
              <ProjectCard key={project._id || project.id} project={project as any} />
            ))}
            {disputedProjects.length === 0 && <p className="text-sm text-muted-foreground">No active disputes</p>}
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">Recent Projects</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentProjects.map((project) => (
            <ProjectCard key={project._id || project.id} project={project as any} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
