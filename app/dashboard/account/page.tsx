"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-sm text-ink-500">Loading account…</p>;
  }

  if (status !== "authenticated" || !session?.user) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tighter2 text-ink-900 sm:text-3xl">
            Account
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Sign in with Google to view your profile.
          </p>
        </header>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-ink-700">You&apos;re signed out.</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => signIn("google", { prompt: "select_account" })}
              leadingIcon={<Icon.Google className="h-3.5 w-3.5" />}
            >
              Sign in with Google
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const initial = (session.user.name ?? session.user.email ?? "?").slice(0, 1).toUpperCase();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-2xs font-medium uppercase tracking-wide text-ink-500">Account</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tighter2 text-ink-900 sm:text-3xl">
          Your profile
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Account details and connected Google session.
        </p>
      </header>

      <Card title="Profile">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-base font-semibold text-white shadow-soft">
            {initial}
          </span>
          <div className="min-w-0">
            {session.user.name ? (
              <p className="truncate text-base font-semibold text-ink-900">
                {session.user.name}
              </p>
            ) : null}
            <p className="truncate text-sm text-ink-600">{session.user.email}</p>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-ink-100 border-t border-ink-100">
          <Row label="Email" value={session.user.email ?? "—"} />
          <Row label="Auth provider" value="Google" />
          <Row
            label="Gmail access"
            value={session.accessToken ? "Granted" : "Not granted"}
          />
        </dl>
      </Card>

      <Card title="Session">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-ink-700">
            Sign out to disconnect your Google session and clear local state.
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            leadingIcon={<Icon.Logout className="h-3.5 w-3.5" />}
          >
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="text-2xs font-semibold uppercase tracking-wider text-ink-500">{label}</dt>
      <dd className="truncate text-sm text-ink-900">{value}</dd>
    </div>
  );
}
