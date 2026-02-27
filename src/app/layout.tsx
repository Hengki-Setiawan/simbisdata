import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { PostHogProvider } from "@/providers/posthog-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SimbisData — Analisis Data Penjualan UMKM dengan AI & ML",
  description:
    "Platform SaaS yang membantu UMKM Indonesia menganalisis data penjualan menggunakan Machine Learning dan AI untuk menghasilkan insight bisnis yang mendalam.",
  keywords: [
    "analisis penjualan",
    "UMKM",
    "machine learning",
    "AI",
    "dashboard",
    "UMKM",
    "data science",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PostHogProvider>
          <AuthProvider>
            <div className="bg-grid" />
            <div className="bg-glow bg-glow-1" />
            <div className="bg-glow bg-glow-2" />
            {children}
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
