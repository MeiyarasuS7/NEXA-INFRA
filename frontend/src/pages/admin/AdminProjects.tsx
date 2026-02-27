import { useState } from "react";
import { MOCK_PROJECTS } from "@/data/mock";
import { ProjectCard } from "@/components/ProjectCard";
import { PageHeader, SearchFilter } from "@/pages/admin";
import type { ProjectStatus } from "@/types";

const STATUSES: ("ALL" | ProjectStatus)[] = ["ALL", "PENDING", "APPROVED", "IN_PROGRESS", "COMPLETED", "DISPUTED"];

const AdminProjects = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | ProjectStatus>("ALL");

  const filters = STATUSES.map(status => ({
    label: status === "ALL" ? "All" : status === "IN_PROGRESS" ? "In Progress" : status.charAt(0) + status.slice(1).toLowerCase(),
    value: status,
    active: filter === status,
    onClick: () => setFilter(status)
  }));

  const filtered = MOCK_PROJECTS.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || p.status === filter;
    return matchSearch && matchFilter;
  });

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
        {filtered.length === 0 && <p className="col-span-full text-center text-sm text-muted-foreground py-8">No projects found</p>}
      </div>
    </div>
  );
};

export default AdminProjects;
