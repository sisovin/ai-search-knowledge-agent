"use client";

import { SessionProvider, useSession } from "next-auth/react";
import React, { createContext, useContext, useEffect, useState } from "react";

// Define the Auth Context
type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth Context Provider
function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const isLoading = status === "loading";
  const isAuthenticated = !!session;

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }
  }, [session]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user }}>
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
