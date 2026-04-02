import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/config/env";
import { authStorage } from "@/lib/authStorage";
import { UserCircle, Briefcase, MapPin, Award } from "lucide-react";

interface ContractorProfileForm {
  contractorId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  hourlyRate: string;
  bio: string;
  location: string;
  experience: string;
  specialties: string;
  certifications: string[];
}

const ContractorProfilePage = () => {
  const { updateUser } = useAuth();
  const { toast } = useToast();
  const token = authStorage.getToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ContractorProfileForm>({
    contractorId: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    hourlyRate: "",
    bio: "",
    location: "",
    experience: "",
    specialties: "",
    certifications: [],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/contractors/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const contractor = response.data.data?.contractor;
        const account = contractor?.userId;

        setForm({
          contractorId: contractor?._id || "",
          name: account?.name || "",
          email: account?.email || "",
          phone: account?.phone || "",
          company: contractor?.company || "",
          hourlyRate: contractor?.hourlyRate ? String(contractor.hourlyRate) : "",
          bio: contractor?.bio || "",
          location: account?.location || "",
          experience: contractor?.experience ? String(contractor.experience) : "",
          specialties: Array.isArray(contractor?.specialties) ? contractor.specialties.join(", ") : "",
          certifications: Array.isArray(contractor?.certifications)
            ? contractor.certifications.map((item: { name: string }) => item.name)
            : [],
        });
      } catch (error) {
        toast({
          title: "Unable to load contractor profile",
          description: "The latest business details could not be loaded.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      void fetchProfile();
      return;
    }

    setLoading(false);
  }, [toast, token]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const [userResponse, contractorResponse] = await Promise.all([
        axios.put(
          `${API_BASE_URL}/auth/me`,
          {
            name: form.name.trim(),
            phone: form.phone.trim(),
            location: form.location.trim(),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.put(
          `${API_BASE_URL}/contractors/${form.contractorId}`,
          {
            company: form.company.trim(),
            hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
            bio: form.bio.trim(),
            experience: form.experience ? Number(form.experience) : 0,
            specialties: form.specialties
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      const profile = userResponse.data.data?.user;
      const contractor = contractorResponse.data.data?.contractor;
      const nameParts = (profile?.name || form.name).trim().split(/\s+/);

      updateUser({
        full_name: profile?.name || form.name.trim(),
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" "),
        email: profile?.email || form.email,
        phone: profile?.phone || form.phone.trim(),
      });

      setForm((current) => ({
        ...current,
        name: profile?.name || current.name,
        email: profile?.email || current.email,
        phone: profile?.phone || current.phone,
        location: profile?.location || current.location,
        company: contractor?.company || current.company,
        hourlyRate: contractor?.hourlyRate ? String(contractor.hourlyRate) : current.hourlyRate,
        bio: contractor?.bio || current.bio,
        experience: contractor?.experience ? String(contractor.experience) : current.experience,
        specialties: Array.isArray(contractor?.specialties)
          ? contractor.specialties.join(", ")
          : current.specialties,
        certifications: Array.isArray(contractor?.certifications)
          ? contractor.certifications.map((item: { name: string }) => item.name)
          : current.certifications,
      }));

      toast({
        title: "Profile updated",
        description: "Your contractor profile has been saved.",
      });
    } catch (error) {
      toast({
        title: "Unable to save contractor profile",
        description: "Please review your changes and try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (
    label: string,
    value: keyof ContractorProfileForm,
    options?: { type?: string; readOnly?: boolean }
  ) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={options?.type}
        readOnly={options?.readOnly}
        value={typeof form[value] === "string" ? (form[value] as string) : ""}
        onChange={(event) => setForm((current) => ({ ...current, [value]: event.target.value }))}
      />
    </div>
  );

  return (
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
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {renderInput("Full Name", "name")}
            {renderInput("Email", "email", { readOnly: true })}
            {renderInput("Phone", "phone")}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-secondary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Business Details</h2>
        </div>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {renderInput("Business Name", "company")}
              {renderInput("Hourly Rate (Rs)", "hourlyRate", { type: "number" })}
            </div>
            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Textarea
                rows={3}
                value={form.bio}
                onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              />
            </div>
          </>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-secondary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Location & Specialties</h2>
        </div>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {renderInput("Location", "location")}
              {renderInput("Years of Experience", "experience", { type: "number" })}
            </div>
            <div className="space-y-1.5">
              <Label>Specialties</Label>
              <Textarea
                rows={3}
                placeholder="Separate specialties with commas"
                value={form.specialties}
                onChange={(event) => setForm((current) => ({ ...current, specialties: event.target.value }))}
              />
            </div>
          </>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-secondary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Certifications</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.certifications.length > 0 ? (
            form.certifications.map((item) => (
              <span key={item} className="rounded-md bg-success/10 px-3 py-1 text-sm font-medium text-success">
                {item}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">No certifications added yet.</span>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          disabled={loading || saving || !form.contractorId}
          onClick={() => void handleSave()}
        >
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
};

export default ContractorProfilePage;
