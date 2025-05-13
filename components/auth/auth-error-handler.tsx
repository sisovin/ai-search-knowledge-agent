"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthErrorHandlerProps {
  children: React.ReactNode;
}

export default function AuthErrorHandler({ children }: AuthErrorHandlerProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Capture NextAuth client fetch errors
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || event.error?.toString();

      // Check if it's a NextAuth error
      if (
        errorMessage?.includes("next-auth") ||
        errorMessage?.includes("CLIENT_FETCH_ERROR") ||
        errorMessage?.includes("not valid JSON")
      ) {
        console.error("Caught auth error:", errorMessage);
        event.preventDefault();
        setError(
          "Authentication service error. This might be due to missing environment variables or server configuration."
        );
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", (event) => {
      handleError(new ErrorEvent("error", { error: event.reason }));
    });

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError as any);
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button onClick={() => setError(null)}>Dismiss</Button>
          <Button
            variant="outline"
            onClick={() => {
              setError(null);
              router.refresh();
            }}
          >
            Retry
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              router.push("/");
            }}
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
