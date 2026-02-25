import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { UserCircle, Briefcase, MapPin, Award } from "lucide-react";

const ContractorProfilePage = () => (
  <div className="space-y-6 max-w-3xl">
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Profile Settings</h1>
      <p className="text-sm text-muted-foreground">Manage your contractor profile</p>
    </div>

    <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
      <div className="flex items-center gap-2">
        <UserCircle className="h-5 w-5 text-secondary" />
        <h2 className="font-heading text-lg font-semibold text-foreground">Personal Info</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Full Name</Label><Input defaultValue="James Wilson" /></div>
        <div className="space-y-1.5"><Label>Email</Label><Input defaultValue="james@contractor.com" /></div>
        <div className="space-y-1.5"><Label>Phone</Label><Input defaultValue="(512) 555-0187" /></div>
      </div>
    </div>

    <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
      <div className="flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-secondary" />
        <h2 className="font-heading text-lg font-semibold text-foreground">Business Details</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Business Name</Label><Input defaultValue="Wilson & Sons Construction" /></div>
        <div className="space-y-1.5"><Label>Hourly Rate ($)</Label><Input type="number" defaultValue="85" /></div>
      </div>
      <div className="space-y-1.5">
        <Label>Bio</Label>
        <Textarea defaultValue="Family-owned construction company specializing in residential builds and remodeling projects with over 15 years of experience." rows={3} />
      </div>
    </div>

    <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-secondary" />
        <h2 className="font-heading text-lg font-semibold text-foreground">Location & Specialties</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Location</Label><Input defaultValue="Austin, TX" /></div>
        <div className="space-y-1.5"><Label>Years of Experience</Label><Input type="number" defaultValue="15" /></div>
      </div>
      <div className="space-y-1.5">
        <Label>Specialties</Label>
        <div className="flex flex-wrap gap-2">
          {["Residential", "Remodeling", "Roofing"].map(s => (
            <span key={s} className="rounded-md bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">{s}</span>
          ))}
          <Button variant="outline" size="sm">+ Add</Button>
        </div>
      </div>
    </div>

    <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-secondary" />
        <h2 className="font-heading text-lg font-semibold text-foreground">Certifications</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {["Licensed General Contractor", "OSHA Certified"].map(c => (
          <span key={c} className="rounded-md bg-success/10 px-3 py-1 text-sm font-medium text-success">{c}</span>
        ))}
        <Button variant="outline" size="sm">+ Add</Button>
      </div>
    </div>

    <div className="flex justify-end">
      <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Save Profile</Button>
    </div>
  </div>
);

export default ContractorProfilePage;
