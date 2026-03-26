import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, StatCard } from "@/pages/admin";
import { DollarSign, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";
import { paymentService } from "@/services/payment";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  _id: string;
  projectId?: {
    title?: string;
  };
  userId?: {
    name?: string;
    email?: string;
  };
  contractorId?: {
    company?: string;
  };
  amount: number;
  status: "pending" | "verification_pending" | "rejected" | "processing" | "completed" | "failed" | "refunded" | "disputed";
  paymentMethod: "card" | "bank_transfer" | "wallet" | "stripe" | "check" | "cash" | "other";
  refundReason?: string;
  offlineVerification?: {
    referenceNumber?: string;
    notes?: string;
    proofUrl?: string;
    submittedAt?: string;
    verificationNotes?: string;
    rejectionReason?: string;
  } | null;
  createdAt: string;
}

const AdminPayments = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState<Record<string, string>>({});

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getAllPayments();
      setPayments(data as Payment[]);
    } catch (requestError) {
      toast({
        title: "Unable to load payments",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayments();
  }, []);

  const stats = useMemo(() => {
    const completed = payments.filter((payment) => payment.status === "completed").length;
    const pending = payments.filter((payment) => payment.status === "pending" || payment.status === "processing").length;
    const disputed = payments.filter((payment) => payment.status === "disputed").length;
    const total = payments
      .filter((payment) => payment.status === "completed")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return { total, completed, pending, disputed };
  }, [payments]);

  const verifyOfflinePayment = async (paymentId: string, approved: boolean) => {
    try {
      setProcessingId(paymentId);
      await paymentService.verifyOfflinePayment(paymentId, approved, verificationNotes[paymentId]?.trim());
      await loadPayments();
      setVerificationNotes((current) => ({ ...current, [paymentId]: "" }));
      toast({
        title: approved ? "Offline payment approved" : "Offline payment rejected",
        description: "The payment record has been updated.",
      });
    } catch (requestError) {
      toast({
        title: "Unable to verify offline payment",
        description: requestError instanceof Error ? requestError.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const processRefund = async (paymentId: string, approved: boolean) => {
    try {
      setProcessingId(paymentId);
      await apiClient.post(`/payments/${paymentId}/process-refund`, {
        approved,
        adminNotes: approved ? "Refund approved by admin" : "Refund rejected by admin",
      });
      await loadPayments();
      toast({
        title: approved ? "Refund approved" : "Refund rejected",
        description: "The payment record has been updated.",
      });
    } catch (requestError) {
      toast({
        title: "Unable to update refund request",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Operations"
        description="Track live payments and process refund requests"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Completed Revenue" value={`$${(stats.total / 1000).toFixed(1)}K`} icon={DollarSign} trend={{ value: 12, positive: true }} />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} />
        <StatCard title="Pending" value={stats.pending} icon={Clock} />
        <StatCard title="Disputed" value={stats.disputed} icon={AlertTriangle} />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading payments...</div>
      ) : (
        <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Contractor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length > 0 ? (
                payments.map((payment) => {
                  const hasRefundRequest = payment.status === "pending" && Boolean(payment.refundReason);

                  return (
                    <TableRow key={payment._id}>
                      <TableCell className="font-medium text-foreground">{payment.projectId?.title || "Project unavailable"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-foreground">{payment.userId?.name || "Unknown client"}</p>
                          <p className="text-muted-foreground">{payment.userId?.email || ""}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{payment.contractorId?.company || "Unassigned"}</TableCell>
                      <TableCell className="font-medium text-foreground">${payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <StatusBadge status={payment.status} />
                          <p className="text-xs text-muted-foreground capitalize">{payment.paymentMethod.replace("_", " ")}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        {payment.status === "verification_pending" ? (
                          <div className="ml-auto max-w-xs space-y-2">
                            <div className="rounded-md border border-border bg-muted/40 p-2 text-left text-xs text-muted-foreground">
                              <p><span className="font-medium text-foreground">Ref:</span> {payment.offlineVerification?.referenceNumber || "Not provided"}</p>
                              {payment.offlineVerification?.notes && <p className="mt-1">{payment.offlineVerification.notes}</p>}
                            </div>
                            <Textarea
                              rows={2}
                              placeholder="Add approval note or rejection reason"
                              value={verificationNotes[payment._id] || ""}
                              onChange={(event) =>
                                setVerificationNotes((current) => ({ ...current, [payment._id]: event.target.value }))
                              }
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-success border-success/30"
                                disabled={processingId === payment._id}
                                onClick={() => void verifyOfflinePayment(payment._id, true)}
                              >
                                <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve Payment
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/30"
                                disabled={processingId === payment._id}
                                onClick={() => void verifyOfflinePayment(payment._id, false)}
                              >
                                <XCircle className="mr-1 h-3.5 w-3.5" /> Reject Payment
                              </Button>
                            </div>
                          </div>
                        ) : hasRefundRequest ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-success border-success/30"
                              disabled={processingId === payment._id}
                              onClick={() => void processRefund(payment._id, true)}
                            >
                              <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve Refund
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/30"
                              disabled={processingId === payment._id}
                              onClick={() => void processRefund(payment._id, false)}
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" /> Reject Refund
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {payment.offlineVerification?.rejectionReason
                              ? `Rejected: ${payment.offlineVerification.rejectionReason}`
                              : payment.refundReason
                                ? "Refund already handled"
                                : "No admin action required"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No payments found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
