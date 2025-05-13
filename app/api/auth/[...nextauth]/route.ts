import NextAuth from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { Adapter } from "next-auth/adapters";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";
import Redis from "ioredis";
import * as argon2 from "argon2";

// Initialize Redis client for caching - with fallback and error handling
let redis;
try {
  redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : null;
} catch (error) {
  console.warn("Redis connection failed, continuing without Redis:", error);
  redis = null;
}

// Create JWT handler for refresh tokens
const refreshTokenHandler = async (token: any) => {
  // Check if token is about to expire
  if (
    token.refreshToken &&
    token.expiresAt &&
    token.expiresAt * 1000 < Date.now() + 5 * 60 * 1000
  ) {
    try {
      // Try to refresh the token using Supabase
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: token.refreshToken,
      });

      if (error) throw error;

      // Return the refreshed token
      return {
        ...token,
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
        expiresAt: data.session?.expires_at,
      };
    } catch (error) {
      console.error("Error refreshing token:", error);
      return { ...token, error: "RefreshAccessTokenError" };
    }
  }
  return token;
};

// Configure NextAuth
const handler = NextAuth({
  // Configure adapter for Supabase
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }) as Adapter,

  // Configure providers
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Get user from Supabase database
          const { data, error } = await supabase
            .from("users")
            .select("id, email, password, name")
            .eq("email", credentials.email)
            .single();

          if (error || !data) {
            return null;
          }

          // Verify password using Argon2
          const isValidPassword = await argon2.verify(
            data.password,
            credentials.password
          );

          if (!isValidPassword) {
            return null;
          }

          // Return user without password
          return {
            id: data.id,
            email: data.email,
            name: data.name,
          };
        } catch (error) {
          console.error("Error during login:", error);
          return null;
        }
      },
    }),
  ],

  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT configuration
  jwt: {
    maxAge: 60 * 60, // 1 hour
  },

  // Callbacks
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // Cache the token in Redis
        await redis.set(
          `auth:${user.id}`,
          JSON.stringify({
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
          }),
          "EX",
          60 * 60 // 1 hour
        );

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          userId: user.id,
        };
      }

      // Return refreshed token
      return refreshTokenHandler(token);
    },

    async session({ session, token }) {
      // Add custom user data to the session
      session.user.id = token.userId as string;
      session.user.accessToken = token.accessToken as string;
      session.error = token.error as string;

      // Try to get session data from Redis cache first
      const cachedData = await redis.get(`auth:${token.userId}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        session.user.accessToken = parsedData.accessToken;
      }

      return session;
    },
  },

  // Custom pages
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
});

export { handler as GET, handler as POST };
