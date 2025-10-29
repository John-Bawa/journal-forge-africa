import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FileText, Calendar, AlertCircle } from "lucide-react";

export default function ReviewerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    await fetchReviews(session.user.id);
  };

  const fetchReviews = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          manuscripts (
            title,
            abstract,
            manuscript_type
          )
        `)
        .eq("reviewer_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      in_progress: "default",
      completed: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-serif font-bold mb-8">Reviewer Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                  <p className="text-3xl font-bold">{reviews.filter(r => r.status === "pending").length}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
            </Card>
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold">{reviews.filter(r => r.status === "in_progress").length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold">{reviews.filter(r => r.status === "completed").length}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Assigned Manuscripts */}
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-serif font-bold mb-6">Assigned Manuscripts</h2>
            {loading ? (
              <p>Loading...</p>
            ) : reviews.length === 0 ? (
              <p className="text-muted-foreground">No manuscripts assigned yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{review.manuscripts?.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Type: {review.manuscripts?.manuscript_type}
                        </p>
                        <p className="text-sm line-clamp-2">{review.manuscripts?.abstract}</p>
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(review.status)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        Assigned: {new Date(review.created_at).toLocaleDateString()}
                      </p>
                      <Button size="sm">View & Review</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
