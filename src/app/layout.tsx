import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "@/components/Providers";
import { AuthGuard } from "@/components/AuthGuard";
import { InstallPrompt } from "@/components/InstallPrompt";
import "./globals.css";

export const metadata: Metadata = {
  title: "Better Morning — Own Your First Hour",
  description:
    "A calm space to read your principles, follow your protocol, and name the one thing that matters today.",
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
  themeColor: "#2a1b3d",
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
      style={{ color: "#e4e4e7" }}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#2a1b3d" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Better Morning" />
      </head>
      <body
        className="font-sans antialiased min-h-screen bg-[#09090b]"
        style={{ color: "#e4e4e7" }}
      >
        <Providers>
          <AuthGuard>{children}</AuthGuard>
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
