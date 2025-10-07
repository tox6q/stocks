"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Newspaper, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface NewsArticle {
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: string;
}

interface NewsFeedProps {
  ticker: string;
}

export default function NewsFeed({ ticker }: NewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showAll, setShowAll] = useState(false);
  const INITIAL_DISPLAY_COUNT = 3;

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/news/${ticker}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch news`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setArticles(data.articles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load news");
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchNews();
    }
  }, [ticker]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const displayedArticles = showAll
    ? articles
    : articles.slice(0, INITIAL_DISPLAY_COUNT);

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Latest News
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Latest News
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Latest News
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No recent news found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Latest News
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Recent articles about {ticker}
        </p>
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-4">
          {displayedArticles.map((article, index) => (
            <a
              key={index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="flex gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.headline}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs line-clamp-2 group-hover:text-primary transition-colors">
                    {article.headline}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                    <span className="truncate">{article.source}</span>
                    <span>•</span>
                    <span>{formatDate(article.datetime)}</span>
                    <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </ScrollArea>

      {articles.length > INITIAL_DISPLAY_COUNT && (
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show More ({articles.length - INITIAL_DISPLAY_COUNT} more)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
