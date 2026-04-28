"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const CHAOS_ITEMS = [
  { id: "c1", label: "New Gmail thread", tone: "bg-rose-500/20 text-rose-200" },
  { id: "c2", label: "Payment due alert", tone: "bg-amber-500/20 text-amber-200" },
  { id: "c3", label: "Support escalation", tone: "bg-rose-500/20 text-rose-200" },
  { id: "c4", label: "Meeting reschedule", tone: "bg-blue-500/20 text-blue-200" },
  { id: "c5", label: "Invoice reminder", tone: "bg-amber-500/20 text-amber-200" },
  { id: "c6", label: "Client follow-up", tone: "bg-rose-500/20 text-rose-200" },
];

const ACTION_ITEMS = [
  { id: "a1", title: "Follow up with client lead", priority: "High" },
  { id: "a2", title: "Process invoice payment", priority: "Medium" },
  { id: "a3", title: "Schedule product demo", priority: "Low" },
];

export function InboxTransformationSection() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 2300),
      setTimeout(() => setStep(2), 4600),
      setTimeout(() => setStep(3), 6200),
    ];

    const resetTimer = setTimeout(() => setStep(0), 9800);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(resetTimer);
    };
  }, [step]);

  const issues = useMemo(() => ["Inbox overload", "Missed follow-ups", "Scattered work"], []);

  return (
    <section className="mt-10 rounded-2xl bg-[#0f172a] p-5 text-left sm:p-7">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Inbox Chaos to Clarity
        </h3>
        <span className="rounded-full bg-[#FF8400]/20 px-3 py-1 text-xs font-semibold text-[#FFD3A1]">
          Live Workflow Preview
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <motion.div
          className="relative min-h-[230px] overflow-hidden rounded-xl bg-[#1e293b] p-4"
          animate={step === 0 ? { x: [0, -2, 2, -1, 0] } : { x: 0 }}
          transition={{ repeat: step === 0 ? Infinity : 0, duration: 0.45 }}
        >
          <p className="text-xs font-medium text-slate-400">Before: Chaotic workspace</p>
          <div className="relative mt-3 h-[210px]">
            {CHAOS_ITEMS.map((item, index) => (
              <motion.div
                key={item.id}
                className={`absolute w-[46%] rounded-lg px-3 py-2 text-xs shadow-sm ${item.tone}`}
                initial={{ opacity: 0, scale: 0.9, x: 60, y: 20 }}
                animate={
                  step < 2
                    ? {
                        opacity: 1,
                        scale: 1,
                        x: index % 2 === 0 ? 0 : "52%",
                        y: 12 + Math.floor(index / 2) * 52,
                        rotate: index % 2 === 0 ? -2 : 2,
                      }
                    : {
                        opacity: 0.4,
                        scale: 0.95,
                        x: 10,
                        y: 18 + index * 28,
                        rotate: 0,
                      }
                }
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                {item.label}
              </motion.div>
            ))}

            {step >= 2 && (
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-300/20 to-green-300/0"
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: "120%", opacity: 1 }}
                transition={{ duration: 0.9 }}
              />
            )}
          </div>

          <div className="mt-4 grid gap-2">
            {issues.map((issue, index) => (
              <motion.div
                key={issue}
                className="rounded-md border border-rose-400/40 bg-rose-500/15 px-2 py-1 text-[11px] font-medium text-rose-200"
                initial={{ opacity: 0, y: 10 }}
                animate={
                  step >= 1 && step < 3
                    ? { opacity: 1, y: [0, 3, 0] }
                    : { opacity: step >= 3 ? 0.45 : 0, y: 0 }
                }
                transition={{
                  delay: index * 0.14,
                  duration: 1.4,
                  repeat: step >= 1 && step < 3 ? Infinity : 0,
                }}
              >
                {issue}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="min-h-[230px] rounded-xl bg-[#1e293b] p-4"
          initial={{ opacity: 0.6, scale: 0.98 }}
          animate={step >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0.72, scale: 0.99 }}
        >
          <p className="text-xs font-medium text-slate-400">After: Structured action dashboard</p>
          <div className="mt-3 space-y-2">
            {ACTION_ITEMS.map((item, index) => (
              <motion.div
                key={item.id}
                className="rounded-lg bg-slate-800/80 p-3"
                initial={{ opacity: 0, y: 14 }}
                animate={
                  step >= 3
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0.45, y: 8, filter: "blur(1px)" }
                }
                transition={{ delay: 0.1 + index * 0.12, duration: 0.35 }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-100">{item.title}</p>
                  <span className="rounded-full bg-[#FF8400]/20 px-2 py-1 text-[10px] font-semibold text-[#FFD3A1]">
                    {item.priority}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.p
            className="mt-4 rounded-md bg-emerald-400/15 px-3 py-2 text-sm font-semibold text-emerald-200"
            initial={{ opacity: 0 }}
            animate={step >= 3 ? { opacity: 1 } : { opacity: 0 }}
          >
            Yes, this is exactly my problem → Now solved
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
