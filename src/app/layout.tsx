import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Phone Match | Find a phone that fits you",
    template: "%s | Phone Match",
  },
  description:
    "Compare available brand-new and London-used smartphones against your budget, priorities and everyday needs.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Phone Match — Less Confusion. Better Choices.",
    description:
      "Answer five simple questions and see available smartphones that fit your budget and priorities.",
    siteName: "Phone Match",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phone Match — Less Confusion. Better Choices.",
    description: "See available smartphones that fit your budget and priorities.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG">
      <body>{children}</body>
    </html>
  );
}
