import { SVGProps } from "react";

/**
 * Tiny inline icon set — sized via `className` (default w-4 h-4).
 * Stroke 1.75 keeps things consistent and crisp at all sizes.
 */
type IconProps = SVGProps<SVGSVGElement> & { className?: string };

const baseProps = (props: IconProps) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
  className: props.className ?? "h-4 w-4",
});

export const Icon = {
  Mail: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  ),
  Inbox: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <path d="M3 13l3-7h12l3 7v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6Z" />
      <path d="M3 13h5l1.5 2.5h5L16 13h5" />
    </svg>
  ),
  Sparkles: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  Bolt: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z" />
    </svg>
  ),
  Check: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  ),
  CheckCircle: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5L16 9.5" />
    </svg>
  ),
  ArrowRight: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  ArrowUpRight: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  ),
  Plus: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Filter: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z" />
    </svg>
  ),
  Search: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  Settings: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  ),
  Bell: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  ),
  User: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  Logout: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h12" />
    </svg>
  ),
  Google: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      className={p.className ?? "h-4 w-4"}
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.227c0-.696-.062-1.366-.18-2.005H12v3.795h5.387a4.6 4.6 0 0 1-2 3.024v2.51h3.232c1.892-1.745 2.981-4.32 2.981-7.324Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.965-.896 6.62-2.45l-3.234-2.51c-.898.604-2.05.96-3.386.96-2.605 0-4.81-1.76-5.595-4.123H3.057v2.591A9.998 9.998 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.405 13.877A6.005 6.005 0 0 1 6.09 12c0-.65.114-1.286.314-1.877V7.532H3.057A9.998 9.998 0 0 0 2 12c0 1.614.39 3.14 1.057 4.468l3.348-2.591Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.95c1.47 0 2.787.505 3.823 1.494l2.868-2.868C16.96 2.97 14.696 2 12 2 8.108 2 4.74 4.236 3.057 7.532l3.348 2.59C7.19 7.71 9.395 5.95 12 5.95Z"
      />
    </svg>
  ),
  Logo: (p: IconProps) => (
    <svg
      viewBox="0 0 32 32"
      className={p.className ?? "h-7 w-7"}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nx-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#nx-grad)" />
      <path
        d="M10 22V10l12 12V10"
        fill="none"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Gmail: (p: IconProps) => (
    <svg viewBox="0 0 24 24" className={p.className ?? "h-5 w-5"} aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" fill="#fff" stroke="#e2e8f0" />
      <path d="m3 7 9 6 9-6" fill="none" stroke="#ef4444" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  Slack: (p: IconProps) => (
    <svg viewBox="0 0 24 24" className={p.className ?? "h-5 w-5"} aria-hidden="true">
      <rect x="4" y="10" width="6" height="2.5" rx="1.25" fill="#36C5F0" />
      <rect x="11.5" y="10" width="6" height="2.5" rx="1.25" fill="#2EB67D" />
      <rect x="11.5" y="13.5" width="6" height="2.5" rx="1.25" fill="#ECB22E" />
      <rect x="4" y="13.5" width="6" height="2.5" rx="1.25" fill="#E01E5A" />
    </svg>
  ),
  Whatsapp: (p: IconProps) => (
    <svg viewBox="0 0 24 24" className={p.className ?? "h-5 w-5"} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#25D366" />
      <path
        d="M8 8.5c.5-.6 1-.7 1.4-.7.3 0 .6.1.8.6l.6 1.4c.1.3 0 .6-.2.8l-.5.5c.4 1 1.2 1.8 2.2 2.2l.5-.5c.2-.2.5-.3.8-.2l1.4.6c.5.2.6.5.6.8 0 .4-.1.9-.7 1.4-.5.5-1.4.7-2.2.6-1.7-.2-3.6-1.6-4.5-2.5-.9-.9-2.3-2.8-2.5-4.5-.1-.8.1-1.7.6-2.2Z"
        fill="white"
      />
    </svg>
  ),
  AlertTriangle: (p: IconProps) => (
    <svg {...baseProps(p)}>
      <path d="M12 4 2.5 20h19L12 4Z" />
      <path d="M12 10v5M12 18v.5" />
    </svg>
  ),
};
