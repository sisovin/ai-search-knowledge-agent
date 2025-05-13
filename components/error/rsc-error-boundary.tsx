// This is a custom error handler for React Server Components and connection issues
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// Error types we want to handle specifically
const RSC_ERROR_PATTERNS = [
  "Connection closed",
  "React Server Components",
  "WebSocket connection failed",
  "Server Components",
  "Error: Connection closed",
  "EAI_AGAIN",
  "ECONNRESET",
];

export default function RSCErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Capture unhandled errors that might be related to RSC connection issues
    const handleError = (event: ErrorEvent) => {
      const error = event.error || event.message;
      const errorString = error?.toString() || "";

      // Check if this is a React Server Component connection issue
      const isRSCError = RSC_ERROR_PATTERNS.some((pattern) =>
        errorString.includes(pattern)
      );

      if (isRSCError) {
        console.log(
          "[RSCErrorBoundary] Detected React Server Component connection issue"
        );

        // Prevent the default error handling
        event.preventDefault();

        // Attempt recovery - refresh the router
        setTimeout(() => {
          console.log("[RSCErrorBoundary] Attempting recovery");
          router.refresh();
        }, 500);
      }
    };

    // Listen for errors
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleError as any);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError as any);
    };
  }, [router, pathname]);

  return <>{children}</>;
}
