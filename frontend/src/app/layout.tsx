import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import ToastContainer from "@/components/ui/ToastContainer";
import Background from "@/components/layout/Background";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const siteUrl = "https://aqi-prediction-model-one.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AirQ Predict — AQI Forecast Dashboard",
  description:
    "Track city AQI trends and view a short-term machine-learning forecast with transparent data-quality indicators.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AirQ Predict — AQI Forecast Dashboard",
    description:
      "Track AQI trends, forecast the next 5 days, and review data-quality notes.",
    url: siteUrl,
    siteName: "AirQ Predict",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AirQ Predict — AQI Forecast Dashboard",
    description:
      "City AQI dashboard with forecast and transparent model/data-quality summaries.",
  },
  keywords: ["AQI", "air quality", "forecast", "pollution", "health guidance"],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AirQ Predict",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  url: siteUrl,
  description:
    "AQI monitoring and forecast dashboard with general informational health guidance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <ThemeProvider>
          <ToastProvider>
            <Background />
            <Navbar />
            <ToastContainer />
            <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
