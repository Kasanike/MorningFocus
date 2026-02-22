"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DM_Serif_Display,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
} from "next/font/google";
import "./landing.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-landing-display",
});

const ibmMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-landing-mono",
});

const ibmSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-landing-body",
});

const ArrowIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const ChevronIcon = () => (
  <svg
    className="faq-chevron"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

function LandingPricing() {
  const [interval, setInterval] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = "/login?next=/home";
        return;
      }
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="pricing-section fade-in">
      <div className="pricing-toggle">
        <button
          type="button"
          className={`pricing-toggle-btn ${interval === "monthly" ? "active" : ""}`}
          onClick={() => setInterval("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          className={`pricing-toggle-btn ${interval === "annual" ? "active" : ""}`}
          onClick={() => setInterval("annual")}
        >
          Annual
          <span className="pricing-best-value">Best value</span>
        </button>
      </div>
      <div className="pricing-card">
        <div className="pricing-tag">
          {interval === "annual" ? "Billed yearly" : "Billed monthly"}
        </div>
        <div className="pricing-amount">
          <span className="pricing-currency">€</span>
          <span className="pricing-value">
            {interval === "annual" ? "29.99" : "3.99"}
          </span>
        </div>
        <div className="pricing-period">
          {interval === "annual" ? "per year" : "per month"}
        </div>
        <ul className="pricing-features">
          <li><span className="pf-check">✓</span> Unlimited principles & protocol steps</li>
          <li><span className="pf-check">✓</span> Daily Keystone & Stoic quotes</li>
          <li><span className="pf-check">✓</span> Streak & history</li>
          <li><span className="pf-check">✓</span> Works on all devices</li>
          <li><span className="pf-check">✓</span> Cancel anytime</li>
        </ul>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="pricing-cta"
        >
          {loading ? "Redirecting…" : (interval === "annual" ? "Get Better Morning — €29.99/year" : "Get Better Morning — €3.99/mo")}
        </button>
        <div className="pricing-compare">
          {interval === "annual" && "Two months free vs monthly. "}
          Headspace: €12.99/mo. Calm: €14.99/mo.
        </div>
      </div>
    </div>
  );
}

const FAQ_ITEMS = [
  {
    q: "What exactly do I get?",
    a: "A personal morning dashboard with three tools: your Constitution (principles to read daily), your Protocol (your ideal first-hour routine), and the Keystone (daily focus setter). Pro adds unlimited items, streak, and history.",
  },
  {
    q: "Monthly or annual?",
    a: "Choose monthly (€3.99/mo) or annual (€29.99/year — best value, two months free). Cancel anytime.",
  },
  {
    q: "Can I try it before paying?",
    a: "Yes. Sign up free and explore the full interface. Upgrade to Pro when you're ready for unlimited principles, protocol steps, streak, and history.",
  },
  {
    q: "Is my data private?",
    a: "Your principles, protocols, and daily focus are deeply personal. We don't sell data, run ads, or share anything. Your morning is yours.",
  },
  {
    q: "How is this different from a Notion template?",
    a: "Notion is a blank canvas — you build, tinker, rebuild. Better Morning is purpose-built for one thing: a focused morning ritual. No setup paralysis. Open, do, close. Done.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    const el = document.querySelectorAll(".landing .fade-in");
    el.forEach((node) => observer.observe(node as HTMLElement));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`landing ${dmSerif.variable} ${ibmMono.variable} ${ibmSans.variable}`}
    >
      <div className="page-wrapper">
        <nav>
          <div>
            <div className="nav-date">Your morning ritual</div>
            <div className="nav-title">Better Morning.</div>
          </div>
          <Link href="/home" className="nav-cta">
            Sign in
          </Link>
        </nav>

        <section className="hero">
          <div className="hero-eyebrow">
            The first 60 minutes define your day
          </div>
          <h1>
            Stop waking up
            <br />
            on <em>autopilot.</em>
          </h1>
          <p className="hero-sub">
            A calm space to read your principles, follow your protocol, and name
            the one thing that matters today.
          </p>
          <Link href="/home" className="hero-cta">
            Start your morning
            <ArrowIcon />
          </Link>
          <div className="hero-meta">
            Free to try · From €3.99/mo to unlock everything
          </div>
        </section>

        <div className="proof-strip fade-in">
          <div className="proof-stat">
            <div className="proof-number">1,200+</div>
            <div className="proof-label">Users</div>
          </div>
          <div className="proof-stat">
            <div className="proof-number">4.9</div>
            <div className="proof-label">Rating</div>
          </div>
          <div className="proof-stat">
            <div className="proof-number">86%</div>
            <div className="proof-label">Daily use</div>
          </div>
          <div className="proof-stat">
            <div className="proof-number">€0/mo</div>
            <div className="proof-label">No subscription</div>
          </div>
        </div>

        <div className="quote-card fade-in">
          <div className="quote-text">
            &ldquo;We are more often frightened than hurt; and we suffer more
            from imagination than from reality.&rdquo;
          </div>
          <div className="quote-author">— Seneca</div>
        </div>

        <div className="spacer-sm" />
        <div className="fade-in">
          <div className="section-eyebrow">The problem</div>
          <div className="section-title">
            Most people lose their day
            <br />
            before it <em>starts.</em>
          </div>
        </div>
        <div className="spacer-sm" />

        <div className="glass-card fade-in">
          <div className="problem-item">
            <div className="problem-time">6:47 AM</div>
            <div className="problem-text">
              <strong>Check phone.</strong> Emails. News. Someone else&apos;s
              agenda is now yours.
            </div>
          </div>
          <div className="problem-item">
            <div className="problem-time">7:30 AM</div>
            <div className="problem-text">
              <strong>Already reactive.</strong> Rushing. Scattered. No clarity
              on what matters.
            </div>
          </div>
          <div className="problem-item">
            <div className="problem-time">9:00 PM</div>
            <div className="problem-text">
              <strong>Where did the day go?</strong> Busy all day. Nothing
              meaningful moved.
            </div>
          </div>
        </div>

        <div className="bridge fade-in">
          <div className="bridge-text">What if the first hour was yours?</div>
        </div>

        <div className="fade-in">
          <div className="section-eyebrow">Inside the app</div>
          <div className="section-title">
            Your morning, <em>visualized.</em>
          </div>
        </div>
        <div className="spacer-sm" />

        <div className="mockup-wrapper fade-in">
          <div className="mockup-greeting">
            Good morning, <span>Marcus.</span>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">Personal Constitution</div>
              <div className="card-meta">✎</div>
            </div>
            <div className="card-subtitle">
              The internal code that shapes my decisions.
            </div>
            <div className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">
                  I choose discomfort over regret
                </div>
                <div className="list-item-desc">
                  Growth lives on the other side of what feels hard.
                </div>
              </div>
              <div className="list-item-check done" />
            </div>
            <div className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">
                  I prioritize execution over planning
                </div>
                <div className="list-item-desc">
                  One imperfect step beats hours of perfect plans.
                </div>
              </div>
              <div className="list-item-check done" />
            </div>
            <div className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">
                  I protect my mornings for deep work
                </div>
                <div className="list-item-desc">
                  My best energy goes to my most critical goals.
                </div>
              </div>
              <div className="list-item-check" />
            </div>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">Morning Protocol</div>
              <div className="card-meta">⏱ 68 min total &nbsp;✎</div>
            </div>
            <div className="card-subtitle">The foundation everything else is built on.</div>
            <div className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">Hydrate — cup of water</div>
                <div className="list-item-desc">3 min</div>
              </div>
              <div className="list-item-check done" />
            </div>
            <div className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">Stretch & Light Exercise</div>
                <div className="list-item-desc">10 min</div>
              </div>
              <div className="list-item-check done" />
            </div>
            <div className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">Mindfulness / breathing</div>
                <div className="list-item-desc">10 min</div>
              </div>
              <div className="list-item-check" />
            </div>
          </div>

          <div className="keystone-card">
            <div className="keystone-header">
              <span className="keystone-icon">◎</span>
              <span className="keystone-title">Keystone</span>
            </div>
            <div className="keystone-desc">
              What is the one action that would create the biggest impact on my
              day?
            </div>
            <div className="keystone-input-row">
              <div className="keystone-input">
                Your top priority for today...
              </div>
              <div className="keystone-save">Save</div>
            </div>
          </div>
        </div>

        <div className="spacer" />
        <div className="fade-in">
          <div className="section-eyebrow">Three pillars</div>
          <div className="section-title">
            Simple. Intentional. <em>Daily.</em>
          </div>
        </div>
        <div className="spacer-sm" />

        <div className="feature-card fade-in">
          <div className="feature-num">01 — Constitution</div>
          <div className="feature-title">Your principles. Read daily.</div>
          <div className="feature-desc">
            Write the values you want to live by. Read them every morning until
            they become reflexes. This is who you decided to be — not who you
            drift into being.
          </div>
        </div>
        <div className="feature-card fade-in">
          <div className="feature-num">02 — Protocol</div>
          <div className="feature-title">Your first hour. Structured.</div>
          <div className="feature-desc">
            Meditation. Cold shower. Movement. Journaling. Whatever works for
            you — step by step, timed, consistent. Your ideal morning, on repeat.
          </div>
        </div>
        <div className="feature-card fade-in">
          <div className="feature-num">03 — Keystone</div>
          <div className="feature-title">One action. Maximum impact.</div>
          <div className="feature-desc">
            Not a to-do list. One thing. The thing that, if done today, changes
            everything. Name it every morning. The rest gets quiet.
          </div>
        </div>

        <div className="spacer" />
        <div className="fade-in">
          <div className="section-eyebrow">From real users</div>
          <div className="section-title">
            They changed their <em>mornings.</em>
          </div>
        </div>
        <div className="spacer-sm" />

        <div className="testimonial-card fade-in">
          <div className="testimonial-text">
            &ldquo;I&apos;ve tried Notion templates, habit trackers, journaling
            apps. This is the first thing that actually stuck. Five minutes,
            every morning, done.&rdquo;
          </div>
          <div className="testimonial-author">
            <div className="testimonial-avatar">A</div>
            <div>
              <div className="testimonial-name">Anna K.</div>
              <div className="testimonial-role">Product Manager</div>
            </div>
          </div>
        </div>
        <div className="testimonial-card fade-in">
          <div className="testimonial-text">
            &ldquo;The Keystone feature rewired how I think about priorities. I
            stopped making to-do lists and started moving the needle on what
            actually matters.&rdquo;
          </div>
          <div className="testimonial-author">
            <div className="testimonial-avatar">T</div>
            <div>
              <div className="testimonial-name">Thomas R.</div>
              <div className="testimonial-role">Startup Founder</div>
            </div>
          </div>
        </div>
        <div className="testimonial-card fade-in">
          <div className="testimonial-text">
            &ldquo;€4.99 one-time. No subscription. In a world of $12/month
            apps, this felt almost too good. Best impulse buy this year.&rdquo;
          </div>
          <div className="testimonial-author">
            <div className="testimonial-avatar">M</div>
            <div>
              <div className="testimonial-name">Marie L.</div>
              <div className="testimonial-role">Freelance Designer</div>
            </div>
          </div>
        </div>

        <div className="spacer" />
        <div className="fade-in">
          <div className="section-eyebrow">Pricing</div>
          <div className="section-title">
            Simple plans. <em>Cancel anytime.</em>
          </div>
          <div className="section-sub" style={{ marginBottom: 32 }}>
            Start free. Upgrade when you&apos;re ready for unlimited principles, protocol steps, streak & history.
          </div>
        </div>

        <LandingPricing />

        <div className="spacer" />
        <div className="fade-in">
          <div className="section-title">Questions</div>
        </div>
        <div className="spacer-sm" />

        <div className="glass-card fade-in">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className={`faq-item ${openFaq === i ? "open" : ""}`}
            >
              <button
                type="button"
                className="faq-q"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {item.q}
                <ChevronIcon />
              </button>
              <div className="faq-a">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="final-cta fade-in">
          <h2>
            Tomorrow morning
            <br />
            starts <em>tonight.</em>
          </h2>
          <p>
            Set up your constitution, your protocol, your one thing. Takes 10
            minutes. Tomorrow, you wake up different.
          </p>
          <Link
            href="/home"
            className="hero-cta"
            style={{ opacity: 1, animation: "none" }}
          >
            Start your morning — free
            <ArrowIcon />
          </Link>
        </section>

        <footer>
          <div className="footer-brand">
            © {new Date().getFullYear()} Better Morning
          </div>
          <div className="footer-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href="mailto:hello@bettermorning.app">Contact</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
