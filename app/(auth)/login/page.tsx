import LoginForm from "@/components/auth/login-form";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login | AI Search Knowledge Agent",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="container flex flex-col items-center justify-center flex-1 px-4 py-16">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>

        <LoginForm />
      </div>
    </div>
  );
}
