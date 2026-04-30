import { Action, Email, Integration } from "./types";

export const API_ROUTES = {
	emails: "/api/emails",
	analysis: "/api/analysis",
	integrations: "/api/integrations",
} as const;

export const EMAIL_SOURCE_LABELS = {
	gmail: "Gmail",
	whatsapp: "WhatsApp",
	slack: "Slack",
} as const;

export const MOCK_EMAILS: Email[] = [
	{
		id: "email-1",
		sender: "Acme Finance",
		subject: "Invoice #INV-1293 due tomorrow",
		snippet: "Please process payment for this month's subscription.",
		receivedAt: "2026-04-21T08:15:00.000Z",
		source: "gmail",
	},
	{
		id: "email-2",
		sender: "Growth Lead - Maya",
		subject: "Interested in nexadise enterprise demo",
		snippet: "Can we schedule a call this week to discuss features?",
		receivedAt: "2026-04-21T09:42:00.000Z",
		source: "slack",
	},
	{
		id: "email-3",
		sender: "Client Team",
		subject: "Need immediate reply on onboarding issue",
		snippet: "Our team is blocked and needs support today.",
		receivedAt: "2026-04-21T11:25:00.000Z",
		source: "whatsapp",
	},
];

export const MOCK_ACTIONS: Action[] = [
	{
		id: "action-1",
		emailId: "email-1",
		type: "invoice",
		title: "Pay Acme invoice",
		description: "Review and approve invoice #INV-1293.",
		status: "pending",
	},
	{
		id: "action-2",
		emailId: "email-2",
		type: "schedule",
		title: "Schedule demo with Maya",
		description: "Share available slots for a 30-minute enterprise call.",
		status: "pending",
	},
	{
		id: "action-3",
		emailId: "email-3",
		type: "reply",
		title: "Send urgent onboarding response",
		description:
			"Acknowledge issue and provide immediate troubleshooting steps.",
		status: "pending",
	},
];

export const MOCK_INTEGRATIONS: Integration[] = [
	{
		id: "int-1",
		name: "Gmail",
		status: "connected",
		icon: "📧",
		lastSyncedAt: "2026-04-22T06:15:00.000Z",
	},
	{
		id: "int-2",
		name: "WhatsApp",
		status: "connected",
		icon: "💬",
		lastSyncedAt: "2026-04-22T06:00:00.000Z",
	},
	{
		id: "int-3",
		name: "Slack",
		status: "disconnected",
		icon: "🟣",
		lastSyncedAt: "2026-04-20T15:45:00.000Z",
	},
];
