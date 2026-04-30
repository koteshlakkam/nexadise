"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

export default function PrivacyPage() {
	return (
		<main className="relative overflow-hidden bg-white">
			{/* Top glow */}
			<div
				className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-hero-glow"
				aria-hidden
			/>

			{/* Nav */}
			<header className="sticky top-0 z-40 border-b border-transparent">
				<div className="glass border-b border-ink-100">
					<Container size="xl">
						<div className="flex h-16 items-center justify-between">
							<Link href="/" className="flex items-center gap-2">
								<Icon.Logo className="h-7 w-7" />
								<span className="text-base font-semibold tracking-tightish text-ink-900">
									nexadise
								</span>
							</Link>

							<nav className="hidden items-center gap-7 md:flex">
								<Link
									href="/#features"
									className="text-sm text-ink-600 hover:text-ink-900 transition"
								>
									Features
								</Link>
								<Link
									href="/#how"
									className="text-sm text-ink-600 hover:text-ink-900 transition"
								>
									How it works
								</Link>
								<Link
									href="/#demo"
									className="text-sm text-ink-600 hover:text-ink-900 transition"
								>
									Demo
								</Link>
							</nav>

							<Link
								href="/"
								className="text-sm text-ink-600 hover:text-ink-900 transition inline-flex items-center gap-1"
							>
								<Icon.ArrowRight className="h-3.5 w-3.5 rotate-180" />
								Back to home
							</Link>
						</div>
					</Container>
				</div>
			</header>

			{/* CONTENT */}
			<section className="relative pt-16 pb-24 sm:pt-20 sm:pb-28">
				<Container size="md">
					<div className="mx-auto max-w-3xl">
						<p className="text-2xs font-semibold uppercase tracking-wide text-brand-600">
							Legal
						</p>
						<h1 className="mt-3 text-balance text-4xl font-semibold tracking-tighter2 text-ink-900 sm:text-5xl">
							Privacy Policy
						</h1>
						<p className="mt-4 text-sm text-ink-500">
							Effective Date: May 1, 2026
						</p>

						<div className="prose-legal mt-10 space-y-10 text-ink-700">
							<p className="text-base leading-relaxed">
								nexadise (&ldquo;we&rdquo;, &ldquo;our&rdquo;,
								or &ldquo;us&rdquo;) is committed to protecting
								your privacy. This Privacy Policy explains how
								we collect, use, and safeguard your information
								when you use our services.
							</p>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									1. Information We Collect
								</h2>
								<h3 className="mt-5 text-base font-semibold text-ink-900">
									a. Account Information
								</h3>
								<p className="mt-2 text-base leading-relaxed">
									When you sign in, we collect:
								</p>
								<ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-relaxed">
									<li>Name</li>
									<li>Email address</li>
								</ul>
								<h3 className="mt-6 text-base font-semibold text-ink-900">
									b. Google User Data (Gmail Integration)
								</h3>
								<p className="mt-2 text-base leading-relaxed">
									With your explicit consent, nexadise
									accesses limited Gmail data using
									Google&rsquo;s read-only permissions.
								</p>
								<p className="mt-2 text-base leading-relaxed">
									We only access email metadata, including:
								</p>
								<ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-relaxed">
									<li>Email subject</li>
									<li>Sender information</li>
									<li>Snippet (preview text)</li>
									<li>Timestamp</li>
								</ul>
								<p className="mt-3 text-base leading-relaxed">
									We do not access, read, or store full email
									content or attachments.
								</p>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									2. How We Use Information
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									We use the collected data strictly to
									provide and improve nexadise functionality,
									including:
								</p>
								<ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-relaxed">
									<li>
										Analyzing email metadata to identify
										actionable items
									</li>
									<li>
										Converting emails into structured tasks
									</li>
									<li>
										Categorizing emails (e.g., follow-ups,
										invoices, hiring)
									</li>
									<li>
										Providing AI-generated insights and
										workflow suggestions
									</li>
								</ul>
								<p className="mt-3 text-base leading-relaxed">
									We do not use your data for advertising or
									unrelated purposes.
								</p>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									3. Google User Data Policy Compliance
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									nexadise&rsquo;s use of information received
									from Google APIs adheres to the Google API
									Services User Data Policy, including the
									Limited Use requirements.
								</p>
								<p className="mt-3 text-base leading-relaxed">
									Specifically:
								</p>
								<ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-relaxed">
									<li>
										We only use Gmail data to provide
										user-facing features
									</li>
									<li>
										We do not transfer or sell Google user
										data to third parties
									</li>
									<li>
										We do not use this data for advertising
									</li>
								</ul>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									4. Data Sharing
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									We do not sell, rent, or share your personal
									or email data with third parties.
								</p>
								<p className="mt-3 text-base leading-relaxed">
									We may share limited data only:
								</p>
								<ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-relaxed">
									<li>When required by law</li>
									<li>
										With trusted infrastructure providers
										strictly necessary to operate the
										service
									</li>
								</ul>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									5. Data Security
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									We implement industry-standard security
									measures, including:
								</p>
								<ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-relaxed">
									<li>Encryption in transit (HTTPS)</li>
									<li>Secure storage systems</li>
									<li>
										Access restrictions to authorized
										systems only
									</li>
								</ul>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									6. Data Retention
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									We retain data only as long as necessary to
									provide our services.
								</p>
								<p className="mt-3 text-base leading-relaxed">
									If you disconnect your Google account or
									delete your nexadise account:
								</p>
								<ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-relaxed">
									<li>
										Associated data is deleted within a
										reasonable timeframe.
									</li>
								</ul>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									7. User Control
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									You have full control over your data. You
									can:
								</p>
								<ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-relaxed">
									<li>
										Disconnect your Google account at any
										time
									</li>
									<li>Request deletion of your data</li>
									<li>
										Stop using the service without penalty
									</li>
								</ul>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									8. Third-Party Services
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									nexadise integrates with Google services to
									enable Gmail-based functionality.
								</p>
								<p className="mt-3 text-base leading-relaxed">
									We only request access to data required for
									core features and do not exceed the scope of
									permissions granted.
								</p>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									9. Changes to This Policy
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									We may update this Privacy Policy from time
									to time. Updates will be posted on this
									page.
								</p>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									10. Contact Us
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									If you have any questions about this Privacy
									Policy, contact us at:
								</p>
								<p className="mt-2 text-base leading-relaxed">
									Email:{" "}
									<a
										href="mailto:koteshlakkam2704@gmail.com"
										className="text-brand-600 underline-offset-2 hover:underline"
									>
										koteshlakkam2704@gmail.com
									</a>
								</p>
							</section>
						</div>

						<div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-ink-100 pt-8 sm:flex-row sm:items-center">
							<p className="text-2xs text-ink-500">
								Last updated May 1, 2026 · &copy;{" "}
								{new Date().getFullYear()} nexadise
							</p>
							<Link
								href="/terms"
								className="text-sm text-brand-600 hover:text-brand-700 transition inline-flex items-center gap-1"
							>
								Read our Terms of Service
								<Icon.ArrowRight className="h-3.5 w-3.5" />
							</Link>
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
							<span className="text-sm font-medium text-ink-900">
								nexadise
							</span>
							<span className="ml-2 text-2xs text-ink-400">
								&copy; {new Date().getFullYear()}
							</span>
						</div>
						<div className="flex items-center gap-5 text-2xs text-ink-500">
							<Link
								href="/#features"
								className="hover:text-ink-900 transition"
							>
								Features
							</Link>
							<Link
								href="/#how"
								className="hover:text-ink-900 transition"
							>
								How it works
							</Link>
							<Link
								href="/privacy"
								className="text-ink-900 transition"
							>
								Privacy
							</Link>
							<Link
								href="/terms"
								className="hover:text-ink-900 transition"
							>
								Terms
							</Link>
							<Link
								href="/dashboard"
								className="hover:text-ink-900 transition"
							>
								Dashboard
							</Link>
						</div>
					</div>
				</Container>
			</footer>
		</main>
	);
}
