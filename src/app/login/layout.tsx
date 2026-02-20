import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Better Morning",
  description: "Command your morning. Sign in to access your personal constitution and daily battle plan.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
