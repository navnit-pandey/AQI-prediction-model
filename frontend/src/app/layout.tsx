import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import ToastContainer from "@/components/ui/ToastContainer";
import Background from "@/components/layout/Background";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "AirQ Predict — AI-Powered Air Quality Forecasting",
  description:
    "Get real-time AQI data and AI-powered 5-day air quality predictions for any city worldwide. Built with machine learning.",
  keywords: ["AQI", "air quality", "prediction", "forecast", "machine learning"],
};

/**
 * Root layout component.
 * Wraps all pages with theme provider, toast provider,
 * animated background, and navigation bar.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            {/* Ambient animated background */}
            <Background />

            {/* Sticky navigation */}
            <Navbar />

            {/* Toast notification layer */}
            <ToastContainer />

            {/* Page content */}
            <main
              style={{
                position: "relative",
                zIndex: 1,
              }}
            >
              {children}
            </main>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
