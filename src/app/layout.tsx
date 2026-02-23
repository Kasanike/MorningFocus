import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "@/components/Providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
});
import { AuthGuard } from "@/components/AuthGuard";
import { InstallPrompt } from "@/components/InstallPrompt";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://bettermorning.app"),
  title: "Better Morning — Own Your First Hour",
  description:
    "A calm space to read your principles, follow your protocol, and name the one thing that matters today.",
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Better Morning",
  },
  icons: {
    icon: ["/icon-192.png", "/icon-512.png"],
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "Better Morning — Own Your First Hour",
    description:
      "A calm space to read your principles, follow your protocol, and name the one thing that matters today.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Better Morning — Own Your First Hour",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Better Morning — Own Your First Hour",
    description:
      "A calm space to read your principles, follow your protocol, and name the one thing that matters today.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        {/* Optional: use script tag instead of plausible-tracker for page views only:
            <script defer data-domain="your-domain.com" src="https://plausible.io/js/script.js" /> */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#09090b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Better Morning" />
      </head>
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased">
        <Providers>
          <Analytics />
          <AuthGuard>{children}</AuthGuard>
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
