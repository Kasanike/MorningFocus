import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Better Morning",
  description: "Your principles, your protocol, your one thing. Sign in to Better Morning.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
