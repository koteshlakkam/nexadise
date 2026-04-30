import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
});

export const metadata: Metadata = {
	title: "nexadise — Inbox intelligence that takes action",
	description:
		"nexadise turns your inbox chaos into a calm, prioritized list of decisions and actions — automatically.",
	metadataBase: new URL("https://nexadise.com"),
	openGraph: {
		title: "nexadise — Inbox intelligence that takes action",
		description:
			"Turn email chaos into clear, prioritized actions. nexadise reads, decides, and drafts so you can ship.",
		type: "website",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={inter.variable}>
			<body className="bg-white text-ink-900 antialiased">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
