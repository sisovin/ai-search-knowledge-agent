"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
    Check,
    Copy,
    Download,
    ExternalLink,
    FileText,
    Info
} from "lucide-react";
import { useState } from "react";

interface ScrapedContent {
  title: string;
  content: string;
  url: string;
  metadata?: {
    author?: string;
    publishedDate?: string;
    siteName?: string;
    description?: string;
    wordCount?: number;
  };
}

interface ContentViewerProps {
  content: ScrapedContent;
  className?: string;
}

export function ContentViewer({ content, className }: ContentViewerProps) {
  const [activeTab, setActiveTab] = useState<"text" | "metadata">("text");
  const [isCopied, setIsCopied] = useState(false);

  const { title, url, metadata } = content;
  // Sanitize content
  const sanitizedContent = content.content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframes
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ""); // Remove styles

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sanitizedContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadContent = () => {
    const element = document.createElement("a");
    const file = new Blob([sanitizedContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={cn("rounded-md border shadow-sm", className)}>
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-medium text-lg truncate">{title}</h3>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center mt-1"
        >
          {url}
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "text" | "metadata")}
        className="p-4"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="text">
              <FileText className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="metadata">
              <Info className="h-4 w-4 mr-2" />
              Metadata
            </TabsTrigger>
          </TabsList>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={copyToClipboard}
            >
              {isCopied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={downloadContent}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        </div>

        <TabsContent value="text" className="space-y-2">
          <div className="relative">
            <pre className="border rounded-md p-4 bg-muted/30 overflow-auto max-h-[500px] text-sm whitespace-pre-wrap">
              {sanitizedContent}
            </pre>
            
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>Word count: {metadata?.wordCount || sanitizedContent.split(/\s+/).length}</span>
              {metadata?.author && (
                <span>Author: {metadata.author}</span>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metadata">
          <div className="border rounded-md p-4 bg-muted/30 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metadata?.author && (
                <div>
                  <h4 className="text-sm font-medium">Author</h4>
                  <p className="text-sm text-muted-foreground">{metadata.author}</p>
                </div>
              )}
              
              {metadata?.publishedDate && (
                <div>
                  <h4 className="text-sm font-medium">Published Date</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(metadata.publishedDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {metadata?.siteName && (
                <div>
                  <h4 className="text-sm font-medium">Site Name</h4>
                  <p className="text-sm text-muted-foreground">{metadata.siteName}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium">Word Count</h4>
                <p className="text-sm text-muted-foreground">
                  {metadata?.wordCount || sanitizedContent.split(/\s+/).length}
                </p>
              </div>
            </div>
            
            {metadata?.description && (
              <div className="mt-4">
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground mt-1">{metadata.description}</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
