import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { PostHogProvider } from "@/providers/posthog-provider";
import JsonLd from "@/components/seo/JsonLd";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeProvider } from "@/components/ui/theme-provider";

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
    "data science",
    "Shopee",
    "Tokopedia",
    "e-commerce analytics",
  ],
  openGraph: {
    title: "SimbisData — Analisis Data Penjualan UMKM dengan AI & ML",
    description: "Upload file Excel penjualan → dapatkan analisis ML + AI dalam hitungan detik. Gratis untuk UMKM Indonesia.",
    url: "https://SimbisData.com",
    siteName: "SimbisData",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "SimbisData — Analisis Penjualan AI untuk UMKM",
    description: "15 algoritma ML + AI narasi. Upload Excel, dapatkan insight bisnis dalam 30 detik.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PostHogProvider>
          <AuthProvider>
            <ThemeProvider>
              <ToastProvider>
                <JsonLd />
                <div className="bg-grid" />
                <div className="bg-glow bg-glow-1" />
                <div className="bg-glow bg-glow-2" />
                {children}
              </ToastProvider>
            </ThemeProvider>
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
