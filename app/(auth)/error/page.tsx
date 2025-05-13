"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    default: "An error occurred during authentication.",
    Signin: "Try signing in with a different account.",
    OAuthSignin: "Error during OAuth sign in. Please try again.",
    OAuthCallback: "Error during OAuth callback. Please try again.",
    OAuthCreateAccount: "Could not create account using OAuth provider.",
    EmailCreateAccount:
      "Could not create account with email. Email may already be in use.",
    Callback: "Error during authentication callback.",
    OAuthAccountNotLinked: "This email is already linked to another account.",
    EmailSignin: "Check your email address.",
    CredentialsSignin:
      "Sign in failed. Check the details you provided are correct.",
    SessionRequired: "You must be logged in to access this page.",
  };

  const errorMessage =
    error && errorMessages[error]
      ? errorMessages[error]
      : errorMessages.default;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container flex flex-col items-center justify-center flex-1 px-4 py-16">
        <div className="w-full max-w-md p-8 bg-card border rounded-xl shadow-sm space-y-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-destructive/20">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Authentication Error</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
          </div>

          <div className="flex flex-col space-y-3">
            <Button asChild>
              <Link href="/auth/login">Try Again</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link
                href="/"
                className="inline-flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
