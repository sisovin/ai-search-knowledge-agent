"use client";

import { SessionProvider, useSession } from "next-auth/react";
import React, { createContext, useContext, useEffect, useState } from "react";

// Define the Auth Context
type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth Context Provider
function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const isLoading = status === "loading";
  const isAuthenticated = !!session;

  useEffect(() => {
    // Reset error state when status changes
    if (status !== "loading") {
      setError(null);
    }

    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }

    // Handle potential error in session
    if (session?.error) {
      console.error("Session error:", session.error);
      setError("Authentication error. Please try again.");
    }
  }, [session, status]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, error }}>
      {children}
    </AuthContext.Provider>
  );
}

// Main Auth Provider that wraps the app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

// Component to protect routes that require authentication
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">Loading...</div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
      return null;
    }
    return null;
  }

  return <>{children}</>;
}
