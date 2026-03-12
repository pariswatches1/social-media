import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIGNAL — Content Intelligence",
  description:
    "Analyze competitors. Generate viral content. AI-powered content intelligence for Instagram, LinkedIn, X, TikTok, Reddit, Facebook, and Snapchat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#06b6d4",
          colorBackground: "#0a0d14",
          colorInputBackground: "#060810",
          colorInputText: "#e2e8f0",
        },
      }}
    >
      <html lang="en">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
