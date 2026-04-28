"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { InboxTransformationSection } from "@/components/features/landing/InboxTransformationSection";

const FEATURES = [
  {
    icon: <Icon.Sparkles className="h-5 w-5" />,
    title: "Decides what matters",
    body: "Nexadise reads every thread and surfaces what actually needs you — replies, approvals, follow-ups, blockers.",
  },
  {
    icon: <Icon.Bolt className="h-5 w-5" />,
    title: "Drafts the next move",
    body: "From reply suggestions to scheduling and invoice approvals, every action arrives ready to send.",
  },
  {
    icon: <Icon.CheckCircle className="h-5 w-5" />,
    title: "Closes the loop",
    body: "Tasks complete in your tools — Gmail, Slack, calendar — and your inbox quietly clears itself.",
  },
];

const STEPS = [
  { n: "01", title: "Connect Gmail", body: "One click. We never store passwords — only what's needed to read and act." },
  { n: "02", title: "Nexadise reads & decides", body: "Every message is summarized and classified by intent and urgency." },
  { n: "03", title: "You approve, it ships", body: "Pre-drafted replies, calendar invites, and tasks — one tap to confirm." },
];

const LOGOS = ["Acme", "Linear", "Stripe", "Notion", "Vercel", "Figma", "Loom", "Ramp"];

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <main className="relative overflow-hidden bg-white">
      {/* Top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-hero-glow" aria-hidden />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-transparent">
        <div className="glass border-b border-ink-100">
          <Container size="xl">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Icon.Logo className="h-7 w-7" />
                <span className="text-base font-semibold tracking-tightish text-ink-900">Nexadise</span>
              </Link>

              <nav className="hidden items-center gap-7 md:flex">
                <a href="#features" className="text-sm text-ink-600 hover:text-ink-900 transition">Features</a>
                <a href="#how" className="text-sm text-ink-600 hover:text-ink-900 transition">How it works</a>
                <a href="#demo" className="text-sm text-ink-600 hover:text-ink-900 transition">Demo</a>
              </nav>

              <div className="flex items-center gap-2">
                {status === "authenticated" ? (
                  <>
                    <span className="hidden text-xs text-ink-500 sm:inline">{session.user?.email}</span>
                    <Link href="/dashboard">
                      <Button size="sm" variant="primary" trailingIcon={<Icon.ArrowRight className="h-3.5 w-3.5" />}>
                        Open dashboard
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => signOut()}>
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => signIn("google", { prompt: "select_account" })}
                    >
                      Sign in
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => signIn("google", { prompt: "select_account" })}
                      trailingIcon={<Icon.ArrowRight className="h-3.5 w-3.5" />}
                    >
                      Get started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Container>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/80 px-3 py-1 text-xs font-medium text-ink-700 shadow-xs backdrop-blur"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
              New · AI inbox actions for founders
              <Icon.ArrowRight className="h-3 w-3 text-ink-400" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-6 text-balance text-4xl font-semibold tracking-tighter2 text-ink-900 sm:text-5xl lg:text-6xl"
            >
              Inbox intelligence
              <br />
              that takes{" "}
              <span className="bg-gradient-to-br from-brand-600 via-brand-500 to-violet-500 bg-clip-text text-transparent">
                action
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-ink-600 sm:text-lg"
            >
              Nexadise reads your inbox, decides what matters, and drafts the next move —
              so your morning starts with a calm list of decisions, not a wall of email.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              {status === "authenticated" ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="primary" trailingIcon={<Icon.ArrowRight className="h-4 w-4" />}>
                    Open your dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => signIn("google", { prompt: "select_account" })}
                  leadingIcon={<Icon.Google className="h-4 w-4" />}
                >
                  Continue with Google
                </Button>
              )}
              <a href="#demo">
                <Button size="lg" variant="secondary" trailingIcon={<Icon.ArrowRight className="h-4 w-4" />}>
                  See it in action
                </Button>
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-5 text-2xs text-ink-400"
            >
              No credit card · Free during beta · Connect & disconnect anytime
            </motion.p>
          </div>

          {/* Hero product preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="relative mx-auto mt-16 max-w-5xl"
          >
            <div className="absolute -inset-12 -z-10 rounded-[40px] bg-gradient-to-br from-brand-200/40 via-violet-200/30 to-transparent blur-3xl" />
            <div className="rounded-2xl border border-ink-200 bg-white/70 p-2 shadow-elevated backdrop-blur">
              <div className="rounded-xl border border-ink-200 bg-white p-6">
                <InboxTransformationSection />
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-ink-100 bg-surface-muted/40 py-10">
        <Container size="xl">
          <p className="text-center text-2xs font-medium uppercase tracking-wide text-ink-500">
            Trusted by teams shipping at
          </p>
          <div className="mt-6 overflow-hidden">
            <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
              {[...LOGOS, ...LOGOS].map((logo, i) => (
                <span
                  key={i}
                  className="text-lg font-semibold tracking-tight text-ink-400/80"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 sm:py-32">
        <Container size="xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-2xs font-semibold uppercase tracking-wide text-brand-600">
              How Nexadise helps
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tighter2 text-ink-900 sm:text-4xl">
              Stop triaging. Start finishing.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-600">
              Three quiet superpowers that turn your inbox from a to-do list into a done list.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group relative rounded-2xl border border-ink-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                  {f.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tightish text-ink-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative py-24 sm:py-32">
        <div
          className="absolute inset-0 -z-10 bg-dot-grid bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
          aria-hidden
        />
        <Container size="xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-2xs font-semibold uppercase tracking-wide text-brand-600">
              In three steps
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tighter2 text-ink-900 sm:text-4xl">
              Set it up in under a minute
            </h2>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative rounded-2xl border border-ink-200 bg-white p-6"
              >
                <span className="text-2xs font-semibold tracking-wider text-brand-600">
                  {s.n}
                </span>
                <h3 className="mt-2 text-base font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* DEMO */}
      <section id="demo" className="py-24 sm:py-32">
        <Container size="xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-2xs font-semibold uppercase tracking-wide text-brand-600">
              Watch it work
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tighter2 text-ink-900 sm:text-4xl">
              From inbox chaos to clear next steps
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-600">
              Live preview of the workflow. No setup. No demos to book.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-5xl rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
            <InboxTransformationSection />
          </div>
        </Container>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-20">
        <Container size="md">
          <figure className="rounded-3xl border border-ink-200 bg-gradient-to-br from-white via-brand-50/30 to-violet-50/30 p-10 text-center shadow-soft">
            <blockquote className="text-balance text-xl font-medium leading-relaxed tracking-tightish text-ink-800 sm:text-2xl">
              “Nexadise gave us back two hours a day. It's the first tool that
              actually <em className="not-italic text-brand-700">does</em> something with my inbox
              instead of just showing it to me.”
            </blockquote>
            <figcaption className="mt-6 flex items-center justify-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                MR
              </span>
              <div className="text-left">
                <p className="text-sm font-medium text-ink-900">Maya R.</p>
                <p className="text-2xs text-ink-500">Founder · Lumen Studio</p>
              </div>
            </figcaption>
          </figure>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-24">
        <Container size="lg">
          <div className="relative overflow-hidden rounded-3xl border border-ink-900/5 bg-ink-900 px-8 py-16 text-center sm:px-16">
            <div
              className="absolute inset-0 -z-10 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(99,102,241,0.4),transparent_60%)]"
              aria-hidden
            />
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tighter2 text-white sm:text-4xl">
              Reclaim your mornings.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-balance text-base leading-relaxed text-white/70">
              Connect Gmail in one click. Nexadise handles the rest while you
              get on with the work that actually moves things forward.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {status === "authenticated" ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" trailingIcon={<Icon.ArrowRight className="h-4 w-4" />}>
                    Open dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => signIn("google", { prompt: "select_account" })}
                  leadingIcon={<Icon.Google className="h-4 w-4" />}
                >
                  Continue with Google
                </Button>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ink-100 py-10">
        <Container size="xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Icon.Logo className="h-5 w-5" />
              <span className="text-sm font-medium text-ink-900">Nexadise</span>
              <span className="ml-2 text-2xs text-ink-400">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-5 text-2xs text-ink-500">
              <a href="#features" className="hover:text-ink-900 transition">Features</a>
              <a href="#how" className="hover:text-ink-900 transition">How it works</a>
              <a href="#demo" className="hover:text-ink-900 transition">Demo</a>
              <Link href="/dashboard" className="hover:text-ink-900 transition">Dashboard</Link>
            </div>
          </div>
        </Container>
      </footer>
    </main>
  );
}
