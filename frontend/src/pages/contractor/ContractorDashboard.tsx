import { MetricCard } from "@/components/MetricCard";
import { ProjectCard } from "@/components/ProjectCard";
import { MOCK_PROJECTS, MOCK_REVIEWS } from "@/data/mock";
import { FolderKanban, DollarSign, Star, TrendingUp } from "lucide-react";

const ContractorDashboard = () => {
  const myProjects = MOCK_PROJECTS.filter(p => p.contractorId === '1');
  const myReviews = MOCK_REVIEWS.filter(r => r.contractorId === '1');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Contractor Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, James Wilson</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Active Projects" value={myProjects.filter(p => p.status === 'IN_PROGRESS').length} icon={FolderKanban} />
        <MetricCard title="Total Earned" value="$245K" icon={DollarSign} trend={{ value: 18, positive: true }} />
        <MetricCard title="Rating" value="4.8" icon={Star} />
        <MetricCard title="Completion Rate" value="97%" icon={TrendingUp} />
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">Assigned Projects</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {myProjects.map(p => <ProjectCard key={p.id} project={p} showContractor={false} />)}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">Recent Reviews</h2>
        <div className="mt-4 space-y-3">
          {myReviews.map(r => (
            <div key={r.id} className="rounded-lg border border-border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{r.userName}</p>
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? 'fill-warning text-warning' : 'text-muted'}`} />
                  ))}
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContractorDashboard;
