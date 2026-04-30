"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";

const CHAOS_ITEMS = [
	{
		id: "c1",
		sender: "Jordan Lee",
		initials: "JL",
		subject: "Re: Q3 contract — urgent",
		time: "9:42 AM",
		tone: "rose",
	},
	{
		id: "c2",
		sender: "Stripe Billing",
		initials: "SB",
		subject: "Invoice #1184 due today",
		time: "9:14 AM",
		tone: "amber",
	},
	{
		id: "c3",
		sender: "Priya Shah",
		initials: "PS",
		subject: "Slack: Client blocked on review",
		time: "8:51 AM",
		tone: "rose",
	},
	{
		id: "c4",
		sender: "Calendly",
		initials: "CL",
		subject: "Demo reschedule request",
		time: "8:30 AM",
		tone: "blue",
	},
	{
		id: "c5",
		sender: "Gusto",
		initials: "GT",
		subject: "Reminder: payroll runs tomorrow",
		time: "7:55 AM",
		tone: "amber",
	},
	{
		id: "c6",
		sender: "Maya R.",
		initials: "MR",
		subject: "Demo follow-up + next steps",
		time: "Yesterday",
		tone: "violet",
	},
];

const ACTION_ITEMS = [
	{
		id: "a1",
		title: "Reply to Q3 contract thread",
		priority: "High",
		type: "Reply",
	},
	{
		id: "a2",
		title: "Approve invoice #1184",
		priority: "High",
		type: "Approve",
	},
	{
		id: "a3",
		title: "Send 30-min demo slot to Maya",
		priority: "Medium",
		type: "Schedule",
	},
];

const toneAccent: Record<string, string> = {
	rose: "bg-rose-500",
	amber: "bg-amber-500",
	blue: "bg-blue-500",
	violet: "bg-violet-500",
};

const toneAvatar: Record<string, string> = {
	rose: "bg-rose-100 text-rose-700",
	amber: "bg-amber-100 text-amber-800",
	blue: "bg-blue-100 text-blue-700",
	violet: "bg-violet-100 text-violet-700",
};

const priorityTone: Record<string, string> = {
	High: "bg-rose-50 text-rose-700 ring-rose-200/70",
	Medium: "bg-amber-50 text-amber-800 ring-amber-200/70",
	Low: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
};

export function InboxTransformationSection() {
	const [step, setStep] = useState(0);

	useEffect(() => {
		const id = setInterval(() => setStep((s) => (s + 1) % 4), 2400);
		return () => clearInterval(id);
	}, []);

	return (
		<section className="relative">
			<div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
				{/* BEFORE — chaotic inbox */}
				<div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-50 text-rose-600">
								<Icon.Inbox className="h-3.5 w-3.5" />
							</span>
							<p className="text-xs font-medium text-ink-700">
								Before · raw inbox
							</p>
						</div>
						<span className="rounded-full bg-rose-50 px-2 py-0.5 text-2xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200/70">
							{CHAOS_ITEMS.length} unread
						</span>
					</div>

					<div className="mt-4 space-y-1.5">
						{CHAOS_ITEMS.map((item, idx) => (
							<motion.div
								key={item.id}
								initial={{ opacity: 0, y: 6 }}
								animate={
									step < 2
										? { opacity: 1, y: 0 }
										: { opacity: 0.7, y: 0 }
								}
								transition={{
									duration: 0.4,
									delay: idx * 0.05,
								}}
								className="group relative flex items-center gap-2.5 overflow-hidden rounded-lg border border-ink-200 bg-white px-2.5 py-2 transition-colors hover:bg-ink-50/50"
							>
								<span
									className={`absolute inset-y-1 left-0 w-0.5 rounded-full ${toneAccent[item.tone]}`}
								/>
								<span
									className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-2xs font-semibold ${toneAvatar[item.tone]}`}
								>
									{item.initials}
								</span>
								<div className="min-w-0 flex-1">
									<div className="flex items-baseline justify-between gap-2">
										<p className="truncate text-2xs font-semibold text-ink-900">
											{item.sender}
										</p>
										<span className="shrink-0 text-[10px] text-ink-400">
											{item.time}
										</span>
									</div>
									<p className="truncate text-2xs text-ink-600">
										{item.subject}
									</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>

				{/* Connector arrow */}
				<div className="flex items-center justify-center py-2 lg:py-0">
					<motion.div
						animate={{ x: [0, 6, 0] }}
						transition={{
							repeat: Infinity,
							duration: 1.6,
							ease: "easeInOut",
						}}
						className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-elevated"
					>
						<Icon.Sparkles className="h-5 w-5" />
					</motion.div>
				</div>

				{/* AFTER — nexadise actions */}
				<div className="relative rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
					<div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-brand-500/10 via-violet-500/5 to-transparent pointer-events-none" />
					<div className="relative">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
									<Icon.CheckCircle className="h-3.5 w-3.5" />
								</span>
								<p className="text-xs font-medium text-ink-700">
									After · prioritized actions
								</p>
							</div>
							<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-2xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200/70">
								Ready to act
							</span>
						</div>

						<div className="mt-4 space-y-2.5">
							<AnimatePresence mode="popLayout">
								{ACTION_ITEMS.map((item, idx) => (
									<motion.div
										key={item.id}
										layout
										initial={{ opacity: 0, y: 10 }}
										animate={
											step >= 2
												? { opacity: 1, y: 0 }
												: { opacity: 0.35, y: 6 }
										}
										transition={{
											delay: 0.1 + idx * 0.1,
											duration: 0.35,
										}}
										className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-3"
									>
										<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
											<Icon.Bolt className="h-3.5 w-3.5" />
										</span>
										<div className="min-w-0 flex-1">
											<div className="flex items-center justify-between gap-2">
												<p className="truncate text-xs font-medium text-ink-900">
													{item.title}
												</p>
												<span
													className={`rounded-full px-2 py-0.5 text-2xs font-semibold ring-1 ring-inset ${priorityTone[item.priority]}`}
												>
													{item.priority}
												</span>
											</div>
											<p className="mt-0.5 text-2xs text-ink-500">
												{item.type}
											</p>
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
