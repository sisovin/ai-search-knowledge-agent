"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, Search as SearchIcon, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface SearchInputProps {
  onSearch: (query: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  initialValue?: string;
}

export function SearchInput({
  onSearch,
  placeholder = "What would you like to know?",
  className,
  autoFocus = false,
  disabled = false,
  initialValue = "",
}: SearchInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Debounce the query typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() || isLoading) return;
    
    try {
      setIsLoading(true);
      await onSearch(query);
    } finally {
      setIsLoading(false);
    }
  };

  const clearInput = () => {
    setQuery("");
    setDebouncedQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Auto-suggest feature can be implemented here 
  // using the debouncedQuery state

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-3 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          autoFocus={autoFocus}
          disabled={disabled || isLoading}
          autoComplete="off"
          aria-label="Search query"
        />
        {query.length > 0 && !isLoading && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-10 h-6 w-6 rounded-full"
            onClick={clearInput}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search input</span>
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
          disabled={!query.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </div>
    </form>
  );
}
