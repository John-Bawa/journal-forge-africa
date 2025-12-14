import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";
import { OJSArticle, getArticleUrl, getArticlePdfUrl } from "@/services/ojsApi";
import { motion } from "framer-motion";

interface OJSArticleCardProps {
  article: OJSArticle;
  index?: number;
}

export const OJSArticleCard = ({ article, index = 0 }: OJSArticleCardProps) => {
  const articleUrl = getArticleUrl(article);
  const pdfUrl = getArticlePdfUrl(article);
  
  // Strip HTML tags from abstract
  const cleanAbstract = article.abstract?.replace(/<[^>]*>/g, '') || '';
  const truncatedAbstract = cleanAbstract.length > 300 
    ? cleanAbstract.substring(0, 300) + '...' 
    : cleanAbstract;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="shadow-card hover:shadow-elegant transition-smooth border-border/50 h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl leading-tight">
            <a 
              href={articleUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-smooth"
            >
              {article.title}
            </a>
          </CardTitle>
          
          {article.authors && article.authors.length > 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              {article.authors.map(author => author.fullName).join(', ')}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-3">
            {article.datePublished && (
              <Badge variant="secondary" className="text-xs">
                {new Date(article.datePublished).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </Badge>
            )}
            {article.pages && (
              <Badge variant="outline" className="text-xs">
                Pages: {article.pages}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          {truncatedAbstract && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed drop-cap">
              {truncatedAbstract}
            </p>
          )}
          
          {article.doi && (
            <p className="text-xs text-muted-foreground mb-4 font-mono">
              DOI: {article.doi}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-auto">
            <Button 
              asChild
              variant="default" 
              size="sm"
              className="flex-1 min-w-[120px]"
            >
              <a href={articleUrl} target="_blank" rel="noopener noreferrer">
                View Article
                <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </Button>
            
            {pdfUrl && (
              <Button 
                asChild
                variant="outline" 
                size="sm"
                className="flex-1 min-w-[120px]"
              >
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-2 w-4 h-4" />
                  PDF
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
