import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabaseClient";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.readonly",
          ].join(" "),
          prompt: "consent",
          access_type: "offline",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider !== "google") return true;

        const email = user?.email;
        const name = user?.name;

        if (!email) return true;

        const payload = { email, name: name ?? null };

        console.log("[auth] signIn callback (google):", { email });

        const { error } = await supabase
          .from("users")
          .upsert(payload, { onConflict: "email" });

        if (error) {
          const errInfo = {
            code: (error as { code?: string }).code,
            message: (error as { message?: string }).message,
            details: (error as { details?: string }).details,
            hint: (error as { hint?: string }).hint,
            status: (error as { status?: number }).status,
            name: (error as { name?: string }).name,
          };

          if (
            error.code === "PGRST204" &&
            typeof error.message === "string" &&
            error.message.includes("'name'")
          ) {
            const retry = await supabase
              .from("users")
              .upsert({ email }, { onConflict: "email" });

            if (retry.error) {
              console.error("Supabase upsert retry failed:", { ...errInfo, retry: retry.error });
            }
          } else if (error.code === "42P10") {
            const existing = await supabase
              .from("users")
              .select("email")
              .eq("email", email)
              .maybeSingle();

            if (existing.error) {
              console.error("Supabase manual upsert select failed:", existing.error);
            } else if (existing.data) {
              const updated = await supabase
                .from("users")
                .update(payload)
                .eq("email", email);

              if (updated.error) {
                console.error("Supabase manual upsert update failed:", updated.error);
              }
            } else {
              const inserted = await supabase.from("users").insert(payload);

              if (inserted.error) {
                if (
                  inserted.error.code === "PGRST204" &&
                  typeof inserted.error.message === "string" &&
                  inserted.error.message.includes("'name'")
                ) {
                  const emailOnly = await supabase.from("users").insert({ email });
                  if (emailOnly.error) {
                    console.error(
                      "Supabase manual upsert insert retry failed:",
                      emailOnly.error,
                    );
                  }
                } else {
                  console.error("Supabase manual upsert insert failed:", inserted.error);
                }
              }
            }
          } else {
            console.error("Supabase upsert failed:", errInfo);
          }
        } else {
          console.log("[auth] Supabase upsert OK:", { email });
        }

        return true;
      } catch (err) {
        console.error("SignIn callback error:", err);
        return true; // never block login
      }
    },

    /**
     * Token lifecycle:
     *   1. On first sign-in, Google returns access_token, refresh_token, and
     *      expires_at. Store all three in the JWT.
     *   2. On every subsequent request, if the access token is still fresh
     *      (>60s left), return as-is.
     *   3. If it's expired or about to expire, hit Google's token endpoint
     *      with the refresh_token to mint a new access token, update the JWT,
     *      and return.
     *   4. If refresh fails, mark the token with `error: "RefreshAccessTokenError"`
     *      so the client can prompt the user to sign in again.
     */
    async jwt({ token, account }) {
      // Initial sign-in: capture everything Google sent us.
      if (account) {
        const expiresAtMs =
          typeof account.expires_at === "number"
            ? account.expires_at * 1000
            : Date.now() + 55 * 60 * 1000; // 55-min default
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: expiresAtMs,
          error: undefined,
        };
      }

      // Token is still valid (with 60s safety margin).
      const expires = (token as { accessTokenExpires?: number }).accessTokenExpires;
      if (expires && Date.now() < expires - 60_000) {
        return token;
      }

      // Token expired — try to refresh.
      const refresh = (token as { refreshToken?: string }).refreshToken;
      if (!refresh) {
        return { ...token, error: "RefreshAccessTokenError" };
      }
      return await refreshAccessToken(token, refresh);
    },

    async session({ session, token }) {
      const t = token as {
        accessToken?: string;
        accessTokenExpires?: number;
        error?: string;
      };
      session.accessToken = t.accessToken;
      (session as { accessTokenExpires?: number }).accessTokenExpires = t.accessTokenExpires;
      (session as { error?: string }).error = t.error;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Exchange a Google refresh token for a new access token.
 * Reference: https://developers.google.com/identity/protocols/oauth2/web-server#offline
 */
async function refreshAccessToken(
  token: Record<string, unknown>,
  refreshToken: string,
): Promise<Record<string, unknown>> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const data = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!res.ok || !data.access_token) {
      console.error("[auth] Token refresh failed:", data);
      return { ...token, error: "RefreshAccessTokenError" };
    }

    console.log("[auth] Refreshed Google access token");
    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + (data.expires_in ?? 3600) * 1000,
      // Google sometimes returns a new refresh token — keep the latest, but
      // fall back to the original if it didn't.
      refreshToken: data.refresh_token ?? refreshToken,
      error: undefined,
    };
  } catch (err) {
    console.error("[auth] Token refresh threw:", err);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}
