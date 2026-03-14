import Link from "next/link";

export const metadata = {
  title: "Terms of Service | SIGNAL",
  description: "SIGNAL terms of service — the rules and guidelines for using our platform.",
};

export default function TermsPage() {
  const h2 = { fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 800 as const, color: "#0A0A2E", marginBottom: 16, marginTop: 48 };
  const p = { fontSize: 15, color: "#475569", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8, marginBottom: 16 };
  const li = { fontSize: 15, color: "#475569", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8, marginBottom: 8 };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px 120px" }}>
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 48 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#0A0A2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⚡</div>
          <span style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0A0A2E", letterSpacing: 1 }}>SIGNAL</span>
        </Link>

        <h1 style={{ fontSize: 40, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0A0A2E", marginBottom: 8, lineHeight: 1.2 }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#94a3b8", marginBottom: 48 }}>
          Last updated: March 14, 2026
        </p>

        <div style={p}>
          Welcome to SIGNAL. By accessing or using influencccer.com (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
        </div>

        <h2 style={h2}>1. Account Registration</h2>
        <div style={p}>
          To use SIGNAL, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating your account.
        </div>

        <h2 style={h2}>2. Acceptable Use</h2>
        <div style={p}>You agree not to:</div>
        <ul>
          <li style={li}>Use the Service for any unlawful purpose or to violate any laws</li>
          <li style={li}>Attempt to gain unauthorized access to any part of the Service</li>
          <li style={li}>Use the Service to send spam, phishing, or other unsolicited messages</li>
          <li style={li}>Upload content that infringes intellectual property rights</li>
          <li style={li}>Interfere with or disrupt the Service or servers</li>
          <li style={li}>Reverse engineer, decompile, or attempt to extract the source code of the Service</li>
          <li style={li}>Use automated systems (bots, scrapers) to access the Service without permission</li>
        </ul>

        <h2 style={h2}>3. Subscriptions & Billing</h2>
        <div style={p}>
          SIGNAL offers a free tier and paid subscription plans (Creator, Pro, Agency). Paid subscriptions are billed monthly through Stripe. You may cancel your subscription at any time, and your access will continue through the end of the current billing period. Refunds are not provided for partial billing periods.
        </div>

        <h2 style={h2}>4. Connected Social Accounts</h2>
        <div style={p}>
          When you connect social media accounts to SIGNAL, you authorize us to access your accounts via their official APIs to provide our services (publishing, analytics, etc.). You can disconnect any account at any time through Settings. We store OAuth tokens securely using encryption and only access your accounts for the features you use.
        </div>

        <h2 style={h2}>5. Content Ownership</h2>
        <div style={p}>
          You retain ownership of all content you create, upload, or publish through SIGNAL. By using the Service, you grant us a limited license to process, store, and transmit your content as necessary to provide the Service. AI-generated content suggestions are provided as-is; you are responsible for reviewing and editing content before publishing.
        </div>

        <h2 style={h2}>6. Limitation of Liability</h2>
        <div style={p}>
          SIGNAL is provided &ldquo;as is&rdquo; without warranties of any kind, either express or implied. We are not liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, data loss, or business interruption, arising out of your use of the Service. Our total liability shall not exceed the amount you paid us in the twelve months preceding the claim.
        </div>

        <h2 style={h2}>7. Service Availability</h2>
        <div style={p}>
          We strive to keep SIGNAL available at all times, but we do not guarantee uninterrupted access. We may perform maintenance, updates, or experience downtime due to factors beyond our control. Scheduled posts may fail if social media platform APIs are unavailable or if your connected account tokens have expired.
        </div>

        <h2 style={h2}>8. Termination</h2>
        <div style={p}>
          We may terminate or suspend your account if you violate these Terms. You may delete your account at any time. Upon termination, your data will be deleted in accordance with our Privacy Policy.
        </div>

        <h2 style={h2}>9. Changes to Terms</h2>
        <div style={p}>
          We may update these Terms from time to time. We will notify you of material changes by updating the date at the top of this page. Continued use of the Service after changes constitutes acceptance of the new Terms.
        </div>

        <h2 style={h2}>10. Contact</h2>
        <div style={p}>
          For questions about these Terms, contact us at{" "}
          <a href="mailto:support@influencccer.com" style={{ color: "#0891b2", textDecoration: "none" }}>support@influencccer.com</a>.
        </div>

        <div style={{ marginTop: 64, paddingTop: 24, borderTop: "1px solid #e2e8f0" }}>
          <Link href="/" style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#94a3b8", textDecoration: "none" }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
