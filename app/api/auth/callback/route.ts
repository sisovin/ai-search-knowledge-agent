import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import Redis from "ioredis";

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return Response.redirect(
        `${requestUrl.origin}/auth/error?error=${error.message}`
      );
    }

    // Store session in Redis
    if (data.user) {
      await redis.set(
        `auth:${data.user.id}`,
        JSON.stringify({
          accessToken: data.session?.access_token,
          refreshToken: data.session?.refresh_token,
        }),
        "EX",
        60 * 60 // 1 hour
      );
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
  }

  // Redirect to main page
  return Response.redirect(requestUrl.origin);
}
