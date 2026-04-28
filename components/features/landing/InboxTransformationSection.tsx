"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";

const CHAOS_ITEMS = [
  { id: "c1", label: "Re: Q3 contract — urgent", tone: "rose" },
  { id: "c2", label: "Invoice #1184 due today", tone: "amber" },
  { id: "c3", label: "Slack: Client blocked", tone: "rose" },
  { id: "c4", label: "Calendly: reschedule", tone: "blue" },
  { id: "c5", label: "Reminder: payroll", tone: "amber" },
  { id: "c6", label: "Maya — demo follow-up", tone: "violet" },
];

const ACTION_ITEMS = [
  { id: "a1", title: "Reply to Q3 contract thread", priority: "High", type: "Reply" },
  { id: "a2", title: "Approve invoice #1184", priority: "High", type: "Approve" },
  { id: "a3", title: "Send 30-min demo slot to Maya", priority: "Medium", type: "Schedule" },
];

const toneCard: Record<string, string> = {
  rose: "bg-rose-50 text-rose-700 border-rose-200/70",
  amber: "bg-amber-50 text-amber-800 border-amber-200/70",
  blue: "bg-blue-50 text-blue-700 border-blue-200/70",
  violet: "bg-violet-50 text-violet-700 border-violet-200/70",
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
              <p className="text-xs font-medium text-ink-700">Before · raw inbox</p>
            </div>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-2xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200/70">
              {CHAOS_ITEMS.length} unread
            </span>
          </div>

          <div className="relative mt-4 h-[200px]">
            {CHAOS_ITEMS.map((item, idx) => (
              <motion.div
                key={item.id}
                className={`absolute w-[80%] rounded-lg border px-3 py-2 text-xs font-medium ${toneCard[item.tone]}`}
                initial={{ opacity: 0, y: 8, rotate: 0 }}
                animate={
                  step < 2
                    ? {
                        opacity: 1,
                        y: idx * 14,
                        x: idx % 2 === 0 ? 0 : 18,
                        rotate: idx % 2 === 0 ? -1.5 : 1.5,
                      }
                    : {
                        opacity: 0.35,
                        y: idx * 12,
                        x: 4,
                        rotate: 0,
                      }
                }
                transition={{ duration: 0.5, delay: idx * 0.04 }}
              >
                {item.label}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Connector arrow */}
        <div className="flex items-center justify-center py-2 lg:py-0">
          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-elevated"
          >
            <Icon.Sparkles className="h-5 w-5" />
          </motion.div>
        </div>

        {/* AFTER — Nexadise actions */}
        <div className="relative rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-brand-500/10 via-violet-500/5 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                  <Icon.CheckCircle className="h-3.5 w-3.5" />
                </span>
                <p className="text-xs font-medium text-ink-700">After · prioritized actions</p>
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
                    transition={{ delay: 0.1 + idx * 0.1, duration: 0.35 }}
                    className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-3"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                      <Icon.Bolt className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-medium text-ink-900">{item.title}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-2xs font-semibold ring-1 ring-inset ${priorityTone[item.priority]}`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <p className="mt-0.5 text-2xs text-ink-500">{item.type}</p>
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
