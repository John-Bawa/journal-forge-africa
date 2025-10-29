import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ReviewerReminders() {
  const [overdueReviews, setOverdueReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverdueReviews();
  }, []);

  const fetchOverdueReviews = async () => {
    try {
      // Get reviews pending for more than 14 days
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          manuscripts (title),
          profiles!reviewer_id (full_name, email)
        `)
        .eq("status", "pending")
        .lt("created_at", fourteenDaysAgo.toISOString());

      if (error) throw error;
      setOverdueReviews(data || []);
    } catch (error) {
      console.error("Error fetching overdue reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (reviewId: string, reviewerEmail: string, manuscriptTitle: string) => {
    try {
      const { error } = await supabase.functions.invoke("send-reviewer-reminder", {
        body: { 
          reviewId, 
          reviewerEmail, 
          manuscriptTitle 
        }
      });

      if (error) throw error;
      toast.success("Reminder sent successfully");
    } catch (error: any) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    }
  };

  const sendBulkReminders = async () => {
    try {
      const { error } = await supabase.functions.invoke("send-bulk-reminders", {
        body: { reviewIds: overdueReviews.map(r => r.id) }
      });

      if (error) throw error;
      toast.success(`Sent reminders to ${overdueReviews.length} reviewer(s)`);
    } catch (error: any) {
      console.error("Error sending bulk reminders:", error);
      toast.error("Failed to send reminders");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Overdue Reviews
          </CardTitle>
          {overdueReviews.length > 0 && (
            <Button size="sm" onClick={sendBulkReminders}>
              <Bell className="w-4 h-4 mr-2" />
              Send All Reminders
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {overdueReviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No overdue reviews
          </p>
        ) : (
          <div className="space-y-3">
            {overdueReviews.map((review) => {
              const daysOverdue = Math.floor(
                (new Date().getTime() - new Date(review.created_at).getTime()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{review.manuscripts?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Reviewer: {review.profiles?.full_name}
                    </p>
                    <Badge variant="destructive" className="mt-1">
                      {daysOverdue} days overdue
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendReminder(
                      review.id,
                      review.profiles?.email,
                      review.manuscripts?.title
                    )}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Send Reminder
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}