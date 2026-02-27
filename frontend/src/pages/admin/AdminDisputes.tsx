import { MOCK_PROJECTS } from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader, ActionButton } from "@/pages/admin";
import { AlertTriangle, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_DISPUTES = MOCK_PROJECTS.filter(p => p.status === "DISPUTED").map(p => ({
  id: `disp-${p.id}`,
  projectTitle: p.title,
  userName: p.userName || "Unknown",
  contractorName: p.contractorName || "Unknown",
  reason: "Disagreement over project scope and timeline. Client claims incomplete work.",
  filedDate: "2026-01-15",
  status: "OPEN" as const,
  budget: p.budget,
}));

// Add a couple more for richness
const ALL_DISPUTES = [
  ...MOCK_DISPUTES,
  { id: "disp-extra-1", projectTitle: "Deck Expansion", userName: "John Davis", contractorName: "Wilson & Sons Construction", reason: "Contractor used different materials than agreed upon in the contract.", filedDate: "2026-01-20", status: "UNDER_REVIEW" as const, budget: 18000 },
  { id: "disp-extra-2", projectTitle: "Garage Conversion", userName: "Emily Ross", contractorName: "HomeStyle Renovations", reason: "Project delayed by 3 weeks beyond agreed completion date.", filedDate: "2025-12-28", status: "RESOLVED" as const, budget: 32000 },
];

const statusMap = { OPEN: "DISPUTED", UNDER_REVIEW: "PENDING", RESOLVED: "COMPLETED" } as const;

const AdminDisputes = () => (
  <div className="space-y-6">
    <PageHeader
      title="Dispute Resolution Center"
      description="Review and resolve platform disputes"
    />

    <div className="space-y-4">
      {ALL_DISPUTES.map(d => (
        <div key={d.id} className="rounded-lg border border-border bg-card p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading text-base font-semibold text-foreground">{d.projectTitle}</h3>
                <StatusBadge status={statusMap[d.status]} label={d.status.replace("_", " ")} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{d.userName}</span> vs <span className="font-medium text-foreground">{d.contractorName}</span>
                <span className="mx-2">·</span> Filed {new Date(d.filedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                <span className="mx-2">·</span> ${d.budget.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-3 rounded-md bg-muted/50 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">{d.reason}</p>
            </div>
          </div>
          {d.status !== "RESOLVED" && (
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline"><MessageSquare className="mr-1 h-3.5 w-3.5" /> Contact Parties</Button>
              <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success/10">
                <CheckCircle className="mr-1 h-3.5 w-3.5" /> Resolve in Favor of Client
              </Button>
              <Button size="sm" variant="outline" className="text-info border-info/30 hover:bg-info/10">
                <CheckCircle className="mr-1 h-3.5 w-3.5" /> Resolve in Favor of Contractor
              </Button>
              <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                <XCircle className="mr-1 h-3.5 w-3.5" /> Escalate
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default AdminDisputes;
