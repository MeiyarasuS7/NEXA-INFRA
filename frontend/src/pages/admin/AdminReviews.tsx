import { useEffect, useState } from "react";
import { PageHeader } from "@/pages/admin";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// based on the admin user you can put the mail id in the email


interface AdminReview {
  _id: string;
  rating: number;
  comment: string;
  reviewType: "user_to_contractor" | "contractor_to_user";
  createdAt: string;
  userId?: {
    name?: string;
  };
  contractorId?: {
    company?: string;
    userId?: {
      name?: string;
    };
  };
  projectId?: {
    title?: string;
  };
}

const AdminReviews = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<{ reviews: AdminReview[] }>("/admin/reviews");
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (requestError) {
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, []);

  const handleDelete = async (reviewId: string) => {
    try {
      setDeletingId(reviewId);
      await apiClient.delete(`/reviews/${reviewId}`);
      setReviews((current) => current.filter((review) => review._id !== reviewId));
      toast({
        title: "Review deleted",
        description: "The review has been removed from the platform.",
      });
    } catch (requestError) {
      toast({
        title: "Unable to delete review",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Moderation"
        description="Monitor live contractor reviews and remove content when needed"
      />

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
          No reviews available.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="rounded-lg border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-foreground">{review.userId?.name || "Unknown reviewer"}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((index) => (
                        <Star key={index} className={`h-3.5 w-3.5 ${index <= review.rating ? "fill-warning text-warning" : "text-muted"}`} />
                      ))}
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                      {review.reviewType.replaceAll("_", " ")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  {review.projectId?.title && (
                    <p className="mt-1 text-xs text-muted-foreground">Project: {review.projectId.title}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Contractor: {review.contractorId?.company || review.contractorId?.userId?.name || "Unassigned"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 text-destructive"
                  disabled={deletingId === review._id}
                  onClick={() => void handleDelete(review._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
