import { OJS_BASE_URL } from "@/config/ojs";

export interface OJSArticle {
  id: number;
  title: string;
  abstract?: string;
  authors?: Array<{
    fullName: string;
    orcid?: string;
  }>;
  datePublished?: string;
  doi?: string;
  pages?: string;
  urlPath?: string;
  galleys?: Array<{
    file: {
      url: string;
    };
    label: string;
  }>;
}

export interface OJSIssue {
  id: number;
  title?: string;
  volume?: number;
  number?: string;
  year?: number;
  datePublished?: string;
  description?: string;
  coverImageUrl?: string;
}

export interface OJSAnnouncement {
  id: number;
  title: string;
  description: string;
  datePosted: string;
}

/**
 * Fetch current issue from OJS REST API
 */
export const fetchCurrentIssue = async (): Promise<{ issue: OJSIssue; articles: OJSArticle[] } | null> => {
  try {
    const response = await fetch(`${OJS_BASE_URL}/api/v1/issues/current`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch current issue');
    }
    
    const issue = await response.json();
    
    // Fetch articles for the current issue
    const articlesResponse = await fetch(`${OJS_BASE_URL}/api/v1/submissions?issueIds=${issue.id}&status=3`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const articlesData = await articlesResponse.json();
    const articles = articlesData.items || articlesData.itemsMax ? articlesData.items : [];
    
    return { issue, articles };
  } catch (error) {
    console.error('Error fetching current issue:', error);
    return null;
  }
};

/**
 * Fetch announcements from OJS (fallback to RSS if API not available)
 */
export const fetchAnnouncements = async (): Promise<OJSAnnouncement[]> => {
  try {
    // Try API first
    const response = await fetch(`${OJS_BASE_URL}/api/v1/announcements`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.items || [];
    }
    
    // Fallback to parsing RSS feed
    return [];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

/**
 * Get article URL for canonical linking
 */
export const getArticleUrl = (article: OJSArticle): string => {
  if (article.urlPath) {
    return `${OJS_BASE_URL}/index.php/ajvs/article/view/${article.urlPath}`;
  }
  return `${OJS_BASE_URL}/index.php/ajvs/article/view/${article.id}`;
};

/**
 * Get PDF URL for article
 */
export const getArticlePdfUrl = (article: OJSArticle): string | null => {
  const pdfGalley = article.galleys?.find(g => g.label?.toLowerCase().includes('pdf'));
  return pdfGalley?.file?.url || null;
};
