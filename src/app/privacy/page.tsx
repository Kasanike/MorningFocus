"use client";

import Link from "next/link";
import {
  DM_Serif_Display,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
} from "next/font/google";
import "../landing.css";

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

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export default function PrivacyPage() {
  return (
    <div className={`landing legal-page ${dmSerif.variable} ${ibmMono.variable} ${ibmSans.variable}`}>
      <div className="page-wrapper">
        <nav>
          <div>
            <div className="nav-date">Legal</div>
            <div className="nav-title">Better Morning.</div>
          </div>
          <Link href="/" className="nav-cta">Home</Link>
        </nav>

        <Link href="/" className="legal-back">
          <BackIcon /> Back to home
        </Link>

        <h1 className="legal-heading">Privacy Policy</h1>
        <p className="legal-updated">Last updated: February 2026</p>

        <div className="glass-card">
          <div className="legal-section">
            <h2>1. Who we are</h2>
            <p>
              Better Morning (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;the app&rdquo;) is a morning ritual and focus app. This policy describes how we collect, use, and protect your personal data when you use our service.
            </p>
          </div>

          <div className="legal-section">
            <h2>2. Data we collect</h2>
            <p>We collect only what is necessary to provide the service:</p>
            <ul>
              <li><strong>Account data:</strong> Email address (and, if you sign in via a third-party provider, the identifier they share with us).</li>
              <li><strong>Constitution data:</strong> The principles and subtitles you add to your Personal Constitution.</li>
              <li><strong>Protocol data:</strong> Your morning protocol steps (labels, durations, order).</li>
              <li><strong>Keystone data:</strong> Your daily Keystone entries and related notes.</li>
              <li><strong>Usage data:</strong> We may collect basic, anonymised usage information (e.g. feature usage) to improve the app. We do not track you across other sites or apps.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>3. Where your data is stored</h2>
            <p>
              Your data is stored on infrastructure provided by <strong>Supabase</strong> (supabase.com). Supabase stores data in the European Union (EU) by default when using EU regions. We do not transfer your personal data outside the EU/EEA for processing unless required by law or with appropriate safeguards.
            </p>
          </div>

          <div className="legal-section">
            <h2>4. How we use your data</h2>
            <p>We use your data solely to:</p>
            <ul>
              <li>Provide and maintain the Better Morning service.</li>
              <li>Authenticate you and sync your data across devices.</li>
              <li>Send you essential service-related communications (e.g. account or security notices) if necessary.</li>
              <li>Improve the app (using anonymised or aggregated data where possible).</li>
            </ul>
            <p>We <strong>do not</strong> sell your personal data to third parties. We do not use your data for advertising or for building profiles for third-party marketing.</p>
          </div>

          <div className="legal-section">
            <h2>5. Your rights (including GDPR)</h2>
            <p>If you are in the European Economic Area (EEA), UK, or another jurisdiction that provides similar rights, you have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification:</strong> Ask us to correct inaccurate or incomplete data.</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data (subject to legal obligations to retain certain data).</li>
              <li><strong>Portability:</strong> Receive your data in a structured, commonly used, machine-readable format where technically feasible.</li>
              <li><strong>Restriction and objection:</strong> In certain cases, request restriction of processing or object to processing.</li>
              <li><strong>Withdraw consent:</strong> Where we rely on consent, you may withdraw it at any time.</li>
            </ul>
            <p>To exercise these rights, contact us at the email below. You also have the right to lodge a complaint with a supervisory authority in your country.</p>
          </div>

          <div className="legal-section">
            <h2>6. Cookies and similar technologies</h2>
            <p>
              We use only cookies and similar technologies that are strictly necessary for the service to function (e.g. session and authentication). We do not use advertising or non-essential tracking cookies. By using the app, you consent to these necessary cookies.
            </p>
          </div>

          <div className="legal-section">
            <h2>7. Data retention</h2>
            <p>
              We retain your data for as long as your account is active. If you request account deletion, we will delete or anonymise your personal data within a reasonable period, except where we must retain it for legal, regulatory, or security reasons.
            </p>
          </div>

          <div className="legal-section">
            <h2>8. Security</h2>
            <p>
              We use industry-standard measures (including encryption in transit and at rest where applicable) to protect your data. No system is completely secure; we encourage you to use a strong password and keep your login details confidential.
            </p>
          </div>

          <div className="legal-section">
            <h2>9. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will post the updated version on this page and, for material changes, we will notify you via the app or by email where appropriate. The &ldquo;Last updated&rdquo; date at the top reflects the latest revision.
            </p>
          </div>

          <div className="legal-section">
            <h2>10. Contact</h2>
            <p>
              For any questions about this Privacy Policy or your personal data, contact us at:{" "}
              <a href="mailto:hello@bettermorning.app" style={{ color: "var(--accent-warm)", textDecoration: "underline" }}>hello@bettermorning.app</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
