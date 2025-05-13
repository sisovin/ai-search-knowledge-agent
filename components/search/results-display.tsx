"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, ExternalLink, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SearchResult {
  id: string;
  url: string;
  title: string;
  content: string;
  score: number;
  published_date?: string;
  author?: string;
}

interface ResultsDisplayProps {
  results: SearchResult[];
  query: string;
  className?: string;
  isLoading?: boolean;
}

export function ResultsDisplay({
  results,
  query,
  className,
  isLoading = false,
}: ResultsDisplayProps) {
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});

  // Handle expanding/collapsing a specific result
  const toggleExpand = (id: string) => {
    setExpandedResults((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (isLoading) {
    return (
      <div className={cn("rounded-md border p-6 text-center", className)}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Searching for information...</p>
        </div>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className={cn("rounded-md border p-6", className)}>
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-center font-medium">No results found</p>
          <p className="text-sm text-muted-foreground text-center">
            Try adjusting your search query or explore related topics.
          </p>
        </div>
      </div>
    );
  }

  // Function to generate citations from the content
  const getCitations = (content: string, url: string) => {
    const cleanContent = content.replace(/\[\d+\]/g, ""); // Remove citation markers
    return (
      <div>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className="prose prose-sm dark:prose-invert max-w-none"
        >
          {cleanContent}
        </ReactMarkdown>
        <div className="mt-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Original Source
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {results.map((result) => (
        <div
          key={result.id}
          className="rounded-md border bg-card shadow-sm transition-all overflow-hidden"
        >
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-lg">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline flex items-center"
                >
                  {result.title}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </h3>
              <div className="text-xs text-muted-foreground flex items-center">
                {result.published_date && (
                  <span className="mr-2">
                    {new Date(result.published_date).toLocaleDateString()}
                  </span>
                )}
                {result.author && <span>by {result.author}</span>}
              </div>
            </div>
            
            <div className="mt-2 text-sm">
              {expandedResults[result.id] ? (
                getCitations(result.content, result.url)
              ) : (
                <p className="line-clamp-3">
                  {result.content.replace(/\[\d+\]/g, "").substring(0, 200)}...
                </p>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs flex items-center"
                onClick={() => toggleExpand(result.id)}
              >
                {expandedResults[result.id] ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show more
                  </>
                )}
              </Button>
              <div className="flex items-center text-xs text-muted-foreground">
                <LinkIcon className="h-3 w-3 mr-1" />
                <span className="truncate max-w-[20ch]">
                  {result.url.replace(/^https?:\/\//, "").split("/")[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
