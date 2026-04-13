import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, CheckCircle, ArrowLeft, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
  certifications?: Array<{
    name: string;
  }>;
}

interface ApiReview {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId?: {
    name?: string;
  };
  projectId?: {
    title?: string;
  };
}

const ContractorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [contractor, setContractor] = useState<ApiContractor | null>(null);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Contractor not found.");
      return;
    }

    const loadContractor = async () => {
      try {
        setLoading(true);
        setError(null);

        const [contractorResponse, reviewResponse] = await Promise.all([
          apiClient.get<{ contractor: ApiContractor }>(`/contractors/${id}`),
          apiClient.get<{ reviews: ApiReview[] }>(`/reviews/contractor/${id}`),
        ]);

        setContractor(contractorResponse.contractor || null);
        setReviews(Array.isArray(reviewResponse.reviews) ? reviewResponse.reviews : []);
      } catch (requestError) {
        setError("Contractor not found.");
      } finally {
        setLoading(false);
      }
    };

    void loadContractor();
  }, [id]);

  const canRequestContractor = !user || role === "user";

  const initials = useMemo(() => {
    const name = contractor?.company || contractor?.userId?.name || "CT";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [contractor]);

  const handleRequestContractor = () => {
    if (!contractor) {
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    if (role !== "user") {
      return;
    }

    const params = new URLSearchParams({
      contractorId: contractor._id,
      contractorName: contractor.company || contractor.userId?.name || "Contractor",
    });

    navigate(`/user/request-contractor?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center text-muted-foreground">Loading contractor profile...</div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center text-muted-foreground">{error || "Contractor not found."}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 lg:py-12">
        <Link to="/browse-contractors" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to contractors
        </Link>
        <div className="rounded-xl border border-border bg-card p-6 shadow-card lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  {contractor.company || contractor.userId?.name || "Unnamed contractor"}
                </h1>
                {contractor.isVerified && <CheckCircle className="h-5 w-5 text-success" />}
                <StatusBadge status={contractor.isVerified ? "APPROVED" : "PENDING"} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {contractor.userId?.location || "Location unavailable"}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {contractor.experience || 0} years experience</span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" /> {contractor.rating || 0} ({reviews.length} reviews)
                </span>
              </div>
              <p className="mt-4 text-muted-foreground">{contractor.bio || "No company bio available yet."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(contractor.specialties || []).map((specialty) => (
                  <span key={specialty} className="rounded-lg bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">{specialty}</span>
                ))}
              </div>
              {contractor.certifications && contractor.certifications.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {contractor.certifications.map((certification) => (
                    <span key={certification.name} className="flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1 text-sm font-medium text-success">
                      <Award className="h-3.5 w-3.5" /> {certification.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-center lg:text-right">
              {typeof contractor.hourlyRate === "number" && (
                <p className="font-heading text-2xl font-bold text-foreground">{formatInr(contractor.hourlyRate)}<span className="text-sm font-normal text-muted-foreground">/hr</span></p>
              )}
              <p className="text-sm text-muted-foreground">{contractor.totalProjects || 0} projects completed</p>
              <Button
                className="mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                onClick={handleRequestContractor}
                disabled={!canRequestContractor}
              >
                {user ? "Request Contractor" : "Sign In To Request"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-heading text-xl font-bold text-foreground">Reviews</h2>
          {error && <p className="mt-2 text-sm text-muted-foreground">{error}</p>}
          <div className="mt-4 space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="rounded-lg border border-border bg-card p-5 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{review.userId?.name || "Client"}</p>
                      {review.projectId?.title && <p className="text-xs text-muted-foreground">{review.projectId.title}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((index) => (
                        <Star key={index} className={`h-3.5 w-3.5 ${index <= review.rating ? "fill-warning text-warning" : "text-muted"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
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
