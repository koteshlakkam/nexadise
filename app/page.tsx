"use client";

import Link from "next/link";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { InboxTransformationSection } from "@/components/features/landing/InboxTransformationSection";

export default function HomePage() {
  const { data: session, status } = useSession();
  const decisionFlow = [
    {
      id: "flow-1",
      message: "Founder sends: Please follow up with the lead before evening.",
      decision: "Nexadise decides: Create follow-up task and draft a reply.",
      delay: "0s",
    },
    {
      id: "flow-2",
      message: "Finance team sends: Monthly invoice payment is due tomorrow.",
      decision: "Nexadise decides: Create payment action with high priority.",
      delay: "3s",
    },
    {
      id: "flow-3",
      message: "Support sends: Client is blocked and needs urgent help now.",
      decision: "Nexadise decides: Create urgent ticket and notify assignee.",
      delay: "6s",
    },
  ];
  const completedActions = [
    { id: "done-1", text: "Gmail message converted into a support ticket.", delay: "0s" },
    { id: "done-2", text: "Payment reminder converted into invoice action.", delay: "1.6s" },
    { id: "done-3", text: "Meeting request converted into scheduled call.", delay: "3.2s" },
  ];

  return (
    <main className="bg-[#0f172a]">
      <section className="relative flex min-h-screen items-center justify-center p-6">
        <div className="absolute left-6 top-6">
          <Image src="/nexadise-logo.png" alt="Nexadise logo" width={45} height={29} priority />
        </div>
        <div className="absolute right-6 top-6 text-right">
          {status === "authenticated" ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-200">{session.user?.email}</p>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-lg bg-[#1e293b] px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signIn("google", { prompt: "select_account" })}
              className="rounded-lg bg-[#1e293b] px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Login with Google
            </button>
          )}
        </div>

        <div className="w-full max-w-5xl rounded-xl bg-[#1e293b] p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold uppercase leading-tight tracking-wide text-white sm:text-3xl">
            Save hours of time
            <br />
            See full action
          </h1>
          <p className="mt-3 text-base font-medium text-slate-200 sm:text-lg">
            nexadise inbox intelligence keep ready your work before you open inbox
          </p>

          <InboxTransformationSection />

          <Link
            href="/dashboard"
            className="mt-4 inline-flex rounded-lg bg-[#FF8400] px-4 py-2 text-sm font-medium text-white transition-transform duration-200 hover:scale-105 hover:bg-[#E67600] active:scale-95"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-6xl rounded-2xl bg-[#1e293b] p-8">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
            Give a message to Nexadise and get the right decision
          </h2>
          <div className="mt-8 grid items-center gap-6 lg:grid-cols-[220px_1fr_220px]">
            <div className="human-bob rounded-xl bg-[#0f172a] p-4 text-center">
              <p className="text-5xl">🧑‍💼</p>
              <p className="mt-2 text-sm text-slate-300">You send the message</p>
            </div>

            <div className="relative rounded-xl bg-[#0f172a] p-5">
              <div className="handoff-message absolute left-4 top-3 rounded-md bg-slate-700 px-3 py-2 text-xs text-slate-100">
                New client asks for onboarding support.
              </div>
              <div className="mt-14 space-y-3">
                {decisionFlow.map((item) => (
                  <div
                    key={item.id}
                    className="email-flow-item rounded-md bg-[#1e293b] p-3 text-left text-sm text-slate-200"
                    style={{ animationDelay: item.delay }}
                  >
                    <p>{item.message}</p>
                    <p className="mt-2 font-medium text-[#FFB066]">{item.decision}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="human-bob rounded-xl bg-[#0f172a] p-4 text-center" style={{ animationDelay: "0.8s" }}>
              <p className="text-5xl">🧠</p>
              <p className="mt-2 text-sm text-slate-300">Nexadise takes action</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl rounded-2xl bg-[#1e293b] p-8">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
            From difficult Gmail inbox to clear completed actions
          </h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_90px_1fr]">
            <div className="rounded-xl bg-[#0f172a] p-5">
              <p className="text-sm font-semibold text-slate-200">Hard to manage inbox</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="rounded-md bg-[#1e293b] p-3">Unread Gmail threads are increasing.</li>
                <li className="rounded-md bg-[#1e293b] p-3">Payment reminders are mixed with support queries.</li>
                <li className="rounded-md bg-[#1e293b] p-3">Meeting requests are easy to miss in busy hours.</li>
              </ul>
            </div>

            <div className="email-flow-line hidden h-[2px] self-center rounded-full bg-[#FF8400] lg:block" />

            <div className="rounded-xl bg-[#0f172a] p-5">
              <p className="text-sm font-semibold text-slate-200">Completed actions</p>
              <ul className="mt-4 space-y-3">
                {completedActions.map((item) => (
                  <li
                    key={item.id}
                    className="action-complete rounded-md bg-[#1e293b] p-3 text-sm text-slate-100"
                    style={{ animationDelay: item.delay }}
                  >
                    <span className="mr-2 text-[#FF8400]">✓</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
