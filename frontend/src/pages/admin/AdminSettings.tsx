import { PageHeader } from "@/pages/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Shield, Bell, DollarSign } from "lucide-react";

const AdminSettings = () => (
  <div className="space-y-6 max-w-3xl">
    <PageHeader
      title="System Settings"
      description="Manage platform configuration"
    />

    {/* General */}
    <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-secondary" />
        <h2 className="font-heading text-lg font-semibold text-foreground">General</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Platform Name</Label>
          <Input defaultValue="NEXA INFRA" />
        </div>
        <div className="space-y-1.5">
          <Label>Support Email</Label>
          <Input defaultValue="support@nexa-infra.com" />
        </div>
      </div>
    </div>

    {/* Security */}
    <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-secondary" />
        <h2 className="font-heading text-lg font-semibold text-foreground">Security</h2>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground">Require 2FA for admin accounts</p>
          </div>
          <Switch defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Email Verification</p>
            <p className="text-xs text-muted-foreground">Require email verification on signup</p>
          </div>
          <Switch defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Auto-approve Contractors</p>
            <p className="text-xs text-muted-foreground">Skip manual approval for new contractors</p>
          </div>
          <Switch />
        </div>
      </div>
    </div>

    {/* Notifications */}
    <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-secondary" />
        <h2 className="font-heading text-lg font-semibold text-foreground">Notifications</h2>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">New Contractor Alerts</p>
            <p className="text-xs text-muted-foreground">Notify when new contractors register</p>
          </div>
          <Switch defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Dispute Alerts</p>
            <p className="text-xs text-muted-foreground">Immediate notification for new disputes</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>

    {/* Payment */}
    <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-secondary" />
        <h2 className="font-heading text-lg font-semibold text-foreground">Payment Settings</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Platform Fee (%)</Label>
          <Input type="number" defaultValue="5" />
        </div>
        <div className="space-y-1.5">
          <Label>Minimum Project Budget ($)</Label>
          <Input type="number" defaultValue="500" />
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Save Changes</Button>
    </div>
  </div>
);

export default AdminSettings;
