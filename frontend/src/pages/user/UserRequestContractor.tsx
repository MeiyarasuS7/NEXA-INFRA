import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserRequestContractor = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Request Submitted", description: "Your contractor request has been submitted for review." });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Request a Contractor</h1>
        <p className="text-sm text-muted-foreground">Fill in your project details to find the right contractor</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 shadow-card space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-secondary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Project Details</h2>
        </div>

        <div className="space-y-1.5">
          <Label>Project Title</Label>
          <Input placeholder="e.g., Kitchen Remodel" required />
        </div>

        <div className="space-y-1.5">
          <Label>Project Type</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select project type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="remodeling">Remodeling</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="roofing">Roofing</SelectItem>
              <SelectItem value="landscaping">Landscaping</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea placeholder="Describe your project in detail..." rows={4} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Budget ($)</Label>
            <Input type="number" placeholder="e.g., 25000" required />
          </div>
          <div className="space-y-1.5">
            <Label>Desired Start Date</Label>
            <Input type="date" required />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input placeholder="e.g., Austin, TX" required />
          </div>
          <div className="space-y-1.5">
            <Label>Timeline (weeks)</Label>
            <Input type="number" placeholder="e.g., 8" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Additional Notes</Label>
          <Textarea placeholder="Any specific requirements or preferences..." rows={3} />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserRequestContractor;
