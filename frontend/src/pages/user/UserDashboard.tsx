import { MetricCard } from "@/components/MetricCard";
import { ProjectCard } from "@/components/ProjectCard";
import { MOCK_PROJECTS } from "@/data/mock";
import { FolderKanban, DollarSign, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();
  const myProjects = MOCK_PROJECTS.filter(p => p.userId === '3');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, Sarah Chen</p>
        </div>
        <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={() => navigate('/user/request-contractor')}>
          Request Contractor
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Active Projects" value={myProjects.filter(p => ['IN_PROGRESS', 'APPROVED'].includes(p.status)).length} icon={FolderKanban} />
        <MetricCard title="Total Spent" value="$165K" icon={DollarSign} />
        <MetricCard title="Messages" value="12" icon={MessageSquare} subtitle="3 unread" />
        <MetricCard title="Pending" value={myProjects.filter(p => p.status === 'PENDING').length} icon={Clock} />
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">My Projects</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {myProjects.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
