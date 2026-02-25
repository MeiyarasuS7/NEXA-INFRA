import { MOCK_PROJECTS } from "@/data/mock";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import type { ProjectStatus } from "@/types";

const STATUSES: ("ALL" | ProjectStatus)[] = ["ALL", "PENDING", "APPROVED", "IN_PROGRESS", "COMPLETED", "DISPUTED"];

const AdminProjects = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | ProjectStatus>("ALL");

  const filtered = MOCK_PROJECTS.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">All Projects</h1>
        <p className="text-sm text-muted-foreground">Monitor and manage all platform projects</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {STATUSES.map(s => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
            {s === "ALL" ? "All" : s === "IN_PROGRESS" ? "In Progress" : s.charAt(0) + s.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
        {filtered.length === 0 && <p className="col-span-full text-center text-sm text-muted-foreground py-8">No projects found</p>}
      </div>
    </div>
  );
};

export default AdminProjects;
