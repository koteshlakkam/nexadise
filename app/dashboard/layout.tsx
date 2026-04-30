"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const NAV_PRIMARY = [
	{
		href: "/dashboard",
		label: "Today",
		icon: <Icon.Inbox className="h-4 w-4" />,
	},
	{
		href: "/dashboard/inbox",
		label: "Inbox",
		icon: <Icon.Mail className="h-4 w-4" />,
	},
	{
		href: "/dashboard/actions",
		label: "Actions",
		icon: <Icon.Bolt className="h-4 w-4" />,
	},
	{
		href: "/dashboard/insights",
		label: "Insights",
		icon: <Icon.Sparkles className="h-4 w-4" />,
	},
];

const NAV_WORKSPACE = [
	{
		href: "/dashboard/integrations",
		label: "Integrations",
		icon: <Icon.Settings className="h-4 w-4" />,
	},
	{
		href: "/dashboard/account",
		label: "Account",
		icon: <Icon.User className="h-4 w-4" />,
	},
];

function isActive(pathname: string | null, href: string) {
	if (!pathname) return false;
	if (href === "/dashboard") return pathname === "/dashboard";
	return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, status } = useSession();
	const pathname = usePathname();

	return (
		<div className="min-h-screen bg-surface-muted">
			{/* TOP BAR */}
			<header className="sticky top-0 z-30 border-b border-ink-100 bg-white/80 backdrop-blur">
				<div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
					<div className="flex items-center gap-2">
						<Link href="/" className="flex items-center gap-2">
							<Icon.Logo className="h-7 w-7" />
							<span className="hidden text-sm font-semibold tracking-tightish text-ink-900 sm:inline">
								nexadise
							</span>
						</Link>
						<span className="mx-1 hidden h-4 w-px bg-ink-200 sm:block" />
						<span className="hidden rounded-md bg-ink-100 px-2 py-0.5 text-2xs font-medium text-ink-600 sm:inline">
							Workspace
						</span>
					</div>

					<div className="hidden flex-1 items-center justify-center md:flex">
						<div className="relative w-full max-w-md">
							<Icon.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
							<input
								type="search"
								placeholder="Search emails, tasks, people…"
								className="h-9 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200/60"
							/>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<button
							type="button"
							className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition"
							aria-label="Notifications"
						>
							<Icon.Bell className="h-4 w-4" />
						</button>
						{status === "authenticated" ? (
							<div className="flex items-center gap-2">
								<Link
									href="/dashboard/account"
									className="hidden items-center gap-2 rounded-lg border border-ink-200 bg-white px-2.5 py-1 transition hover:border-ink-300 sm:flex"
								>
									<span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-2xs font-semibold text-brand-700">
										{(session.user?.email ?? "?")
											.slice(0, 1)
											.toUpperCase()}
									</span>
									<span className="max-w-[160px] truncate text-2xs text-ink-700">
										{session.user?.email}
									</span>
								</Link>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => signOut()}
									leadingIcon={
										<Icon.Logout className="h-3.5 w-3.5" />
									}
								>
									Sign out
								</Button>
							</div>
						) : (
							<Button
								size="sm"
								variant="primary"
								onClick={() => signIn("google")}
								leadingIcon={
									<Icon.Google className="h-3.5 w-3.5" />
								}
							>
								Sign in
							</Button>
						)}
					</div>
				</div>
			</header>

			<div className="flex items-start">
				{/* SIDEBAR */}
				<aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-ink-100 bg-white/60 px-3 py-6 lg:block">
					<nav className="space-y-1">
						{NAV_PRIMARY.map((item) => (
							<SideLink
								key={item.href}
								href={item.href}
								icon={item.icon}
								label={item.label}
								active={isActive(pathname, item.href)}
							/>
						))}
					</nav>

					<div className="mt-6 px-3">
						<p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">
							Workspace
						</p>
					</div>
					<nav className="mt-2 space-y-1">
						{NAV_WORKSPACE.map((item) => (
							<SideLink
								key={item.href}
								href={item.href}
								icon={item.icon}
								label={item.label}
								active={isActive(pathname, item.href)}
							/>
						))}
					</nav>

					<div className="mt-8 rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-violet-50 p-4">
						<div className="flex items-center gap-2">
							<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-brand-600 shadow-xs">
								<Icon.Sparkles className="h-4 w-4" />
							</span>
							<p className="text-sm font-semibold text-ink-900">
								nexadise Pro
							</p>
						</div>
						<p className="mt-2 text-2xs leading-relaxed text-ink-600">
							Unlimited AI analysis, calendar drafts, and team
							workflows.
						</p>
						<Button
							size="sm"
							variant="primary"
							fullWidth
							className="mt-3"
						>
							Upgrade
						</Button>
					</div>
				</aside>

				{/* MAIN */}
				<main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
					<div className="mx-auto max-w-6xl">{children}</div>
				</main>
			</div>
		</div>
	);
}

function SideLink({
	href,
	icon,
	label,
	active,
}: {
	href: string;
	icon: React.ReactNode;
	label: string;
	active: boolean;
}) {
	return (
		<Link
			href={href}
			className={cn(
				"flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
				active
					? "bg-ink-900 text-white shadow-soft"
					: "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
			)}
		>
			<span
				className={cn(
					"shrink-0",
					active ? "text-white" : "text-ink-500",
				)}
			>
				{icon}
			</span>
			<span>{label}</span>
		</Link>
	);
}
