import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/pages/admin";
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/config/env";
import { authStorage } from "@/lib/authStorage";
import { useToast } from "@/hooks/use-toast";

interface Dispute {
  _id: string;
  projectId?: {
    _id: string;
    title?: string;
    type?: string;
    userId?: string;
    contractorId?: string;
  };
  title?: string;
  subject?: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "under_review" | "resolved" | "closed" | "escalated";
  evidence?: Array<{ type: string; url: string; description?: string }>;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  open: { badge: "DISPUTED", color: "bg-red-100 text-red-800", icon: AlertTriangle },
  under_review: { badge: "PENDING", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  resolved: { badge: "RESOLVED", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  closed: { badge: "CLOSED", color: "bg-green-100 text-green-800", icon: CheckCircle },
  escalated: { badge: "ESCALATED", color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
} as const;

const AdminDisputes = () => {
  const token = authStorage.getToken();
  const { toast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolutionDrafts, setResolutionDrafts] = useState<Record<string, string>>({});
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/admin/disputes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDisputes(Array.isArray(response.data.data?.disputes) ? response.data.data.disputes : []);
      } catch (requestError: any) {
        setError(requestError.response?.data?.message || "Failed to load disputes");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      void fetchDisputes();
      return;
    }

    setLoading(false);
    setError("Admin authentication is required");
  }, [token]);

  const filteredDisputes = useMemo(
    () => (selectedFilter ? disputes.filter((dispute) => dispute.status === selectedFilter) : disputes),
    [disputes, selectedFilter]
  );

  const counts = useMemo(
    () =>
      disputes.reduce<Record<string, number>>((accumulator, dispute) => {
        accumulator[dispute.status] = (accumulator[dispute.status] || 0) + 1;
        return accumulator;
      }, {}),
    [disputes]
  );

