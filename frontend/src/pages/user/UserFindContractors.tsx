import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, MapPin, Briefcase, CheckCircle } from "lucide-react";
import { apiClient } from "@/services/api";
import { formatInr } from "@/lib/currency";

interface ApiContractor {
  _id: string;
  company?: string;
  specialties?: string[];
  bio?: string;
  experience?: number;
  rating?: number;
  totalProjects?: number;
  hourlyRate?: number;
  isVerified?: boolean;
  userId?: {
    name?: string;
    location?: string;
  };
}

const UserFindContractors = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [contractors, setContractors] = useState<ApiContractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContractors = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get<{ contractors: ApiContractor[] }>("/contractors");
        setContractors(Array.isArray(data.contractors) ? data.contractors : []);
      } catch (requestError) {
        setError("Unable to load contractors right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadContractors();
  }, []);

  const allSpecialties = useMemo(
    () => Array.from(new Set(contractors.flatMap((contractor) => contractor.specialties || []))).sort(),
    [contractors]
  );

  const filtered = useMemo(
    () =>
      contractors.filter((contractor) => {
        const companyName = contractor.company || contractor.userId?.name || "";
        const location = contractor.userId?.location || "";
        const specialties = contractor.specialties || [];
        const normalizedSearch = search.toLowerCase();

        const matchSearch =
          !search ||
          companyName.toLowerCase().includes(normalizedSearch) ||
          location.toLowerCase().includes(normalizedSearch);
        const matchSpec = !selectedSpecialty || specialties.includes(selectedSpecialty);

        return matchSearch && matchSpec;
      }),
    [contractors, search, selectedSpecialty]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Find Contractors</h1>
        <p className="text-muted-foreground">Browse verified professionals for your projects</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or location..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSpecialty(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${!selectedSpecialty ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            All Specialties
          </button>
          {allSpecialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(selectedSpecialty === specialty ? null : specialty)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedSpecialty === specialty ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
          Loading contractors...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((contractor) => {
            const companyName = contractor.company || contractor.userId?.name || "Unnamed contractor";
            const specialties = contractor.specialties || [];
            const totalProjects = contractor.totalProjects || 0;

            return (
              <div key={contractor._id} className="rounded-lg border border-border bg-card p-6 shadow-card hover:shadow-lg transition-shadow">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-heading text-lg font-semibold text-foreground">{companyName}</h3>
                      {contractor.isVerified && <CheckCircle className="h-4 w-4 shrink-0 text-success" />}
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {contractor.userId?.location || "Location unavailable"}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                    {companyName.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                </div>

                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{contractor.bio || "No company bio available yet."}</p>

                <div className="mb-3 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${index < Math.floor(contractor.rating || 0) ? "fill-warning text-warning" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{(contractor.rating || 0).toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({totalProjects})</span>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {specialties.slice(0, 3).map((specialty) => (
                      <span key={specialty} className="rounded-md bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">
                        {specialty}
                      </span>
                    ))}
                    {specialties.length > 3 && (
                      <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        +{specialties.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-2 border-t border-border/50 pt-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="text-sm font-semibold text-foreground">{contractor.experience || 0}y</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Projects</p>
                    <p className="text-sm font-semibold text-foreground">{totalProjects}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                    <p className="text-sm font-semibold text-foreground">{(contractor.rating || 0).toFixed(1)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {typeof contractor.hourlyRate === "number" && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Hourly Rate</p>
                      <p className="text-lg font-bold text-foreground">{formatInr(contractor.hourlyRate)}/hr</p>
                    </div>
                  )}

                  <Button
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    onClick={() =>
                      navigate(
                        `/user/request-contractor?contractorId=${encodeURIComponent(contractor._id)}&contractorName=${encodeURIComponent(companyName)}`
                      )
                    }
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Request Project
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">No contractors found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or specialty filters</p>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        Showing {filtered.length} of {contractors.length} verified contractors
      </div>
    </div>
  );
};

export default UserFindContractors;
