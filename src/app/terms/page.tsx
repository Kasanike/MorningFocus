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

export default function TermsPage() {
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

        <h1 className="legal-heading">Terms of Service</h1>
        <p className="legal-updated">Last updated: February 2026</p>

        <div className="glass-card">
          <div className="legal-section">
            <h2>1. Agreement to terms</h2>
            <p>
              By accessing or using Better Morning (&ldquo;the Service,&rdquo; &ldquo;the app&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </div>

          <div className="legal-section">
            <h2>2. Description of the service</h2>
            <p>
              Better Morning is a digital tool that helps you structure your morning ritual. It provides:
            </p>
            <ul>
              <li><strong>Personal Constitution:</strong> A space to store and review your personal principles.</li>
              <li><strong>Morning Protocol:</strong> A customizable list of steps (e.g. hydration, exercise, mindfulness) with optional timings.</li>
              <li><strong>Keystone:</strong> A daily focus field to set one priority for the day.</li>
              <li>Additional features such as daily quotes and syncing across devices when you have an account.</li>
            </ul>
            <p>
              The Service is provided &ldquo;as is.&rdquo; We may add, change, or discontinue features with reasonable notice where practicable.
            </p>
          </div>

          <div className="legal-section">
            <h2>3. One-time payment and refunds</h2>
            <p>
              Access to certain features may require a <strong>one-time payment</strong> (e.g. €4.99 or the equivalent in your currency). This is a single, non-recurring charge unless otherwise stated at the time of purchase.
            </p>
            <p>
              <strong>Refund policy:</strong> Given the low value and digital nature of the purchase, we generally do not offer refunds after the one-time payment has been completed. If you believe there has been an error (e.g. duplicate charge or failure to unlock features after payment), contact us at{" "}
              <a href="mailto:hello@bettermorning.app" style={{ color: "var(--accent-warm)", textDecoration: "underline" }}>hello@bettermorning.app</a> within <strong>14 days</strong> of the purchase date. We will review your case and may, at our discretion, issue a refund or restore access. This does not affect your statutory rights in jurisdictions where mandatory refund or withdrawal rights apply (e.g. EU consumers may have a 14-day withdrawal right for distance contracts where applicable).
            </p>
          </div>

          <div className="legal-section">
            <h2>4. Acceptable use</h2>
            <p>You agree to use the Service only for lawful purposes and in a way that does not:</p>
            <ul>
              <li>Violate any applicable law or regulation.</li>
              <li>Infringe the rights of others (including intellectual property or privacy).</li>
              <li>Transmit malware, spam, or any harmful or illegal content.</li>
              <li>Attempt to gain unauthorised access to our systems, other users&apos; accounts, or any third-party systems.</li>
              <li>Overload or disrupt the Service or its infrastructure.</li>
              <li>Use the Service to harass, abuse, or harm others.</li>
            </ul>
            <p>
              We may suspend or terminate your access if we reasonably believe you have breached these terms or have misused the Service.
            </p>
          </div>

          <div className="legal-section">
            <h2>5. Your account and data</h2>
            <p>
              You are responsible for keeping your account credentials secure. You are also responsible for the content you add to the Service (e.g. your constitution, protocol, one thing). You must not upload content that you do not have the right to use or that is illegal. Our use of your personal data is described in our <Link href="/privacy" style={{ color: "var(--accent-warm)", textDecoration: "underline" }}>Privacy Policy</Link>.
            </p>
          </div>

          <div className="legal-section">
            <h2>6. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by applicable law:
            </p>
            <ul>
              <li>The Service is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; We do not guarantee that it will be uninterrupted, error-free, or free of harmful components.</li>
              <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages (including loss of data, profits, or goodwill) arising from your use of or inability to use the Service.</li>
              <li>Our total liability for any claims arising out of or related to these terms or the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim, or, if you have not paid anything, zero.</li>
            </ul>
            <p>
              Nothing in these terms excludes or limits our liability for death or personal injury caused by our negligence, fraud, or any other liability that cannot be excluded or limited under applicable law.
            </p>
          </div>

          <div className="legal-section">
            <h2>7. Governing law and disputes</h2>
            <p>
              These Terms are governed by the laws of the <strong>European Union</strong> and the laws of the member state in which we operate (e.g. Slovakia or another EU country), without regard to conflict-of-law principles. If you are a consumer, you may also benefit from mandatory consumer protection laws in your country of residence.
            </p>
            <p>
              Any dispute arising out of or in connection with these terms or the Service shall first be attempted to be resolved by contacting us. If resolution is not possible, disputes may be brought in the courts of our place of establishment or, for consumers, in the courts of your place of residence where permitted by law.
            </p>
          </div>

          <div className="legal-section">
            <h2>8. Changes to the terms</h2>
            <p>
              We may update these Terms from time to time. We will post the updated version on this page and update the &ldquo;Last updated&rdquo; date. Continued use of the Service after changes constitutes acceptance. For material changes, we may notify you via the app or by email. If you do not agree to the new terms, you must stop using the Service.
            </p>
          </div>

          <div className="legal-section">
            <h2>9. Contact</h2>
            <p>
              For questions about these Terms of Service, contact us at:{" "}
              <a href="mailto:hello@bettermorning.app" style={{ color: "var(--accent-warm)", textDecoration: "underline" }}>hello@bettermorning.app</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
