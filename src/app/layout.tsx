import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import JsonLd from "@/components/seo/JsonLd";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeProvider } from "@/components/ui/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
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
  icons: {
    icon: [
      { url: "/logo-icon.svg", type: "image/svg+xml" },
      { url: "/logo-icon.png", type: "image/png" },
    ],
    shortcut: "/logo-icon.svg",
    apple: "/logo-icon.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <JsonLd />
              {children}
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
