import { PageHeader, StatCard } from "@/pages/admin";
import { Users, FolderKanban, DollarSign, TrendingUp, Star, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const monthlyRevenue = [
  { month: "Sep", revenue: 82000 }, { month: "Oct", revenue: 95000 }, { month: "Nov", revenue: 110000 },
  { month: "Dec", revenue: 98000 }, { month: "Jan", revenue: 125000 }, { month: "Feb", revenue: 140000 },
];

const projectStats = [
  { month: "Sep", completed: 12, started: 18 }, { month: "Oct", completed: 15, started: 14 },
  { month: "Nov", completed: 18, started: 22 }, { month: "Dec", completed: 14, started: 16 },
  { month: "Jan", completed: 20, started: 25 }, { month: "Feb", completed: 22, started: 19 },
];

const statusDistribution = [
  { name: "Completed", value: 45, color: "hsl(152, 60%, 40%)" },
  { name: "In Progress", value: 28, color: "hsl(205, 80%, 50%)" },
  { name: "Pending", value: 15, color: "hsl(38, 92%, 50%)" },
  { name: "Disputed", value: 7, color: "hsl(0, 72%, 51%)" },
];

const AdminAnalytics = () => (
  <div className="space-y-6">
    <PageHeader
      title="Platform Analytics"
      description="Comprehensive platform performance overview"
    />

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard title="Total Users" value="8,432" icon={Users} trend={{ value: 14, positive: true }} />
      <StatCard title="Contractors" value="2,547" icon={Users} trend={{ value: 12, positive: true }} />
      <StatCard title="Projects" value="1,289" icon={FolderKanban} trend={{ value: 8, positive: true }} />
      <StatCard title="Revenue (MTD)" value="$140K" icon={DollarSign} trend={{ value: 15, positive: true }} />
      <StatCard title="Avg Rating" value="4.7" icon={Star} />
      <StatCard title="Disputes" value="7" icon={AlertTriangle} trend={{ value: 3, positive: false }} />
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
            <XAxis dataKey="month" stroke="hsl(215, 12%, 48%)" fontSize={12} />
            <YAxis stroke="hsl(215, 12%, 48%)" fontSize={12} tickFormatter={v => `$${v / 1000}k`} />
            <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
            <Bar dataKey="revenue" fill="hsl(24, 85%, 52%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Project Trends</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={projectStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
            <XAxis dataKey="month" stroke="hsl(215, 12%, 48%)" fontSize={12} />
            <YAxis stroke="hsl(215, 12%, 48%)" fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="completed" stroke="hsl(152, 60%, 40%)" strokeWidth={2} name="Completed" />
            <Line type="monotone" dataKey="started" stroke="hsl(205, 80%, 50%)" strokeWidth={2} name="Started" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Status Distribution</h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
              {statusDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap gap-3 justify-center">
          {statusDistribution.map(s => (
            <span key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} /> {s.name}
            </span>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5 shadow-card">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Top Contractors</h2>
        <div className="space-y-3">
          {[
            { name: "Wilson & Sons Construction", projects: 89, revenue: "$245K", rating: 4.8 },
            { name: "Precision Plumbing & Build", projects: 203, revenue: "$312K", rating: 4.7 },
            { name: "HomeStyle Renovations", projects: 145, revenue: "$198K", rating: 4.8 },
            { name: "GreenSpace Builders", projects: 41, revenue: "$87K", rating: 4.9 },
            { name: "Metro Build Corp", projects: 56, revenue: "$165K", rating: 4.6 },
          ].map((c, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.projects} projects · {c.revenue} revenue</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                <span className="text-sm font-medium">{c.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AdminAnalytics;
