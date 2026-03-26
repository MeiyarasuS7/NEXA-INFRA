import { useEffect, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { PageHeader, SearchFilter } from "@/pages/admin";
import type { ProjectStatus } from "@/types";
import { API_BASE_URL } from "@/config/env";
import { authStorage } from "@/lib/authStorage";
import axios from "axios";

const STATUSES: ("ALL" | ProjectStatus)[] = ["ALL", "pending", "approved", "in_progress", "completed", "disputed", "cancelled"];
interface Project {
  _id: string;
  title: string;
  status: ProjectStatus;
  budget: number;
  userId: string;
  contractorId?: string;
  createdAt: string;
}

const AdminProjects = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | ProjectStatus>("ALL");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = authStorage.getToken();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/admin/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allProjects = Array.isArray(res.data.data?.projects) ? res.data.data.projects : [];
        setProjects(allProjects);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError(err.response?.data?.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProjects();
    }
  }, [token]);

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    in_progress: 'In Progress',
    completed: 'Completed',
    disputed: 'Disputed',
    cancelled: 'Cancelled',
    ALL: 'All'
  };

  const filters = STATUSES.map(status => ({
    label: statusLabels[status] || status,
    value: status,
    active: filter === status,
    onClick: () => setFilter(status)
  }));

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || p.status === filter;
    return matchSearch && matchFilter;
  });

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="All Projects"
          description="Monitor and manage all platform projects"
        />
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Projects"
        description="Monitor and manage all platform projects"
      />

      <SearchFilter
        value={search}
        onChange={setSearch}
        placeholder="Search projects..."
        filters={filters}
      />

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => <ProjectCard key={p._id} project={p as any} />)}
          {filtered.length === 0 && <p className="col-span-full text-center text-sm text-muted-foreground py-8">No projects found</p>}
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
