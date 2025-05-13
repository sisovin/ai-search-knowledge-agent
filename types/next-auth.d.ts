import "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      accessToken: string;
      error?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    name?: string;
    email: string;
  }
}

// Extend the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt?: number;
    error?: string;
  }
}
