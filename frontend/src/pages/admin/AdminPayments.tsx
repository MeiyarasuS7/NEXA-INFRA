import { MOCK_PROJECTS } from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DollarSign, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";

const MOCK_PAYMENTS = MOCK_PROJECTS.map((p, i) => ({
  id: `pay-${p.id}`,
  projectTitle: p.title,
  userName: p.userName || "Unknown",
  contractorName: p.contractorName || "Unassigned",
  amount: p.budget,
  status: (["VERIFIED", "PENDING", "VERIFIED", "VERIFIED", "DISPUTED"] as const)[i],
  date: p.startDate,
}));

const AdminPayments = () => (
  <div className="space-y-6">
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Payment Verification</h1>
      <p className="text-sm text-muted-foreground">Verify and track all platform payments</p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard title="Total Revenue" value="$353K" icon={DollarSign} trend={{ value: 12, positive: true }} />
      <MetricCard title="Verified" value={MOCK_PAYMENTS.filter(p => p.status === "VERIFIED").length} icon={CheckCircle} />
      <MetricCard title="Pending" value={MOCK_PAYMENTS.filter(p => p.status === "PENDING").length} icon={Clock} />
      <MetricCard title="Disputed" value={MOCK_PAYMENTS.filter(p => p.status === "DISPUTED").length} icon={AlertTriangle} />
    </div>

    <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Contractor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_PAYMENTS.map(p => (
            <TableRow key={p.id}>
              <TableCell className="font-medium text-foreground">{p.projectTitle}</TableCell>
              <TableCell className="text-muted-foreground">{p.userName}</TableCell>
              <TableCell className="text-muted-foreground">{p.contractorName}</TableCell>
              <TableCell className="font-medium text-foreground">${p.amount.toLocaleString()}</TableCell>
              <TableCell><StatusBadge status={p.status === "VERIFIED" ? "APPROVED" : p.status} label={p.status === "VERIFIED" ? "Verified" : undefined} /></TableCell>
              <TableCell className="text-right">
                {p.status === "PENDING" && (
                  <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success/10">
                    <CheckCircle className="mr-1 h-3.5 w-3.5" /> Verify
                  </Button>
                )}
                {p.status === "VERIFIED" && <span className="text-xs text-muted-foreground">Completed</span>}
                {p.status === "DISPUTED" && (
                  <Button size="sm" variant="outline" className="text-warning border-warning/30 hover:bg-warning/10">
                    <AlertTriangle className="mr-1 h-3.5 w-3.5" /> Review
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default AdminPayments;
