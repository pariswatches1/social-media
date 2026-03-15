import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* Gradient background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(180deg, #00FFEA 0%, #00B4FF 60%, #0033FF 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Branding + back link */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginBottom: 32 }}>
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#0A0A2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
          <span style={{ fontSize: 20, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0A0A2E", letterSpacing: 1 }}>SIGNAL</span>
        </Link>
        <p style={{ marginTop: 8, fontSize: 13, color: "rgba(10,10,46,0.6)", fontFamily: "'DM Sans', sans-serif" }}>Create your account to get started</p>
      </div>

      {/* Clerk sign-up widget */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <SignUp
          fallbackRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorBackground: "rgba(255,255,255,0.2)",
              colorInputBackground: "rgba(255,255,255,0.15)",
              colorInputText: "#0A0A2E",
              colorText: "#0A0A2E",
              colorTextSecondary: "rgba(10,10,46,0.6)",
              colorPrimary: "#0A0A2E",
              colorNeutral: "#0A0A2E",
              borderRadius: "12px",
            },
            elements: {
              card: {
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.25)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              },
              headerTitle: { color: "#0A0A2E" },
              headerSubtitle: { color: "rgba(10,10,46,0.6)" },
              socialButtonsBlockButton: {
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(10,10,46,0.12)",
                color: "#0A0A2E",
              },
              dividerLine: { background: "rgba(10,10,46,0.15)" },
              dividerText: { color: "rgba(10,10,46,0.4)" },
              formFieldLabel: { color: "rgba(10,10,46,0.65)" },
              formFieldInput: {
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(10,10,46,0.12)",
                color: "#0A0A2E",
              },
              formButtonPrimary: {
                background: "#0A0A2E",
                color: "#FFFFFF",
                border: "none",
              },
              footerActionLink: { color: "#0A0A2E", fontWeight: 600 },
              footer: { color: "rgba(10,10,46,0.5)" },
            },
          }}
        />
      </div>

      {/* Back to home */}
      <Link href="/" style={{ position: "relative", zIndex: 1, marginTop: 24, fontSize: 13, color: "rgba(10,10,46,0.6)", fontFamily: "'DM Mono', monospace", textDecoration: "none" }}>
        ← Back to home
      </Link>
    </div>
  );
}
