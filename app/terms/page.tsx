"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

export default function TermsPage() {
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
							Terms of Service
						</h1>
						<p className="mt-4 text-sm text-ink-500">
							Effective Date: May 1, 2026
						</p>

						<div className="prose-legal mt-10 space-y-10 text-ink-700">
							<p className="text-base leading-relaxed">
								Welcome to nexadise. By accessing or using our
								services, you agree to be bound by these Terms
								of Service.
							</p>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									1. Use of Service
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									nexadise provides tools to convert email
									activity into actionable tasks and
									workflows.
								</p>
								<p className="mt-3 text-base leading-relaxed">
									You agree to use the service only for lawful
									purposes.
								</p>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									2. User Accounts
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									You are responsible for:
								</p>
								<ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-relaxed">
									<li>
										Providing accurate account information
									</li>
									<li>
										Maintaining the security of your account
									</li>
									<li>All activity under your account</li>
								</ul>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									3. Google Integration
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									By connecting your Google account, you grant
									nexadise permission to access limited Gmail
									data as required to provide its
									functionality.
								</p>
								<p className="mt-3 text-base leading-relaxed">
									nexadise uses this data only to deliver
									user-facing features and does not misuse or
									sell user data.
								</p>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									4. Acceptable Use
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									You agree not to:
								</p>
								<ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-relaxed">
									<li>
										Use the service for illegal purposes
									</li>
									<li>
										Attempt to disrupt or hack the platform
									</li>
									<li>Misuse the system or its features</li>
								</ul>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									5. Data Ownership
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									You retain ownership of your data.
								</p>
								<p className="mt-3 text-base leading-relaxed">
									nexadise processes your data only to provide
									its services.
								</p>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									6. Service Availability
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									We strive to provide reliable service but do
									not guarantee uninterrupted or error-free
									operation.
								</p>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									7. Limitation of Liability
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									nexadise is not liable for:
								</p>
								<ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-relaxed">
									<li>
										Any indirect or consequential damages
									</li>
									<li>
										Business losses resulting from use of
										the service
									</li>
									<li>
										Data loss caused by external factors
										beyond our control
									</li>
								</ul>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									8. Termination
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									We may suspend or terminate your access if
									you violate these terms or misuse the
									service.
								</p>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									9. Changes to Terms
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									We may update these Terms of Service at any
									time. Continued use of the service
									constitutes acceptance of the updated terms.
								</p>
							</section>

							<section>
								<h2 className="text-xl font-semibold tracking-tightish text-ink-900">
									10. Contact
								</h2>
								<p className="mt-2 text-base leading-relaxed">
									For any questions, contact:
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
								href="/privacy"
								className="text-sm text-brand-600 hover:text-brand-700 transition inline-flex items-center gap-1"
							>
								Read our Privacy Policy
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
								className="hover:text-ink-900 transition"
							>
								Privacy
							</Link>
							<Link
								href="/terms"
								className="text-ink-900 transition"
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
