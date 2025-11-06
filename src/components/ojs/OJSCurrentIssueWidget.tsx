import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ExternalLink } from "lucide-react";
import { getOJSLink } from "@/config/ojs";
import { useEffect, useState } from "react";
import { fetchCurrentIssue, OJSArticle, OJSIssue } from "@/services/ojsApi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { OJSArticleCard } from "./OJSArticleCard";

export const OJSCurrentIssueWidget = () => {
  const [issue, setIssue] = useState<OJSIssue | null>(null);
  const [articles, setArticles] = useState<OJSArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentIssue = async () => {
      const data = await fetchCurrentIssue();
      if (data) {
        setIssue(data.issue);
        setArticles(data.articles.slice(0, 2)); // Show only 2 articles in widget
      }
      setLoading(false);
    };
    loadCurrentIssue();
  }, []);

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="w-5 h-5 text-primary" />
          Current Issue Articles
        </CardTitle>
        <a 
          href={getOJSLink('CURRENT_ISSUE')} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-smooth"
        >
          View Full Issue <ExternalLink className="w-3 h-3" />
        </a>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSpinner />
        ) : articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article, index) => (
              <OJSArticleCard key={article.id} article={article} index={index} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No articles available in the current issue.</p>
        )}
      </CardContent>
    </Card>
  );
};
