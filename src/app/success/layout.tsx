import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank you — Better Morning",
  description: "Your purchase was successful. You now have full access to Better Morning.",
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
