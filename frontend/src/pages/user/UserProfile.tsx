import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { UserCircle, Bell, Shield } from "lucide-react";

const UserProfile = () => (
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Full Name</Label><Input defaultValue="Sarah Chen" /></div>
        <div className="space-y-1.5"><Label>Email</Label><Input defaultValue="sarah@email.com" /></div>
        <div className="space-y-1.5"><Label>Phone</Label><Input defaultValue="(512) 555-0234" /></div>
        <div className="space-y-1.5"><Label>Location</Label><Input defaultValue="Austin, TX" /></div>
      </div>
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
        <div className="space-y-1.5"><Label>Current Password</Label><Input type="password" /></div>
        <div className="space-y-1.5"><Label>New Password</Label><Input type="password" /></div>
      </div>
    </div>

    <div className="flex justify-end">
      <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Save Changes</Button>
    </div>
  </div>
);

export default UserProfile;
