import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | SIGNAL",
  description: "SIGNAL privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#94a3b8", marginBottom: 48 }}>
          Last updated: March 14, 2026
        </p>

        <div style={p}>
          SIGNAL (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates the influencccer.com platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
        </div>

        <h2 style={h2}>Information We Collect</h2>
        <div style={p}>We collect information you provide directly, including:</div>
        <ul>
          <li style={li}>Account information (name, email address) via our authentication provider Clerk</li>
          <li style={li}>Social media account data when you connect platforms (Instagram, TikTok, LinkedIn, X/Twitter, YouTube, Reddit, Pinterest, Facebook, Snapchat)</li>
          <li style={li}>Content you create, schedule, or save on the platform</li>
          <li style={li}>Campaign and outreach data you enter</li>
          <li style={li}>Payment information processed securely through Stripe</li>
        </ul>

        <h2 style={h2}>How We Use Your Information</h2>
        <ul>
          <li style={li}>To provide and maintain the SIGNAL platform</li>
          <li style={li}>To process scheduled posts and publish to connected accounts</li>
          <li style={li}>To generate AI-powered content suggestions and analytics</li>
          <li style={li}>To process payments and manage subscriptions</li>
          <li style={li}>To improve our services and user experience</li>
          <li style={li}>To communicate with you about your account or service updates</li>
        </ul>

        <h2 style={h2}>Data Security</h2>
        <div style={p}>
          We use industry-standard encryption to protect sensitive data, including OAuth tokens for connected social accounts. All data is transmitted over HTTPS. Payment processing is handled entirely by Stripe and we never store your card details.
        </div>

        <h2 style={h2}>Third-Party Services</h2>
        <div style={p}>We integrate with the following third-party services:</div>
        <ul>
          <li style={li}><strong>Clerk</strong> — Authentication and user management</li>
          <li style={li}><strong>Stripe</strong> — Payment processing</li>
          <li style={li}><strong>Anthropic (Claude)</strong> — AI-powered content generation</li>
          <li style={li}><strong>Vercel</strong> — Hosting and deployment</li>
          <li style={li}><strong>Social media platforms</strong> — Connected account APIs (Instagram, TikTok, etc.)</li>
        </ul>

        <h2 style={h2} id="cookies">Cookies</h2>
        <div style={p}>
          We use essential cookies for authentication session management and OAuth state verification. We do not use third-party tracking cookies or advertising cookies. Essential cookies are required for the platform to function and cannot be disabled.
        </div>

        <h2 style={h2} id="gdpr">GDPR Compliance</h2>
        <div style={p}>
          If you are located in the European Economic Area (EEA), you have certain data protection rights under the General Data Protection Regulation (GDPR):
        </div>
        <ul>
          <li style={li}><strong>Right of access</strong> — You can request a copy of your personal data</li>
          <li style={li}><strong>Right to rectification</strong> — You can request correction of inaccurate data</li>
          <li style={li}><strong>Right to erasure</strong> — You can request deletion of your personal data</li>
          <li style={li}><strong>Right to data portability</strong> — You can request your data in a machine-readable format</li>
          <li style={li}><strong>Right to object</strong> — You can object to processing of your personal data</li>
        </ul>
        <div style={p}>
          To exercise any of these rights, please contact us at support@influencccer.com.
        </div>

        <h2 style={h2}>Data Retention</h2>
        <div style={p}>
          We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes.
        </div>

        <h2 style={h2}>Changes to This Policy</h2>
        <div style={p}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by updating the &ldquo;Last updated&rdquo; date at the top of this page. We encourage you to review this page periodically.
        </div>

        <h2 style={h2}>Contact Us</h2>
        <div style={p}>
          If you have questions about this Privacy Policy, please contact us at{" "}
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
