"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AlertCircle, Clipboard, Globe, X } from "lucide-react";
import React, { useEffect, useState } from "react";

type ValidationState = "idle" | "valid" | "invalid";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
}

export function UrlInput({
  onSubmit,
  isLoading = false,
  className,
  placeholder = "https://example.com/article",
}: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [validationState, setValidationState] = useState<ValidationState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasPasteListener, setHasPasteListener] = useState(false);

  // URL validation function
  const validateUrl = (input: string): boolean => {
    try {
      // Basic URL validation
      const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
      if (!urlPattern.test(input)) {
        setErrorMessage("Please enter a valid URL");
        return false;
      }
      
      // Make sure URL has http or https prefix
      if (!input.startsWith("http://") && !input.startsWith("https://")) {
        // Auto-correct by adding https://
        setUrl(`https://${input}`);
      }
      
      setErrorMessage("");
      return true;
    } catch (error) {
      setErrorMessage("Invalid URL format");
      return false;
    }
  };

  // Handle URL changes
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    if (!newUrl) {
      setValidationState("idle");
      setErrorMessage("");
      return;
    }
    
    const isValid = validateUrl(newUrl);
    setValidationState(isValid ? "valid" : "invalid");
  };

  // Handle paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setUrl(clipboardText);
        const isValid = validateUrl(clipboardText);
        setValidationState(isValid ? "valid" : "invalid");
      }
    } catch (error) {
      console.error("Failed to read clipboard:", error);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || isLoading) return;
    
    const isValid = validateUrl(url);
    setValidationState(isValid ? "valid" : "invalid");
    
    if (isValid) {
      // Use the potentially auto-corrected URL (with https:// prefix)
      const submissionUrl = url.startsWith("http") ? url : `https://${url}`;
      onSubmit(submissionUrl);
    }
  };

  // Clear the input field
  const clearInput = () => {
    setUrl("");
    setValidationState("idle");
    setErrorMessage("");
  };

  // Listen for paste events globally
  useEffect(() => {
    if (!hasPasteListener) {
      const handleGlobalPaste = (e: ClipboardEvent) => {
        // Only autodetect if the user is not focused on any input
        const activeElement = document.activeElement;
        const isInputFocused = activeElement instanceof HTMLInputElement || 
                              activeElement instanceof HTMLTextAreaElement;
        
        if (!isInputFocused && e.clipboardData) {
          const pastedText = e.clipboardData.getData('text');
          if (pastedText && validateUrl(pastedText)) {
            setUrl(pastedText);
            setValidationState("valid");
          }
        }
      };
      
      window.addEventListener("paste", handleGlobalPaste);
      setHasPasteListener(true);
      
      return () => {
        window.removeEventListener("paste", handleGlobalPaste);
      };
    }
  }, [hasPasteListener]);

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative">
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-20",
            validationState === "valid" && "border-green-500",
            validationState === "invalid" && "border-red-500"
          )}
          disabled={isLoading}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
          {url && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={clearInput}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear URL</span>
            </Button>
          )}
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handlePasteFromClipboard}
            disabled={isLoading}
          >
            <Clipboard className="h-3 w-3 mr-1" />
            Paste
          </Button>
        </div>
      </div>
      
      {validationState === "invalid" && errorMessage && (
        <p className="text-xs text-red-500 mt-1 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {errorMessage}
        </p>
      )}
      
      <Button
        type="submit"
        className="w-full mt-2"
        disabled={validationState === "invalid" || !url || isLoading}
      >
        {isLoading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            Processing...
          </>
        ) : (
          <>
            Scrape Content
          </>
        )}
      </Button>
    </form>
  );
}
