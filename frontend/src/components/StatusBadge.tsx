import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      status: {
        PENDING: "bg-warning/15 text-warning border border-warning/20",
        APPROVED: "bg-success/15 text-success border border-success/20",
        REJECTED: "bg-destructive/15 text-destructive border border-destructive/20",
        IN_PROGRESS: "bg-info/15 text-info border border-info/20",
        COMPLETED: "bg-success/15 text-success border border-success/20",
        DISPUTED: "bg-secondary/15 text-secondary border border-secondary/20",
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
  APPROVED: "Approved",
  REJECTED: "Rejected",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  DISPUTED: "Disputed",
};

export const StatusBadge = ({ status, className, label }: StatusBadgeProps) => {
  const displayStatus = status || "PENDING";
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>
      {label || STATUS_LABELS[displayStatus]}
    </span>
  );
};
