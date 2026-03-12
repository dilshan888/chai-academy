import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChAI Academy",
  description: "AI Literacy for University Administration",
};

import { ProgressProvider } from "@/lib/ProgressContext";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeContext";
import { CookieConsent } from "@/components/ui/CookieConsent";

// ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <AuthProvider>
          <ThemeProvider defaultTheme="system" storageKey="chai-academy-theme">
            <ProgressProvider>
              {children}
              <CookieConsent />
            </ProgressProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
