import { MOCK_REVIEWS } from "@/data/mock";
import { Star } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";

const ContractorReviews = () => {
  const myReviews = MOCK_REVIEWS.filter(r => r.contractorId === "1");
  const avgRating = myReviews.length > 0 ? (myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Reviews</h1>
        <p className="text-sm text-muted-foreground">See what clients say about your work</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard title="Average Rating" value={avgRating} icon={Star} />
        <MetricCard title="Total Reviews" value={myReviews.length} icon={Star} />
        <MetricCard title="5-Star Reviews" value={myReviews.filter(r => r.rating === 5).length} icon={Star} />
      </div>

      <div className="space-y-4">
        {myReviews.map(r => (
          <div key={r.id} className="rounded-lg border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{r.userName}</p>
                {r.projectTitle && <p className="text-xs text-muted-foreground">Project: {r.projectTitle}</p>}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`h-4 w-4 ${i <= r.rating ? 'fill-warning text-warning' : 'text-muted'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractorReviews;
