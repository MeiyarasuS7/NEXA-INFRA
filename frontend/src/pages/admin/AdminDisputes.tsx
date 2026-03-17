import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/pages/admin";
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_DISPUTES } from "@/data/mock";

interface Dispute {
  id: string;
  projectId: string;
  projectTitle: string;
  contractorId: string;
  contractorName: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed' | 'escalated';
  amount: number;
  createdAt: string;
  updatedAt: string;
  evidence?: string[];
}

const statusConfig = {
  open: { badge: 'DISPUTED', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  under_review: { badge: 'PENDING', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  resolved: { badge: 'RESOLVED', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  closed: { badge: 'CLOSED', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  escalated: { badge: 'ESCALATED', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
} as const;

const AdminDisputes = () => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const filteredDisputes = selectedFilter
    ? MOCK_DISPUTES.filter(d => d.status === selectedFilter)
    : MOCK_DISPUTES;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispute Resolution Center"
        description="Review and resolve platform disputes"
      />

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!selectedFilter ? "default" : "outline"}
          onClick={() => setSelectedFilter(null)}
          size="sm"
        >
          All Disputes ({MOCK_DISPUTES.length})
        </Button>
        {Object.keys(statusConfig).map(status => {
          const count = MOCK_DISPUTES.filter(d => d.status === status).length;
          if (count === 0) return null;
          return (
            <Button
              key={status}
              variant={selectedFilter === status ? "default" : "outline"}
              onClick={() => setSelectedFilter(status)}
              size="sm"
            >
              {statusConfig[status as keyof typeof statusConfig].badge} ({count})
            </Button>
          );
        })}
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.length > 0 ? (
          filteredDisputes.map(d => {
            const config = statusConfig[d.status as keyof typeof statusConfig];
            return (
              <div key={d.id} className="rounded-lg border border-border bg-card p-6 shadow-card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="font-heading text-lg font-semibold text-foreground">{d.title}</h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        <config.icon className="h-3.5 w-3.5" />
                        {config.badge}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{d.projectTitle}</span>
                      <span className="mx-2">·</span>
                      Contractor: {d.contractorName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">₹{d.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Claimed amount</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4 rounded-md bg-muted/50 p-4">
                  <p className="text-sm text-foreground leading-relaxed">{d.description}</p>
                </div>

                {/* Parties & Timeline */}
                <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">User</p>
                    <p className="text-sm font-medium text-foreground">{d.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Filed on</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(d.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last updated</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(d.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Evidence */}
                {d.evidence && d.evidence.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50/50 rounded-md border border-blue-200/30">
                    <p className="text-xs font-medium text-foreground mb-2">Evidence:</p>
                    <div className="flex flex-wrap gap-2">
                      {d.evidence.map((e, i) => (
                        <span key={i} className="inline-block px-2.5 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t border-border/50">
                  <Button size="sm" className="gap-2" variant={d.status === 'open' ? 'default' : 'outline'}>
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  {d.status === 'open' && (
                    <>
                      <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4" />
                        Resolve
                      </Button>
                      <Button size="sm" className="gap-2 border-orange-300" variant="outline">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        Escalate
                      </Button>
                    </>
                  )}
                  {d.status === 'under_review' && (
                    <Button size="sm" className="gap-2 bg-amber-600 hover:bg-amber-700">
                      <Clock className="h-4 w-4" />
                      Still Under Review
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium text-foreground">No disputes found</p>
            <p className="text-sm text-muted-foreground mt-1">All disputes with "{selectedFilter}" status are resolved</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-xs text-muted-foreground">Open Disputes</p>
          <p className="text-2xl font-bold text-red-600">{MOCK_DISPUTES.filter(d => d.status === 'open').length}</p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4">
          <p className="text-xs text-muted-foreground">Under Review</p>
          <p className="text-2xl font-bold text-yellow-600">{MOCK_DISPUTES.filter(d => d.status === 'under_review').length}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-xs text-muted-foreground">Resolved</p>
          <p className="text-2xl font-bold text-blue-600">{MOCK_DISPUTES.filter(d => d.status === 'resolved').length}</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-4">
          <p className="text-xs text-muted-foreground">Escalated</p>
          <p className="text-2xl font-bold text-orange-600">{MOCK_DISPUTES.filter(d => d.status === 'escalated').length}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDisputes;
