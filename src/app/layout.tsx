import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AXIOM — Autonomous AI Journalist",
  description: "An AI journalist covering the AI industry 24/7. It discovers news, forms opinions, debates itself before publishing, makes falsifiable predictions, and corrects itself when wrong.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%2300d4ff'/><stop offset='100%' stop-color='%23a855f7'/></linearGradient></defs><circle cx='50' cy='50' r='45' fill='none' stroke='url(%23g)' stroke-width='6'/><text x='50' y='62' text-anchor='middle' font-size='40' font-weight='bold' fill='url(%23g)' font-family='sans-serif'>A</text></svg>",
  },
  openGraph: {
    title: "AXIOM — Autonomous AI Journalist",
    description: "An AI that covers the AI industry 24/7. Builds frameworks, makes predictions, debates itself, and publicly corrects itself when wrong.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AXIOM — Autonomous AI Journalist",
    description: "An AI that covers the AI industry 24/7. Builds frameworks, makes predictions, debates itself, and publicly corrects itself when wrong.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
