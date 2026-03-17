import { useEffect, useState } from "react";
import { PageHeader, SearchFilter } from "@/pages/admin";
import { CheckCircle, XCircle, Star } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Contractor {
  _id: string;
  userId: { name: string; email: string; phone: string };
  company?: string;
  specialties: string[];
  rating: number;
  experience: number;
  isVerified: boolean;
  isActive: boolean;
  availability: 'available' | 'busy' | 'unavailable';
}

const AdminContractors = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "VERIFIED" | "UNVERIFIED" | "ACTIVE" | "INACTIVE">("ALL");
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('nexa_auth_token');

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/admin/contractors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allContractors = Array.isArray(res.data.data?.contractors) ? res.data.data.contractors : [];
        setContractors(allContractors);
      } catch (err) {
        console.error('Error fetching contractors:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchContractors();
    }
  }, [token]);

  const filters = (["ALL", "VERIFIED", "UNVERIFIED", "ACTIVE", "INACTIVE"] as const).map(status => ({
    label: status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase(),
    value: status,
    active: filter === status,
    onClick: () => setFilter(status)
  }));

  const filtered = contractors.filter(c => {
    const matchSearch = (c.company || c.userId?.name || '').toLowerCase().includes(search.toLowerCase()) || (c.userId?.phone || '').includes(search);
    const matchFilter = filter === "ALL" || 
      (filter === "VERIFIED" && c.isVerified) ||
      (filter === "UNVERIFIED" && !c.isVerified) ||
      (filter === "ACTIVE" && c.isActive) ||
      (filter === "INACTIVE" && !c.isActive);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contractor Management"
        description="Approve, reject, and manage contractors"
      />

      <SearchFilter
        value={search}
        onChange={setSearch}
        placeholder="Search contractors..."
        filters={filters}
      />

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading contractors...</div>
      ) : (
        <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company / Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? filtered.map(c => (
                <TableRow key={c._id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{c.company || c.userId?.name}</p>
                    <p className="text-xs text-muted-foreground">{c.userId?.email}</p>
                  </TableCell>
                  <TableCell>{c.userId?.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{c.specialties?.join(', ') || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-medium">{c.rating || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${c.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                      <span className="text-sm">{c.isVerified ? 'Verified' : 'Pending'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {!c.isVerified && (
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" className="text-success border-success/30">
                          <CheckCircle className="mr-1 h-3.5 w-3.5" /> Verify
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30">
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No contractors found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminContractors;
