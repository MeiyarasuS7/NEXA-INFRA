import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/pages/admin";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Dispute {
  _id: string;
  projectId: string;
  title?: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

const statusMap = { open: "DISPUTED", under_review: "PENDING", resolved: "COMPLETED", closed: "COMPLETED", escalated: "ESCALATED" } as const;

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('nexa_auth_token');

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/admin/disputes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allDisputes = Array.isArray(res.data.data?.disputes) ? res.data.data.disputes : [];
        setDisputes(allDisputes);
      } catch (err) {
        console.error('Error fetching disputes:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDisputes();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dispute Resolution Center"
          description="Review and resolve platform disputes"
        />
        <div className="text-center py-8 text-muted-foreground">Loading disputes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispute Resolution Center"
        description="Review and resolve platform disputes"
      />

      <div className="space-y-4">
        {disputes.length > 0 ? disputes.map(d => (
          <div key={d._id} className="rounded-lg border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading text-base font-semibold text-foreground">{d.title || d.projectId}</h3>
                  <StatusBadge status={statusMap[d.status] || 'PENDING'} label={d.status.toUpperCase().replace("_", " ")} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Filed {new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  <span className="mx-2">·</span>
                  <span className="capitalize font-medium">{d.priority} Priority</span>
                </p>
              </div>
              <div className="flex gap-2">
                {d.status === 'open' && (
                  <>
                    <Button size="sm" className="text-success border-success/30">
                      <CheckCircle className="mr-1 h-3.5 w-3.5" /> Resolve
                    </Button>
                    <Button size="sm" variant="outline">
                      <AlertTriangle className="mr-1 h-3.5 w-3.5" /> Review
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-3 rounded-md bg-muted/50 p-3">
              <p className="text-sm text-foreground">{d.description}</p>
            </div>
          </div>
        )) : (
          <div className="text-center py-12 text-muted-foreground">No active disputes</div>
        )}
      </div>
    </div>
  );
};

export default AdminDisputes;
