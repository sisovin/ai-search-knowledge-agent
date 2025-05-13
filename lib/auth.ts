import { hash, verify } from "argon2";
import { SignInOptions, SignUpOptions } from "@supabase/supabase-js";
import { auth } from "./supabase";
import { signIn, signOut } from "next-auth/react";

export const authUtils = {
  /**
   * Hash a password using Argon2
   */
  async hashPassword(password: string): Promise<string> {
    return await hash(password);
  },

  /**
   * Verify a password using Argon2
   */
  async verifyPassword(
    hashedPassword: string,
    password: string
  ): Promise<boolean> {
    return await verify(hashedPassword, password);
  },

  /**
   * Login with credentials (email/password)
   */
  async loginWithCredentials(email: string, password: string) {
    return await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  },

  /**
   * Login with OAuth provider (Google or GitHub)
   */
  async loginWithProvider(provider: "google" | "github") {
    return await signIn(provider, { callbackUrl: window.location.origin });
  },

  /**
   * Sign up with email and password
   * Uses Supabase auth and Argon2 for password hashing
   */
  async signUp(email: string, password: string, name: string) {
    // Hash password with Argon2
    const hashedPassword = await this.hashPassword(password);

    // Create user in Supabase
    const { data, error } = await auth.signUp(email, password);

    if (error) {
      throw error;
    }

    // Return the user data
    return data;
  },

  /**
   * Sign out and clear session from both NextAuth and Supabase
   */
  async logout() {
    // Sign out from NextAuth
    await signOut({ redirect: false });

    // Sign out from Supabase
    await auth.signOut();

    // Redirect to home page
    window.location.href = "/";
  },
};
