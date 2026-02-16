import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "@/components/Providers";
import { AuthGuard } from "@/components/AuthGuard";
import "./globals.css";

export const metadata: Metadata = {
  title: "Morning Focus — Start Your Day With Discipline",
  description:
    "A daily companion for men who start their day with clarity, purpose, and stoic wisdom.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Morning Focus",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      style={{ background: "#09090b", color: "#e4e4e7" }}
    >
      <body
        className="font-sans antialiased min-h-screen"
        style={{ background: "#09090b", color: "#e4e4e7" }}
      >
        <Providers>
          <AuthGuard>{children}</AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
