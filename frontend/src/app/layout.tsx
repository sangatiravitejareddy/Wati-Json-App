import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI WATI Flow Builder | Generate WhatsApp Automations with AI",
  description:
    "Create WATI WhatsApp automation flows using AI prompts. Generate, preview, and export JSON files for WATI Automation Builder.",
  keywords: ["WATI", "WhatsApp", "automation", "AI", "flow builder", "chatbot"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
