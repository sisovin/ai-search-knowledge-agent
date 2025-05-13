import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import Redis from "ioredis";

// Initialize Redis client with error handling
let redis;
try {
  redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : null;
} catch (error) {
  console.warn("Redis connection failed in callback, continuing without Redis:", error);
  redis = null;
}

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (!code) {
      return Response.json(
        { error: "Missing code parameter" },
        { status: 400 }
      );
    }

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth error:", error);
      return Response.redirect(
        `${requestUrl.origin}/auth/error?error=${encodeURIComponent(error.message)}`
      );
    }

    // Store session in Redis if available
    if (data.user && redis) {
      try {
        await redis.set(
          `auth:${data.user.id}`,
          JSON.stringify({
            accessToken: data.session?.access_token,
            refreshToken: data.session?.refresh_token,
          }),
          "EX",
          60 * 60 // 1 hour
        );
      } catch (redisError) {
        console.warn("Failed to store session in Redis:", redisError);
      }
    }

    // Set cookies
    const cookieStore = cookies();
    cookieStore.set("supabase-auth-token", data.session?.access_token || "", {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    console.error("Unexpected error in auth callback:", error);
    return Response.redirect(`${request.url.origin}/auth/error?error=Unexpected error`);
  }

  // Redirect to main page
  return Response.redirect(requestUrl.origin);
}
