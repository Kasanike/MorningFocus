import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Better Morning",
  description:
    "Terms of use for Better Morning: one-time payment, refund policy, acceptable use, limitation of liability, EU governing law.",
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
