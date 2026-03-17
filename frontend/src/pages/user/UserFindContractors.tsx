import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, MapPin, Briefcase, CheckCircle } from "lucide-react";
import { MOCK_CONTRACTORS } from "@/data/mock";

const UserFindContractors = () => {
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const approved = MOCK_CONTRACTORS.filter(c => c.status === 'APPROVED');
  const allSpecialties = Array.from(new Set(approved.flatMap(c => c.specialties))).sort();

  const filtered = approved.filter(c => {
    const matchSearch = !search || 
      c.businessName.toLowerCase().includes(search.toLowerCase()) || 
      c.location.toLowerCase().includes(search.toLowerCase());
    const matchSpec = !selectedSpecialty || c.specialties.includes(selectedSpecialty);
    return matchSearch && matchSpec;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Find Contractors</h1>
        <p className="text-muted-foreground">Browse verified professionals for your projects</p>
      </div>

      {/* Search and filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by name or location..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-10 h-11"
          />
        </div>

        {/* Specialty filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSpecialty(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${!selectedSpecialty ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            All Specialties
          </button>
          {allSpecialties.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(selectedSpecialty === s ? null : s)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedSpecialty === s ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Contractors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(c => (
          <div key={c.id} className="rounded-lg border border-border bg-card p-6 shadow-card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-semibold text-foreground truncate">{c.businessName}</h3>
                  {c.verified && <CheckCircle className="h-4 w-4 shrink-0 text-success" />}
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {c.location}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                {c.businessName.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{c.bio}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(c.rating) ? 'fill-warning text-warning' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{c.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({c.reviewCount})</span>
            </div>

            {/* Specialties */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {c.specialties.slice(0, 3).map((s, idx) => (
                  <span key={idx} className="rounded-md bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">
                    {s}
                  </span>
                ))}
                {c.specialties.length > 3 && (
                  <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    +{c.specialties.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4 pt-4 border-t border-border/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="text-sm font-semibold text-foreground">{c.yearsExperience}y</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Projects</p>
                <p className="text-sm font-semibold text-foreground">{c.completedProjects}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Avg Rating</p>
                <p className="text-sm font-semibold text-foreground">{c.rating.toFixed(1)}</p>
              </div>
            </div>

            {/* Hourly Rate & CTA */}
            <div className="space-y-3">
              {c.hourlyRate && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Hourly Rate</p>
                  <p className="text-lg font-bold text-foreground">${c.hourlyRate}/hr</p>
                </div>
              )}

              <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Briefcase className="mr-2 h-4 w-4" />
                Request Project
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No contractors found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or specialty filters</p>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {filtered.length} of {approved.length} verified contractors
      </div>
    </div>
  );
};

export default UserFindContractors;
