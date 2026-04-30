"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { GmailMessage } from "@/hooks/useGmailMessages";

type SearchResult = GmailMessage;

const DEBOUNCE_MS = 220;
const MAX_RESULTS = 8;

export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  // ⌘K / Ctrl+K — focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside → close
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Debounce the query
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch when debounced value changes
  useEffect(() => {
    let cancelled = false;
    const q = debounced;

    if (q.length < 2) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(
      `/api/emails?q=${encodeURIComponent(q)}&limit=${MAX_RESULTS}&offset=0`,
    )
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Search failed (${res.status})`);
        }
        return res.json();
      })
      .then((data: { items?: SearchResult[] }) => {
        if (cancelled) return;
        setResults(Array.isArray(data.items) ? data.items : []);
        setActiveIdx(0);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Search failed.");
        setResults([]);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const showDropdown = open && (query.trim().length > 0 || isLoading);

  const goToInbox = useCallback(
    (q: string) => {
      const cleaned = q.trim();
      if (!cleaned) {
        router.push("/dashboard/inbox");
      } else {
        router.push(`/dashboard/inbox?q=${encodeURIComponent(cleaned)}`);
      }
      setOpen(false);
      inputRef.current?.blur();
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (query) {
        setQuery("");
      } else {
        setOpen(false);
        inputRef.current?.blur();
      }
      return;
    }
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const picked = results[activeIdx];
      if (picked) {
        goToInbox(picked.subject || query);
      } else {
        goToInbox(query);
      }
    }
  };

  const trimmedQuery = query.trim();

  return (
    <div ref={wrapRef} className="relative w-full max-w-md">
      <Icon.Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        ref={inputRef}
        type="search"
        autoComplete="off"
        spellCheck={false}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search emails, tasks, people…"
        className={cn(
          "h-9 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-16 text-sm text-ink-900 placeholder:text-ink-400 transition",
          "focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200/60",
        )}
      />

      {/* Right side: clear button or ⌘K hint */}
      <div className="pointer-events-none absolute right-2 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1">
        {query.length > 0 ? (
          <button
            type="button"
            aria-label="Clear search"
            onMouseDown={(e) => {
              // mousedown so the click outside handler doesn't fire first
              e.preventDefault();
              setQuery("");
              inputRef.current?.focus();
            }}
            className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <svg
              viewBox="0 0 16 16"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        ) : (
          <kbd className="hidden rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10px] font-medium text-ink-500 sm:inline-flex">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[420px] overflow-hidden rounded-xl border border-ink-200 bg-white shadow-elevated"
        >
          <div className="flex items-center justify-between border-b border-ink-100 px-3 py-2">
            <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">
              {isLoading
                ? "Searching…"
                : results.length > 0
                  ? `${results.length} ${results.length === 1 ? "match" : "matches"}`
                  : trimmedQuery.length < 2
                    ? "Type to search"
                    : "No matches"}
            </p>
            {trimmedQuery.length > 0 && !isLoading ? (
              <button
                type="button"
                onClick={() => goToInbox(trimmedQuery)}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-2xs font-medium text-brand-600 hover:bg-brand-50"
              >
                Open all in inbox
                <Icon.ArrowRight className="h-3 w-3" />
              </button>
            ) : null}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {error ? (
              <div className="flex items-start gap-2 px-3 py-4 text-xs text-rose-700">
                <Icon.AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : isLoading ? (
              <SkeletonRows />
            ) : results.length === 0 ? (
              <EmptyHint query={trimmedQuery} />
            ) : (
              <ul className="py-1">
                {results.map((item, idx) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={idx === activeIdx}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => goToInbox(item.subject || trimmedQuery)}
                      className={cn(
                        "flex w-full items-start gap-3 px-3 py-2.5 text-left transition",
                        idx === activeIdx
                          ? "bg-brand-50/70"
                          : "hover:bg-ink-50/70",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-2xs font-semibold",
                          item.action === "ACTION_REQUIRED"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-brand-50 text-brand-600",
                        )}
                      >
                        {initialsFor(item.from)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-semibold text-ink-900">
                            <Highlight text={item.subject || "(no subject)"} q={trimmedQuery} />
                          </p>
                          <span className="shrink-0 text-[10px] text-ink-400">
                            {formatDate(item.date)}
                          </span>
                        </div>
                        <p className="truncate text-2xs text-ink-600">
                          <span className="font-medium text-ink-700">
                            <Highlight text={cleanFrom(item.from)} q={trimmedQuery} />
                          </span>
                          {item.snippet ? (
                            <>
                              <span className="mx-1 text-ink-300">·</span>
                              <span className="text-ink-500">
                                <Highlight text={item.snippet} q={trimmedQuery} />
                              </span>
                            </>
                          ) : null}
                        </p>
                      </div>
                      {item.urgency ? (
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                            item.urgency === "HIGH"
                              ? "bg-rose-50 text-rose-700 ring-rose-200/70"
                              : item.urgency === "MEDIUM"
                                ? "bg-amber-50 text-amber-800 ring-amber-200/70"
                                : "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
                          )}
                        >
                          {item.urgency.charAt(0) + item.urgency.slice(1).toLowerCase()}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-ink-100 bg-surface-muted/50 px-3 py-1.5 text-[10px] text-ink-400">
            <span className="flex items-center gap-2">
              <KeyHint label="↑↓" /> navigate
              <span className="mx-1 h-3 w-px bg-ink-200" />
              <KeyHint label="↵" /> open
            </span>
            <span className="flex items-center gap-1">
              <KeyHint label="esc" /> close
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------- helpers ----------------------------- */

function KeyHint({ label }: { label: string }) {
  return (
    <kbd className="rounded border border-ink-200 bg-white px-1 py-0.5 font-mono text-[10px] text-ink-500 shadow-xs">
      {label}
    </kbd>
  );
}

function SkeletonRows() {
  return (
    <ul className="divide-y divide-ink-100/70 py-1">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex items-center gap-3 px-3 py-2.5">
          <div className="h-7 w-7 shrink-0 rounded-md bg-ink-100 animate-pulse-soft" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-1/2 rounded bg-ink-100 animate-pulse-soft" />
            <div className="h-2 w-2/3 rounded bg-ink-100/70 animate-pulse-soft" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyHint({ query }: { query: string }) {
  if (query.length < 2) {
    return (
      <div className="px-3 py-6 text-center">
        <p className="text-xs text-ink-500">Type at least 2 characters to search.</p>
        <p className="mt-1 text-[10px] text-ink-400">
          Searches across email subject, sender, and snippet.
        </p>
      </div>
    );
  }
  return (
    <div className="px-3 py-6 text-center">
      <p className="text-xs text-ink-700">
        No emails match <span className="font-semibold">&ldquo;{query}&rdquo;</span>.
      </p>
      <p className="mt-1 text-[10px] text-ink-400">
        Try a different keyword, sender, or subject phrase.
      </p>
    </div>
  );
}

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q || q.length < 2) return <>{text}</>;
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${safe})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark
            key={i}
            className="rounded bg-amber-100/80 px-0.5 text-ink-900"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function cleanFrom(from: string) {
  if (!from) return "";
  // Strip <email@x.com> trailers, keep display name
  const name = from.replace(/<[^>]+>/g, "").trim();
  return name || from;
}

function initialsFor(from: string) {
  const cleaned = cleanFrom(from);
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}
