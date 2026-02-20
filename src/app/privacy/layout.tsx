import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Better Morning",
  description:
    "How Better Morning collects, uses, and protects your data. GDPR rights, Supabase storage, no selling to third parties.",
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
