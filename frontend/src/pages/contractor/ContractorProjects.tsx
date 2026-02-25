import { MOCK_PROJECTS } from "@/data/mock";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ProjectStatus } from "@/types";

const STATUSES: ("ALL" | ProjectStatus)[] = ["ALL", "IN_PROGRESS", "APPROVED", "COMPLETED"];

const ContractorProjects = () => {
  const [filter, setFilter] = useState<"ALL" | ProjectStatus>("ALL");
  const myProjects = MOCK_PROJECTS.filter(p => p.contractorId === "1");
  const filtered = myProjects.filter(p => filter === "ALL" || p.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Projects</h1>
        <p className="text-sm text-muted-foreground">Manage your assigned projects</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
            {s === "ALL" ? "All" : s === "IN_PROGRESS" ? "In Progress" : s.charAt(0) + s.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map(p => <ProjectCard key={p.id} project={p} showContractor={false} />)}
        {filtered.length === 0 && <p className="col-span-full text-center text-sm text-muted-foreground py-8">No projects found</p>}
      </div>
    </div>
  );
};

export default ContractorProjects;
