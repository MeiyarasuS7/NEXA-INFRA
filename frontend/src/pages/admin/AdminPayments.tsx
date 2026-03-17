import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard } from "@/pages/admin";
import { DollarSign, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Payment {
  _id: string;
  projectId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed';
  paymentMethod: 'card' | 'bank_transfer' | 'wallet' | 'stripe';
  createdAt: string;
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, disputed: 0 });
  const token = localStorage.getItem('nexa_auth_token');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/admin/payments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allPayments = Array.isArray(res.data.data?.payments) ? res.data.data.payments : [];
        setPayments(allPayments);
        
        // Calculate stats
        const completed = allPayments.filter((p: Payment) => p.status === 'completed').length;
        const pending = allPayments.filter((p: Payment) => p.status === 'pending' || p.status === 'processing').length;
        const disputed = allPayments.filter((p: Payment) => p.status === 'disputed').length;
        const total = allPayments.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0);
        
        setStats({ total, completed, pending, disputed });
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPayments();
    }
  }, [token]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Verification"
        description="Verify and track all platform payments"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={`$${(stats.total / 1000).toFixed(1)}K`} icon={DollarSign} trend={{ value: 12, positive: true }} />
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
                <TableHead>Project ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length > 0 ? payments.map(p => (
                <TableRow key={p._id}>
                  <TableCell className="font-medium text-foreground">{p.projectId}</TableCell>
                  <TableCell className="font-medium text-foreground">${p.amount.toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={p.status === 'completed' ? 'APPROVED' : p.status === 'pending' ? 'PENDING' : 'FAILED'} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    {p.status === 'pending' && (
                      <Button size="sm" variant="outline" className="text-success border-success/30">
                        <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No payments found</TableCell>
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
