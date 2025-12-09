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

// ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ProgressProvider>
            {children}
          </ProgressProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
