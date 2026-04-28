"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import type { GmailFilters } from "@/hooks/useGmailMessages";

type DayKey = "all" | "today" | "yesterday" | "week" | "month";

const DAYS: Array<{ value: DayKey; label: string }> = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "Last 30 days" },
];

const URGENCIES: Array<{ value: GmailFilters["urgency"] | null; label: string; tone: string }> = [
  { value: null, label: "Any urgency", tone: "bg-ink-100 text-ink-700 ring-ink-200" },
  { value: "HIGH", label: "High", tone: "bg-rose-50 text-rose-700 ring-rose-200/70" },
  { value: "MEDIUM", label: "Medium", tone: "bg-amber-50 text-amber-800 ring-amber-200/70" },
  { value: "LOW", label: "Low", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200/70" },
];

const ACTION_TYPES: Array<{ value: GmailFilters["actionType"] | null; label: string }> = [
  { value: null, label: "Any type" },
  { value: "REPLY", label: "Reply" },
  { value: "REVIEW", label: "Review" },
  { value: "APPROVAL", label: "Approval" },
  { value: "MEETING", label: "Meeting" },
];

export function dayRangeFor(key: DayKey): { since: string | null; until: string | null } {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (key) {
    case "today": {
      const tomorrow = new Date(startOfToday);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { since: startOfToday.toISOString(), until: tomorrow.toISOString() };
    }
    case "yesterday": {
      const yesterday = new Date(startOfToday);
      yesterday.setDate(yesterday.getDate() - 1);
      return { since: yesterday.toISOString(), until: startOfToday.toISOString() };
    }
    case "week": {
      const sevenAgo = new Date(startOfToday);
      sevenAgo.setDate(sevenAgo.getDate() - 6);
      return { since: sevenAgo.toISOString(), until: null };
    }
    case "month": {
      const thirtyAgo = new Date(startOfToday);
      thirtyAgo.setDate(thirtyAgo.getDate() - 29);
      return { since: thirtyAgo.toISOString(), until: null };
    }
    case "all":
    default:
      return { since: null, until: null };
  }
}

export type FilterState = {
  day: DayKey;
  urgency: GmailFilters["urgency"] | null;
  actionType: GmailFilters["actionType"] | null;
  q: string;
};

export const INITIAL_FILTERS: FilterState = {
  day: "all",
  urgency: null,
  actionType: null,
  q: "",
};

interface GmailFiltersBarProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
  total?: number | null;
  className?: string;
}

export function GmailFiltersBar({ value, onChange, total, className }: GmailFiltersBarProps) {
  // Debounce search input — don't refetch on every keystroke.
  const [localQ, setLocalQ] = useState(value.q);
  useEffect(() => setLocalQ(value.q), [value.q]);
  useEffect(() => {
    if (localQ === value.q) return;
    const id = setTimeout(() => onChange({ ...value, q: localQ }), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQ]);

  const isFiltered =
    value.day !== "all" ||
    value.urgency !== null ||
    value.actionType !== null ||
    value.q.trim().length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Icon.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Search subject, sender, or snippet…"
            className="h-10 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200/60"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          {typeof total === "number" ? (
            <span className="text-2xs text-ink-500">
              {total.toLocaleString()} message{total === 1 ? "" : "s"}
            </span>
          ) : null}
          {isFiltered ? (
            <button
              type="button"
              onClick={() => onChange({ ...INITIAL_FILTERS })}
              className="inline-flex items-center gap-1 text-2xs font-medium text-brand-600 hover:text-brand-700"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Day pills */}
      <FilterRow label="Date">
        {DAYS.map((d) => {
          const selected = value.day === d.value;
          return (
            <FilterPill
              key={d.value}
              selected={selected}
              onClick={() => onChange({ ...value, day: d.value })}
            >
              {d.label}
            </FilterPill>
          );
        })}
      </FilterRow>

      {/* Urgency */}
      <FilterRow label="Urgency">
        {URGENCIES.map((u) => {
          const selected = (value.urgency ?? null) === (u.value ?? null);
          return (
            <FilterPill
              key={u.label}
              selected={selected}
              onClick={() => onChange({ ...value, urgency: u.value ?? null })}
            >
              {u.label}
            </FilterPill>
          );
        })}
      </FilterRow>

      {/* Action type */}
      <FilterRow label="Action">
        {ACTION_TYPES.map((a) => {
          const selected = (value.actionType ?? null) === (a.value ?? null);
          return (
            <FilterPill
              key={a.label}
              selected={selected}
              onClick={() => onChange({ ...value, actionType: a.value ?? null })}
            >
              {a.label}
            </FilterPill>
          );
        })}
      </FilterRow>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      <span className="shrink-0 text-2xs font-semibold uppercase tracking-wider text-ink-400">
        {label}
      </span>
      <div className="flex shrink-0 items-center gap-1.5">{children}</div>
    </div>
  );
}

function FilterPill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-150",
        selected
          ? "bg-ink-900 text-white shadow-soft"
          : "bg-white text-ink-600 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 hover:text-ink-900",
      )}
    >
      {children}
    </button>
  );
}

/** Convert FilterState into the API-shaped GmailFilters. */
export function toApiFilters(state: FilterState): GmailFilters {
  const { since, until } = dayRangeFor(state.day);
  return {
    since,
    until,
    urgency: state.urgency,
    actionType: state.actionType,
    q: state.q,
  };
}
