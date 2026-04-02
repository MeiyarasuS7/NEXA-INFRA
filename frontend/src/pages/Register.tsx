import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HardHat, User, Mail, Lock, AlertCircle } from "lucide-react";
import type { UserRole } from "@/types";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const parsedSpecialties = specialties
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const success = await register(name, email, password, role, parsedSpecialties);
    if (!success) return;
    
    navigate(role === "contractor" ? "/contractor/dashboard" : "/user/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <HardHat className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Join NEXA INFRA today</p>
          </div>

          {/* Role selector */}
          <div className="mb-6 flex overflow-hidden rounded-lg border border-border">
            {(["user", "contractor"] as const).map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${role === r ? "bg-secondary text-secondary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}>
                {r === "user" ? "Homeowner" : "Contractor"}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">{role === "contractor" ? "Business Name" : "Full Name"}</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" placeholder={role === "contractor" ? "Your Construction Co." : "John Doe"} value={name} onChange={e => setName(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>
            {role === "contractor" && (
              <div>
                <Label htmlFor="specialties">Specialties</Label>
                <Textarea
                  id="specialties"
                  className="mt-1.5"
                  placeholder="Masonry, Plumbing, Electrical"
                  value={specialties}
                  onChange={e => setSpecialties(e.target.value)}
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Add at least one specialty, separated by commas.
                </p>
              </div>
            )}
            <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-secondary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
