import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Textarea } from "@/components/ui/textarea";
import { workflowApi, type WorkflowProject } from "@/services/workflowApi";
import { paymentService } from "@/services/payment";

const FILTERS = ["ALL", "pending", "approved", "in_progress", "completed", "cancelled", "disputed"] as const;

const statusLabel = (status: WorkflowProject["status"] | "ALL") => {
  if (status === "ALL") {
    return "All";
  }

  return status.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const UserProjects = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [projects, setProjects] = useState<WorkflowProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<Record<string, {
    paymentMethod: "bank_transfer" | "check" | "cash" | "other";
    referenceNumber: string;
    paidAt: string;
    notes: string;
    proofUrl: string;
  }>>({});
  const [submittingPaymentId, setSubmittingPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        setProjects(await workflowApi.getProjects());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    void loadProjects();
  }, []);

  const filteredProjects = useMemo(
    () => projects.filter((project) => filter === "ALL" || project.status === filter),
    [filter, projects]
  );

  const updatePaymentForm = (
    projectId: string,
    updates: Partial<{
      paymentMethod: "bank_transfer" | "check" | "cash" | "other";
      referenceNumber: string;
      paidAt: string;
      notes: string;
      proofUrl: string;
    }>
  ) => {
    setPaymentForm((current) => ({
      ...current,
      [projectId]: {
        paymentMethod: "bank_transfer",
        referenceNumber: "",
        paidAt: new Date().toISOString().slice(0, 16),
        notes: "",
        proofUrl: "",
        ...current[projectId],
        ...updates,
      },
    }));
  };

  const submitOfflinePayment = async (project: WorkflowProject) => {
    const form = paymentForm[project._id] || {
      paymentMethod: "bank_transfer" as const,
      referenceNumber: "",
      paidAt: new Date().toISOString().slice(0, 16),
      notes: "",
      proofUrl: "",
    };

    if (!form.referenceNumber.trim()) {
      setError("Please enter the payment reference number.");
      return;
    }

    try {
      setSubmittingPaymentId(project._id);
      setError(null);
      const payment = await paymentService.submitOfflinePayment({
        projectId: project._id,
        amount: project.budget,
        paymentMethod: form.paymentMethod,
        referenceNumber: form.referenceNumber.trim(),
        paidAt: form.paidAt,
        notes: form.notes.trim() || undefined,
        proofUrl: form.proofUrl.trim() || undefined,
      });

      setProjects((current) =>
        current.map((item) => (item._id === project._id ? { ...item, payment } : item))
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to submit offline payment");
    } finally {
      setSubmittingPaymentId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Projects</h1>
        <p className="text-sm text-muted-foreground">
          Track request approvals, mapped contractors, and your live project conversations.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item}
            variant={filter === item ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(item)}
          >
            {statusLabel(item)}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
          Loading your projects...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No projects found for this filter.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <div key={project._id} className="rounded-lg border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{statusLabel(project.status)}</p>
                </div>
                <p className="text-sm font-medium text-foreground">{currency(project.budget)}</p>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">{project.description}</p>

              <div className="mt-4 space-y-1 text-sm">
                <p><span className="text-muted-foreground">Type:</span> {project.type}</p>
                <p><span className="text-muted-foreground">Location:</span> {project.location}</p>
                <p><span className="text-muted-foreground">Timeline:</span> {project.timeline}</p>
                <p>
                  <span className="text-muted-foreground">Contractor:</span>{" "}
                  {project.contractorId?.company || project.contractorId?.userId?.name || "Waiting for admin mapping"}
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Payment</p>
                    <p className="text-xs text-muted-foreground">
                      Submit your offline payment details so admin can verify them before approving this request.
                    </p>
                  </div>
                  {project.payment ? <StatusBadge status={project.payment.status} /> : <StatusBadge status="pending" label="Not Submitted" />}
                </div>

                {project.payment && (
                  <div className="mt-3 space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Method:</span> {project.payment.paymentMethod.replace("_", " ")}</p>
                    <p><span className="text-muted-foreground">Amount:</span> {currency(project.payment.amount)}</p>
                    <p><span className="text-muted-foreground">Reference:</span> {project.payment.offlineVerification?.referenceNumber || "Not provided"}</p>
                    {project.payment.offlineVerification?.verificationNotes && (
                      <p><span className="text-muted-foreground">Admin Notes:</span> {project.payment.offlineVerification.verificationNotes}</p>
                    )}
                    {project.payment.offlineVerification?.rejectionReason && (
                      <p className="text-destructive"><span className="text-muted-foreground">Rejection:</span> {project.payment.offlineVerification.rejectionReason}</p>
                    )}
                  </div>
                )}

                {project.payment?.status !== "completed" && project.approvalStatus === "pending" && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Offline Payment Method</Label>
                      <Select
                        value={paymentForm[project._id]?.paymentMethod || "bank_transfer"}
                        onValueChange={(value: "bank_transfer" | "check" | "cash" | "other") =>
                          updatePaymentForm(project._id, { paymentMethod: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Reference Number</Label>
                      <Input
                        value={paymentForm[project._id]?.referenceNumber || ""}
                        onChange={(event) => updatePaymentForm(project._id, { referenceNumber: event.target.value })}
                        placeholder="UTR / cheque no / receipt no"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Paid At</Label>
                      <Input
                        type="datetime-local"
                        value={paymentForm[project._id]?.paidAt || new Date().toISOString().slice(0, 16)}
                        onChange={(event) => updatePaymentForm(project._id, { paidAt: event.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Proof URL (optional)</Label>
                      <Input
                        value={paymentForm[project._id]?.proofUrl || ""}
                        onChange={(event) => updatePaymentForm(project._id, { proofUrl: event.target.value })}
                        placeholder="Drive link / receipt image link"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Notes</Label>
                      <Textarea
                        rows={3}
                        value={paymentForm[project._id]?.notes || ""}
                        onChange={(event) => updatePaymentForm(project._id, { notes: event.target.value })}
                        placeholder="Add transfer details or anything admin should verify"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <Button
                        onClick={() => void submitOfflinePayment(project)}
                        disabled={submittingPaymentId === project._id}
                      >
                        {submittingPaymentId === project._id
                          ? "Submitting..."
                          : project.payment?.status === "rejected"
                            ? "Resubmit Payment Proof"
                            : "Submit Offline Payment"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {project.approvalStatus === "rejected" && project.rejectionReason && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Rejected: {project.rejectionReason}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                {project.conversationId && (
                  <Button variant="outline" onClick={() => navigate(`/user/chat?conversation=${project.conversationId}`)}>
                    Open Chat
                  </Button>
                )}
                {!project.conversationId && (
                  <Button variant="outline" disabled>
                    Chat opens after approval
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProjects;
