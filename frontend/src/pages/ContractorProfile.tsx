import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MOCK_CONTRACTORS, MOCK_REVIEWS } from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, CheckCircle, ArrowLeft, Award } from "lucide-react";

const ContractorProfile = () => {
  const { id } = useParams();
  const contractor = MOCK_CONTRACTORS.find(c => c.id === id);
  const reviews = MOCK_REVIEWS.filter(r => r.contractorId === id);

  if (!contractor) {
    return <div className="min-h-screen bg-background"><Navbar /><div className="container py-16 text-center text-muted-foreground">Contractor not found.</div></div>;
  }

  const initials = contractor.businessName.split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 lg:py-12">
        <Link to="/browse-contractors" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to contractors
        </Link>

        {/* Profile header */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-2xl font-bold text-foreground">{contractor.businessName}</h1>
                {contractor.verified && <CheckCircle className="h-5 w-5 text-success" />}
                <StatusBadge status={contractor.status} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {contractor.location}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {contractor.yearsExperience} years experience</span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" /> {contractor.rating} ({contractor.reviewCount} reviews)
                </span>
              </div>
              <p className="mt-4 text-muted-foreground">{contractor.bio}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {contractor.specialties.map(s => (
                  <span key={s} className="rounded-lg bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">{s}</span>
                ))}
              </div>

              {contractor.certifications && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {contractor.certifications.map(c => (
                    <span key={c} className="flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1 text-sm font-medium text-success">
                      <Award className="h-3.5 w-3.5" /> {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-center lg:text-right">
              {contractor.hourlyRate && (
                <p className="font-heading text-2xl font-bold text-foreground">${contractor.hourlyRate}<span className="text-sm font-normal text-muted-foreground">/hr</span></p>
              )}
              <p className="text-sm text-muted-foreground">{contractor.completedProjects} projects completed</p>
              <Button className="mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Request Quote
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-8">
          <h2 className="font-heading text-xl font-bold text-foreground">Reviews</h2>
          <div className="mt-4 space-y-4">
            {reviews.length > 0 ? reviews.map(r => (
              <div key={r.id} className="rounded-lg border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{r.userName}</p>
                    {r.projectTitle && <p className="text-xs text-muted-foreground">{r.projectTitle}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? 'fill-warning text-warning' : 'text-muted'}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                <p className="mt-2 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            )) : (
              <p className="text-muted-foreground">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContractorProfile;
