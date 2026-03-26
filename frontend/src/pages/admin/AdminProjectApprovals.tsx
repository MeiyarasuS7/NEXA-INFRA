import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, CheckCircle, Loader, RefreshCw, X } from "lucide-react";
import { PageHeader } from "@/pages/admin";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { workflowApi, type WorkflowContractorSummary, type WorkflowProject } from "@/services/workflowApi";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const AdminProjectApprovals = () => {
  const [projects, setProjects] = useState<WorkflowProject[]>([]);
  const [contractors, setContractors] = useState<WorkflowContractorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOnProjectId, setActingOnProjectId] = useState<string | null>(null);
  const [selectedContractors, setSelectedContractors] = useState<Record<string, string>>({});
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pendingProjects, availableContractors] = await Promise.all([
        workflowApi.getPendingProjects(),
        workflowApi.getApprovedContractors(),
      ]);

      setProjects(pendingProjects);
      setContractors(availableContractors);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const contractorOptions = useMemo(
    () =>
      contractors.map((contractor) => ({
        value: contractor._id,
        label: contractor.company || contractor.userId?.name || "Unnamed contractor",
      })),
    [contractors]
  );

  const handleApprove = async (projectId: string) => {
    const contractorId = selectedContractors[projectId];
    const project = projects.find((item) => item._id === projectId);

    if (!contractorId) {
      setError("Select a contractor before approving the request.");
      return;
    }

    if (project?.payment?.status !== "completed") {
      setError("A verified payment is required before approval.");
      return;
    }

    try {
      setActingOnProjectId(projectId);
      await workflowApi.approveProject(projectId, contractorId);
      setProjects((current) => current.filter((project) => project._id !== projectId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve project");
    } finally {
      setActingOnProjectId(null);
    }
  };

  const handleReject = async (projectId: string) => {
    const reason = rejectionReasons[projectId]?.trim();

    if (!reason) {
      setError("Please provide a rejection reason.");
      return;
    }

    try {
      setActingOnProjectId(projectId);
      await workflowApi.rejectProject(projectId, reason);
      setProjects((current) => current.filter((project) => project._id !== projectId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject project");
    } finally {
      setActingOnProjectId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Project Approvals" description="Review client requests and map them to contractors." />
        <div className="py-12 text-center">
          <Loader className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading pending projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Project Approvals" description="Approve or reject client requests and assign contractors." />
        <Button onClick={() => void loadData()} disabled={loading} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
          <p className="text-lg font-medium text-foreground">All caught up</p>
          <p className="mt-1 text-muted-foreground">No client requests are waiting for approval right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project._id} className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">{project.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-semibold text-foreground">{formatCurrency(project.budget)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-semibold text-foreground">{project.location}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-2">
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="font-medium text-foreground">{project.userId.name}</p>
                    <p className="text-xs text-muted-foreground">{project.userId.email}</p>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Payment</p>
                    {project.payment ? (
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={project.payment.status} />
                          <span className="text-muted-foreground capitalize">{project.payment.paymentMethod.replace("_", " ")}</span>
                        </div>
                        <p className="font-medium text-foreground">{formatCurrency(project.payment.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          Reference: {project.payment.offlineVerification?.referenceNumber || "Not provided"}
                        </p>
                        {project.payment.offlineVerification?.rejectionReason && (
                          <p className="text-xs text-destructive">
                            Rejected: {project.payment.offlineVerification.rejectionReason}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Client has not submitted payment proof yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="mb-2 text-sm font-medium text-green-900">Approve And Map</p>
                    <p className="mb-3 text-xs text-green-800">
                      Pick the contractor you want to assign. Approval will also open the chat thread.
                    </p>
                    <Select
                      value={selectedContractors[project._id] || ""}
                      onValueChange={(value) =>
                        setSelectedContractors((current) => ({ ...current, [project._id]: value }))
                      }
                    >
                      <SelectTrigger className="mb-2 bg-white">
                        <SelectValue placeholder="Select contractor" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractorOptions.map((contractor) => (
                          <SelectItem key={contractor.value} value={contractor.value}>
                            {contractor.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="w-full gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => void handleApprove(project._id)}
                      disabled={
                        actingOnProjectId === project._id ||
                        contractorOptions.length === 0 ||
                        project.payment?.status !== "completed"
                      }
                    >
                      <Check className="h-4 w-4" />
                      {actingOnProjectId === project._id
                        ? "Approving..."
                        : project.payment?.status === "completed"
                          ? "Approve And Assign"
                          : "Waiting For Verified Payment"}
                    </Button>
                  </div>

                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="mb-2 text-sm font-medium text-red-900">Reject Request</p>
                    <textarea
                      placeholder="Enter rejection reason..."
                      value={rejectionReasons[project._id] || ""}
                      onChange={(event) =>
                        setRejectionReasons((current) => ({
                          ...current,
                          [project._id]: event.target.value,
                        }))
                      }
                      className="mb-2 w-full rounded border border-red-200 bg-white p-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-300"
                      rows={2}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-2 border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => void handleReject(project._id)}
                      disabled={actingOnProjectId === project._id}
                    >
                      <X className="h-4 w-4" />
                      {actingOnProjectId === project._id ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Submitted:{" "}
                {new Date(project.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProjectApprovals;
