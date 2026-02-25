import { StatusBadge } from "./StatusBadge";
import { Calendar, DollarSign } from "lucide-react";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  showContractor?: boolean;
}

export const ProjectCard = ({ project, showContractor = true }: ProjectCardProps) => {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-card transition-all hover:shadow-elevated">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-base font-semibold text-foreground truncate">{project.title}</h3>
          {showContractor && project.contractorName && (
            <p className="mt-0.5 text-sm text-muted-foreground">{project.contractorName}</p>
          )}
        </div>
        <StatusBadge status={project.status} />
      </div>

      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{project.description}</p>

      {project.status === 'IN_PROGRESS' && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{project.progress}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-secondary transition-all duration-500" style={{ width: `${project.progress}%` }} />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5" />
          ${project.budget.toLocaleString()}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
};
