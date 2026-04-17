import { useEffect, useMemo, useState } from "react";
import { PageHeader, StatCard } from "@/pages/admin";
import { Users, FolderKanban, DollarSign, Star, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { apiClient } from "@/services/api";
import { formatInr, formatInrCompact } from "@/lib/currency";

interface AnalyticsResponse {
  users?: {
    total?: number;
    contractors?: number;
  };
  projects?: {
    total?: number;
    byStatus?: Record<string, number>;
  };
  payments?: {
    totalRevenue?: number;
  };
  reviews?: {
    averageRating?: number;
  };
  disputes?: {
    open?: number;
  };
  recentActivity?: {
    projects?: Array<{
      _id: string;
      title: string;
      status: string;
    }>;
    payments?: Array<{
      _id: string;
      amount: number;
      status: string;
    }>;
  };
}

const STATUS_COLORS: Record<string, string> = {
  completed: "hsl(152, 60%, 40%)",
  in_progress: "hsl(205, 80%, 50%)",
  approved: "hsl(38, 92%, 50%)",
  pending: "hsl(24, 85%, 52%)",
  disputed: "hsl(0, 72%, 51%)",
  cancelled: "hsl(215, 12%, 48%)",
};

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get<AnalyticsResponse>("/admin/analytics");
        setAnalytics(data);
      } catch (requestError) {
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    void loadAnalytics();
  }, []);

  const statusDistribution = useMemo(
    () =>
      Object.entries(analytics?.projects?.byStatus || {}).map(([status, value]) => ({
        name: status.replaceAll("_", " "),
        value,
        color: STATUS_COLORS[status] || "hsl(214, 20%, 70%)",
      })),
    [analytics]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics"
        description="Live platform performance overview"
      />

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Total Users" value={analytics?.users?.total || 0} icon={Users} />
        <StatCard title="Contractors" value={analytics?.users?.contractors || 0} icon={Users} />
        <StatCard title="Projects" value={analytics?.projects?.total || 0} icon={FolderKanban} />
        <StatCard title="Revenue" value={formatInrCompact((analytics?.payments?.totalRevenue || 0) as number)} icon={DollarSign} />
        <StatCard title="Avg Rating" value={(analytics?.reviews?.averageRating || 0).toFixed(1)} icon={Star} />
      </div>

      {loading ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
          Loading analytics...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Project Status Mix</h2>
            {statusDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {statusDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex flex-wrap justify-center gap-3">
                  {statusDistribution.map((item) => (
                    <span key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} /> {item.name}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No project data available.</p>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Recent Projects</h2>
            <div className="space-y-3">
              {(analytics?.recentActivity?.projects || []).map((project) => (
                <div key={project._id} className="rounded-lg border border-border p-3">
                  <p className="font-medium text-foreground">{project.title}</p>
                  <p className="text-xs capitalize text-muted-foreground">{project.status.replaceAll("_", " ")}</p>
                </div>
              ))}
              {(analytics?.recentActivity?.projects || []).length === 0 && (
                <p className="text-sm text-muted-foreground">No recent projects.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Recent Payments</h2>
            <div className="space-y-3">
              {(analytics?.recentActivity?.payments || []).map((payment) => (
                <div key={payment._id} className="rounded-lg border border-border p-3">
                  <p className="font-medium text-foreground">{formatInr(payment.amount)}</p>
                  <p className="text-xs capitalize text-muted-foreground">{payment.status}</p>
                </div>
              ))}
              {(analytics?.recentActivity?.payments || []).length === 0 && (
                <p className="text-sm text-muted-foreground">No Recent Payments.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <div>
            <p className="font-medium text-foreground">Open Disputes</p>
            <p className="text-sm text-muted-foreground">{analytics?.disputes?.open || 0} disputes currently need attention.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
