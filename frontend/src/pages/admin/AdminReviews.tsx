import { MOCK_REVIEWS } from "@/data/mock";
import { PageHeader } from "@/pages/admin";
import { Star, Flag, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminReviews = () => (
  <div className="space-y-6">
    <PageHeader
      title="Review Moderation"
      description="Monitor and moderate platform reviews"
    />

    <div className="space-y-4">
      {MOCK_REVIEWS.map(r => (
        <div key={r.id} className="rounded-lg border border-border bg-card p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="font-medium text-foreground">{r.userName}</p>
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? 'fill-warning text-warning' : 'text-muted'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              {r.projectTitle && <p className="mt-0.5 text-xs text-muted-foreground">Project: {r.projectTitle}</p>}
              <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="ghost" className="text-success"><CheckCircle className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" className="text-warning"><Flag className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminReviews;
