import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/config/env";
import { authStorage } from "@/lib/authStorage";
import { UserCircle, Bell, Shield } from "lucide-react";

interface UserProfileForm {
  name: string;
  email: string;
  phone: string;
  location: string;
}

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const token = authStorage.getToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UserProfileForm>({
    name: "",
    email: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = response.data.data?.user;

        setForm({
          name: profile?.name || user?.full_name || "",
          email: profile?.email || user?.email || "",
          phone: profile?.phone || "",
          location: profile?.location || "",
        });
      } catch (error) {
        toast({
          title: "Unable to load profile",
          description: "The latest account details could not be loaded.",
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

    setForm({
      name: user?.full_name || "",
      email: user?.email || "",
      phone: "",
      location: "",
    });
    setLoading(false);
  }, [toast, token, user?.email, user?.full_name]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await axios.put(
        `${API_BASE_URL}/auth/me`,
        {
          name: form.name.trim(),
          phone: form.phone.trim(),
          location: form.location.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const profile = response.data.data?.user;
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
      }));

      toast({
        title: "Profile updated",
        description: "Your account information has been saved.",
      });
    } catch (error) {
      toast({
        title: "Unable to save profile",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label: string, value: keyof UserProfileForm, readOnly = false) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        value={form[value]}
        readOnly={readOnly}
        onChange={(event) => setForm((current) => ({ ...current, [value]: event.target.value }))}
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-secondary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Personal Information</h2>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {renderField("Full Name", "name")}
            {renderField("Email", "email", true)}
            {renderField("Phone", "phone")}
            {renderField("Location", "location")}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-secondary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Notifications</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Project Updates</p>
              <p className="text-xs text-muted-foreground">Get notified when your project status changes</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Messages</p>
              <p className="text-xs text-muted-foreground">Notifications for new messages from contractors</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Marketing Emails</p>
              <p className="text-xs text-muted-foreground">Receive promotions and platform updates</p>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-secondary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Security</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Current Password</Label><Input type="password" disabled /></div>
          <div className="space-y-1.5"><Label>New Password</Label><Input type="password" disabled /></div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          disabled={loading || saving}
          onClick={() => void handleSave()}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
