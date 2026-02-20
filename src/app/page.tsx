import Link from "next/link";
import { BookOpen, ListChecks, Target, ArrowRight } from "lucide-react";
import { Instrument_Serif } from "next/font/google";

const serif = Instrument_Serif({
  weight: "400",
  style: "italic",
  subsets: ["latin"],
});

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-6 sm:px-12">
        <span className="font-mono text-sm font-medium uppercase tracking-widest text-white/60">
          Better Morning
        </span>
        <Link
          href="/home"
          className="font-mono text-sm text-white/60 transition-colors hover:text-white/90"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 py-32 text-center sm:py-40">
        {/* Sunrise glow */}
        <div
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(255,120,80,0.15) 0%, transparent 70%)",
          }}
        />
        <p className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-white/40">
          Your morning ritual
        </p>
        <h1
          className={`${serif.className} mt-6 max-w-3xl text-5xl leading-[1.2] text-white/95 sm:text-7xl`}
        >
          The first 60 minutes{" "}
          <span className="italic text-white/60">define your day.</span>
        </h1>
        <p className="mt-8 max-w-md font-sans text-lg leading-relaxed text-white/50">
          A calm space to read your principles, follow your protocol, and name
          the one thing that matters today.
        </p>
        <Link
          href="/home"
          className="mt-12 flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-mono text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90"
        >
          Start your morning
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-4 font-mono text-xs text-white/30">
          Free to try · €4.99 one-time to unlock everything
        </p>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-2xl px-6 py-20 text-center sm:px-12">
        <p
          className={`${serif.className} text-3xl leading-relaxed text-white/70 sm:text-4xl`}
        >
          &ldquo;Most people start their day reacting. Checking phone. Rushing.
          Already behind.&rdquo;
        </p>
        <p className="mt-8 font-sans text-base text-white/40">
          What if the first hour was yours — intentional, calm, owned?
        </p>
      </section>

      {/* Three pillars */}
      <section className="mx-auto max-w-5xl px-6 py-20 sm:px-12">
        <p className="mb-16 text-center font-mono text-xs uppercase tracking-[0.3em] text-white/30">
          Three things. Every morning.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Personal Constitution",
              desc: "Your principles and values. Read them every morning. Become who you decided to be.",
            },
            {
              icon: ListChecks,
              title: "Morning Protocol",
              desc: "Your ritual, step by step. Meditation. Movement. Cold shower. Whatever works for you.",
            },
            {
              icon: Target,
              title: "One Thing",
              desc: "The single action that, if done today, changes everything. One. Not ten.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-10 backdrop-blur-sm"
            >
              <Icon className="h-6 w-6 text-white/40" />
              <h3 className="mt-6 font-mono text-base font-semibold text-white/90">
                {title}
              </h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-white/50">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-2xl px-6 py-20 sm:px-12">
        <p className="mb-12 text-center font-mono text-xs uppercase tracking-[0.3em] text-white/30">
          How it works
        </p>
        <div className="space-y-8">
          {[
            {
              step: "01",
              text: "Set up your constitution — the principles you live by.",
            },
            {
              step: "02",
              text: "Build your morning protocol — your ideal first hour.",
            },
            {
              step: "03",
              text: "Every morning: read, do, name the one thing. Watch your days change.",
            },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-6">
              <span className="mt-1 font-mono text-xs text-white/20">
                {step}
              </span>
              <p className="font-sans text-base leading-relaxed text-white/60">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-6 py-32 text-center sm:px-12">
        <div
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,180,80,0.1) 0%, transparent 70%)",
          }}
        />
        <h2 className={`${serif.className} text-4xl text-white/90 sm:text-5xl`}>
          Own your morning.
        </h2>
        <p className="mt-4 font-sans text-base text-white/40">
          One-time payment. No subscription. Yours forever.
        </p>
        <Link
          href="/home"
          className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-mono text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90"
        >
          Get started — €4.99
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center">
        <p className="font-mono text-xs text-white/20">
          © {new Date().getFullYear()} Better Morning
        </p>
      </footer>
    </div>
  );
}
