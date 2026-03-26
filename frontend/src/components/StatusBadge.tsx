import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const normalizeStatus = (value?: string | null) =>
  (value || "PENDING")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
        status: {
          PENDING: "bg-warning/15 text-warning border border-warning/20",
          VERIFICATION_PENDING: "bg-info/15 text-info border border-info/20",
          APPROVED: "bg-success/15 text-success border border-success/20",
        REJECTED: "bg-destructive/15 text-destructive border border-destructive/20",
        IN_PROGRESS: "bg-info/15 text-info border border-info/20",
        COMPLETED: "bg-success/15 text-success border border-success/20",
        DISPUTED: "bg-secondary/15 text-secondary border border-secondary/20",
        CANCELLED: "bg-muted text-muted-foreground border border-border",
        ACTIVE: "bg-success/15 text-success border border-success/20",
        SUSPENDED: "bg-destructive/15 text-destructive border border-destructive/20",
        FLAGGED: "bg-warning/15 text-warning border border-warning/20",
      },
    },
    defaultVariants: {
      status: "PENDING",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  className?: string;
  label?: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  VERIFICATION_PENDING: "Verification Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  DISPUTED: "Disputed",
  CANCELLED: "Cancelled",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  FLAGGED: "Flagged",
};

export const StatusBadge = ({ status, className, label }: StatusBadgeProps) => {
  const displayStatus = normalizeStatus(status);
  return (
    <span className={cn(statusBadgeVariants({ status: displayStatus as never }), className)}>
      {label || STATUS_LABELS[displayStatus] || displayStatus.replace(/_/g, " ")}
    </span>
  );
};
