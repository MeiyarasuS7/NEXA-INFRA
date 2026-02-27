import { useState } from "react";
import { MOCK_CONTRACTORS } from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader, SearchFilter, ActionButton } from "@/pages/admin";
import { CheckCircle, XCircle, Star, MapPin } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const AdminContractors = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  const filters = (["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(status => ({
    label: status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase(),
    value: status,
    active: filter === status,
    onClick: () => setFilter(status)
  }));

  const filtered = MOCK_CONTRACTORS.filter(c => {
    const matchSearch = c.businessName.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || c.status === filter;
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

      <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{c.businessName}</p>
                    <p className="text-xs text-muted-foreground">{c.yearsExperience}y experience · {c.completedProjects} projects</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />{c.location}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {c.specialties.map(s => (
                      <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{s}</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    <span className="text-sm font-medium">{c.rating}</span>
                  </span>
                </TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell className="text-right">
                  {c.status === "PENDING" ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success/10">
                        <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                        <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost">View</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminContractors;