  const updateStatus = async (disputeId: string, status: "under_review" | "closed") => {
    try {
      setActioningId(disputeId);
      await axios.put(
        `${API_BASE_URL}/disputes/${disputeId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDisputes((current) =>
        current.map((dispute) =>
          dispute._id === disputeId ? { ...dispute, status, updatedAt: new Date().toISOString() } : dispute
        )
      );
      toast({
        title: status === "under_review" ? "Review started" : "Dispute closed",
        description: "The dispute workflow has been updated.",
      });
    } catch (requestError) {
      toast({
        title: "Unable to update dispute",
        description: "Please try that action again.",
        variant: "destructive",
      });
    } finally {
      setActioningId(null);
    }
  };

  const resolveDispute = async (disputeId: string) => {
    const resolution = resolutionDrafts[disputeId]?.trim();

    if (!resolution) {
      toast({
        title: "Resolution notes required",
        description: "Add a short resolution summary before resolving this dispute.",
        variant: "destructive",
      });
      return;
    }

    try {
      setActioningId(disputeId);
      await axios.post(
        `${API_BASE_URL}/disputes/${disputeId}/resolve`,
        {
          resolution,
          favoredParty: "admin_resolution",
          adminNotes: resolution,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDisputes((current) =>
        current.map((dispute) =>
          dispute._id === disputeId ? { ...dispute, status: "resolved", updatedAt: new Date().toISOString() } : dispute
        )
      );
      toast({
        title: "Dispute resolved",
        description: "The resolution was saved successfully.",
      });
    } catch (requestError) {
      toast({
        title: "Unable to resolve dispute",
        description: "Only disputes under review can be resolved.",
        variant: "destructive",
      });
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispute Resolution Center"
        description="Review and resolve platform disputes"
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant={!selectedFilter ? "default" : "outline"}
          onClick={() => setSelectedFilter(null)}
          size="sm"
        >
          All Disputes ({disputes.length})
        </Button>
        {Object.keys(statusConfig).map((status) => {
          const count = counts[status] || 0;
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

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
            Loading disputes...
          </div>
        ) : filteredDisputes.length > 0 ? (
          filteredDisputes.map((dispute) => {
            const config = statusConfig[dispute.status as keyof typeof statusConfig];
            const isExpanded = expandedId === dispute._id;
            const disputeTitle = dispute.title || dispute.subject || "Untitled dispute";

            return (
              <div
                key={dispute._id}
                className="rounded-lg border border-border bg-card p-6 shadow-card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="font-heading text-lg font-semibold text-foreground">{disputeTitle}</h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        <config.icon className="h-3.5 w-3.5" />
                        {config.badge}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {dispute.projectId?.title || "Project details unavailable"}
                      </span>
                      <span className="mx-2">·</span>
                      Category: {dispute.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={dispute.status} />
                    <p className="text-xs text-muted-foreground mt-2 capitalize">
                      Priority: {dispute.priority}
                    </p>
                  </div>
                </div>

                <div className="mb-4 rounded-md bg-muted/50 p-4">
                  <p className="text-sm text-foreground leading-relaxed">{dispute.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Project Type</p>
                    <p className="text-sm font-medium text-foreground">{dispute.projectId?.type || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Filed on</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(dispute.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last updated</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(dispute.updatedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {dispute.evidence && dispute.evidence.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50/50 rounded-md border border-blue-200/30">
                    <p className="text-xs font-medium text-foreground mb-2">Evidence:</p>
                    <div className="flex flex-wrap gap-2">
                      {dispute.evidence.map((item, index) => (
                        <span key={index} className="inline-block px-2.5 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          {item.description || item.type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {isExpanded && (
                  <div className="mb-4 rounded-md border border-border/60 bg-muted/20 p-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Dispute ID</p>
                      <p className="text-sm text-foreground">{dispute._id}</p>
                    </div>
                    {dispute.status === "under_review" && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Resolution Notes</p>
                        <Textarea
                          rows={3}
                          placeholder="Describe the resolution decision for this dispute"
                          value={resolutionDrafts[dispute._id] || ""}
                          onChange={(event) =>
                            setResolutionDrafts((current) => ({
                              ...current,
                              [dispute._id]: event.target.value,
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-3 border-t border-border/50">
                  <Button
                    size="sm"
                    className="gap-2"
                    variant={dispute.status === "open" ? "default" : "outline"}
                    onClick={() => setExpandedId((current) => (current === dispute._id ? null : dispute._id))}
                  >
                    <Eye className="h-4 w-4" />
                    {isExpanded ? "Hide Details" : "View Details"}
                  </Button>
                  {dispute.status === "open" && (
                    <>
                      <Button
                        size="sm"
                        className="gap-2 bg-amber-600 hover:bg-amber-700"
                        disabled={actioningId === dispute._id}
                        onClick={() => void updateStatus(dispute._id, "under_review")}
                      >
                        <Clock className="h-4 w-4" />
                        {actioningId === dispute._id ? "Updating..." : "Start Review"}
                      </Button>
                      <Button
                        size="sm"
                        className="gap-2 border-slate-300"
                        variant="outline"
                        disabled={actioningId === dispute._id}
                        onClick={() => void updateStatus(dispute._id, "closed")}
                      >
                        <XCircle className="h-4 w-4 text-slate-600" />
                        Close
                      </Button>
                    </>
                  )}
                  {dispute.status === "under_review" && (
                    <>
                      <Button
                        size="sm"
                        className="gap-2 bg-green-600 hover:bg-green-700"
                        disabled={actioningId === dispute._id}
                        onClick={() => void resolveDispute(dispute._id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                        {actioningId === dispute._id ? "Resolving..." : "Resolve"}
                      </Button>
                      <Button
                        size="sm"
                        className="gap-2 border-slate-300"
                        variant="outline"
                        disabled={actioningId === dispute._id}
                        onClick={() => void updateStatus(dispute._id, "closed")}
                      >
                        <XCircle className="h-4 w-4 text-slate-600" />
                        Close
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium text-foreground">No disputes found</p>
            <p className="text-sm text-muted-foreground mt-1">
              All disputes with "{selectedFilter}" status are resolved
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-xs text-muted-foreground">Open Disputes</p>
          <p className="text-2xl font-bold text-red-600">{counts.open || 0}</p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4">
          <p className="text-xs text-muted-foreground">Under Review</p>
          <p className="text-2xl font-bold text-yellow-600">{counts.under_review || 0}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-xs text-muted-foreground">Resolved</p>
          <p className="text-2xl font-bold text-blue-600">{counts.resolved || 0}</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-4">
          <p className="text-xs text-muted-foreground">Closed</p>
          <p className="text-2xl font-bold text-orange-600">{counts.closed || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDisputes;
