import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabaseClient";

const handler = NextAuth({
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
            code: (error as any)?.code,
            message: (error as any)?.message,
            details: (error as any)?.details,
            hint: (error as any)?.hint,
            status: (error as any)?.status,
            name: (error as any)?.name,
          };

          // If the table doesn't have a `name` column, fall back to email-only upsert.
          if (
            error.code === "PGRST204" &&
            typeof error.message === "string" &&
            error.message.includes("'name'")
          ) {
            const retry = await supabase
              .from("users")
              .upsert({ email }, { onConflict: "email" });

            if (retry.error) {
              console.error("Supabase upsert retry failed:", {
                ...errInfo,
                retry: {
                  code: (retry.error as any)?.code,
                  message: (retry.error as any)?.message,
                  details: (retry.error as any)?.details,
                  hint: (retry.error as any)?.hint,
                  status: (retry.error as any)?.status,
                },
              });
            }
          } else if (error.code === "42P10") {
            // If Postgres rejects ON CONFLICT, fall back to manual upsert.
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
                // Try inserting email-only if `name` column doesn't exist.
                if (
                  inserted.error.code === "PGRST204" &&
                  typeof inserted.error.message === "string" &&
                  inserted.error.message.includes("'name'")
                ) {
                  const emailOnly = await supabase.from("users").insert({ email });
                  if (emailOnly.error) {
                    console.error(
                      "Supabase manual upsert insert retry failed:",
                      emailOnly.error
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
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };