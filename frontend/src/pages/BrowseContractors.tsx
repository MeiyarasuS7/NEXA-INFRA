import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContractorCard } from "@/components/ContractorCard";
import { MOCK_CONTRACTORS } from "@/data/mock";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";

const BrowseContractors = () => {
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const allSpecialties = Array.from(new Set(MOCK_CONTRACTORS.flatMap(c => c.specialties)));
  const approved = MOCK_CONTRACTORS.filter(c => c.status === 'APPROVED');

  const filtered = approved.filter(c => {
    const matchSearch = !search || c.businessName.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase());
    const matchSpec = !selectedSpecialty || c.specialties.includes(selectedSpecialty);
    return matchSearch && matchSpec;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 lg:py-12">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Find Contractors</h1>
            <p className="mt-1 text-muted-foreground">Browse verified professionals in your area</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or location..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        {/* Specialty filters */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSpecialty(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!selectedSpecialty ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            All
          </button>
          {allSpecialties.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(selectedSpecialty === s ? null : s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedSpecialty === s ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => <ContractorCard key={c.id} contractor={c} />)}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 text-center text-muted-foreground">
            <SlidersHorizontal className="mx-auto h-10 w-10 text-muted" />
            <p className="mt-3">No contractors match your search.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BrowseContractors;
