import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FileText, Users, DollarSign, BookOpen } from "lucide-react";

export default function EditorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalManuscripts: 0,
    pendingReview: 0,
    underReview: 0,
    accepted: 0,
    totalPayments: 0,
    pendingPayments: 0,
  });
  const [manuscripts, setManuscripts] = useState<any[]>([]);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    // Check if user has editor role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    const userRoles = roles?.map(r => r.role) || [];
    const isEditor = userRoles.some(r => ['super_admin', 'editor', 'secretary'].includes(r));
    
    if (!isEditor) {
      navigate("/dashboard");
      return;
    }

    await fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      const { data: manuscriptsData } = await supabase
        .from("manuscripts")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(10);

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("amount, status");

      setManuscripts(manuscriptsData || []);

      const totalPayments = paymentsData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const pendingPayments = paymentsData?.filter(p => p.status === "pending").length || 0;

      setStats({
        totalManuscripts: manuscriptsData?.length || 0,
        pendingReview: manuscriptsData?.filter(m => m.status === "submitted").length || 0,
        underReview: manuscriptsData?.filter(m => m.status === "under_review").length || 0,
        accepted: manuscriptsData?.filter(m => m.status === "accepted").length || 0,
        totalPayments,
        pendingPayments,
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      submitted: "default",
      under_review: "default",
      accepted: "outline",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-serif font-bold mb-8">Editorial Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-3xl font-bold">{stats.totalManuscripts}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </Card>
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold">{stats.pendingReview}</p>
                </div>
                <BookOpen className="w-8 h-8 text-amber-500" />
              </div>
            </Card>
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                  <p className="text-3xl font-bold">{stats.underReview}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                  <p className="text-3xl font-bold">{stats.accepted}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Recent Manuscripts */}
          <Card className="glass-card p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold">Recent Submissions</h2>
              <Button variant="outline">View All</Button>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : manuscripts.length === 0 ? (
              <p className="text-muted-foreground">No submissions yet.</p>
            ) : (
              <div className="space-y-4">
                {manuscripts.map((manuscript) => (
                  <Card key={manuscript.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{manuscript.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Author: {manuscript.profiles?.full_name} | Type: {manuscript.manuscript_type}
                        </p>
                        <p className="text-sm line-clamp-2">{manuscript.abstract}</p>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        {getStatusBadge(manuscript.status)}
                        <Button size="sm">Manage</Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(manuscript.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Assign Reviewer</Button>
                        <Button size="sm" variant="outline">Send Decision</Button>
                      </div>
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
