import { Star, MapPin, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import type { Contractor } from "@/types";

const AVATAR_COLORS = [
  "bg-primary", "bg-secondary", "bg-info", "bg-success", "bg-warning",
];

interface ContractorCardProps {
  contractor: Contractor;
}

export const ContractorCard = ({ contractor }: ContractorCardProps) => {
  const colorClass = AVATAR_COLORS[parseInt(contractor.id) % AVATAR_COLORS.length];
  const initials = contractor.businessName.split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <Link to={`/contractor/${contractor.id}`} className="group block">
      <div className="rounded-lg border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
        <div className="flex items-start gap-4">
          <div className={`${colorClass} flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-primary-foreground`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-base font-semibold text-foreground truncate">
                {contractor.businessName}
              </h3>
              {contractor.verified && (
                <CheckCircle className="h-4 w-4 shrink-0 text-success" />
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {contractor.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {contractor.yearsExperience}y exp
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{contractor.bio}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {contractor.specialties.slice(0, 3).map(s => (
            <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(contractor.rating) ? 'fill-warning text-warning' : 'text-muted'}`} />
              ))}
            </div>
            <span className="text-sm font-medium">{contractor.rating}</span>
            <span className="text-xs text-muted-foreground">({contractor.reviewCount})</span>
          </div>
          <span className="text-sm font-semibold text-foreground">
            {contractor.completedProjects} projects
          </span>
        </div>
      </div>
    </Link>
  );
};
