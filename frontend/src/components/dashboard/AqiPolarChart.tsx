"use client";

import React, { useEffect, useRef } from "react";
import { AqiDataPoint } from "@/types";

let Chart: typeof import("chart.js/auto").default | null = null;

interface AqiAreaChartProps {
  history: AqiDataPoint[];
  fullHistory: AqiDataPoint[];
}

/**
 * Polar area chart showing min, max, avg AQI from historical data.
 * Provides a radar-like overview of air quality ranges.
 */
export default function AqiPolarChart({ history, fullHistory }: AqiAreaChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<InstanceType<typeof import("chart.js/auto").default> | null>(null);

  // Use full 365-day history for statistics
  const chartHistory = fullHistory.length > 0 ? fullHistory : history;

  useEffect(() => {
    let mounted = true;

    async function initChart() {
      if (!Chart) {
        const module = await import("chart.js/auto");
        Chart = module.default;
      }
      if (!mounted || !canvasRef.current || !Chart) return;
      if (chartRef.current) chartRef.current.destroy();

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      const isDark = document.documentElement.getAttribute("data-theme") !== "light";
      const textColor = isDark ? "rgba(240, 242, 255, 0.6)" : "rgba(15, 23, 42, 0.5)";

      const aqiValues = chartHistory.map((h) => h.aqi);
      const minAqi = Math.min(...aqiValues);
      const maxAqi = Math.max(...aqiValues);
      const avgAqi = aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length;
      const range = maxAqi - minAqi;
      const latestAqi = aqiValues[aqiValues.length - 1];

      chartRef.current = new Chart(ctx, {
        type: "polarArea",
        data: {
          labels: ["Current", "Average", "Maximum", "Minimum", "Range"],
          datasets: [
            {
              data: [
                Math.round(latestAqi),
                Math.round(avgAqi),
                Math.round(maxAqi),
                Math.round(minAqi),
                Math.round(range),
              ],
              backgroundColor: [
                "rgba(79, 140, 255, 0.6)",
                "rgba(168, 85, 247, 0.6)",
                "rgba(239, 68, 68, 0.6)",
                "rgba(34, 197, 94, 0.6)",
                "rgba(234, 179, 8, 0.6)",
              ],
              borderColor: [
                "#4f8cff",
                "#a855f7",
                "#ef4444",
                "#22c55e",
                "#eab308",
              ],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: textColor,
                font: { family: "'Inter', sans-serif", size: 12, weight: 500 },
                padding: 16,
                usePointStyle: true,
              },
            },
            tooltip: {
              backgroundColor: isDark ? "rgba(13, 17, 48, 0.95)" : "rgba(255, 255, 255, 0.95)",
              titleColor: isDark ? "#f0f2ff" : "#0f172a",
              bodyColor: isDark ? "rgba(240, 242, 255, 0.8)" : "rgba(15, 23, 42, 0.7)",
              cornerRadius: 12,
              padding: 14,
              callbacks: {
                label: (context) => ` ${context.label}: ${context.parsed.r} AQI`,
              },
            },
          },
          scales: {
            r: {
              grid: { color: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)" },
              ticks: { display: false },
            },
          },
          animation: { duration: 1500, easing: "easeInOutQuart" },
        },
      });
    }

    initChart();
    return () => {
      mounted = false;
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [chartHistory]);

  return (
    <div className="glass-card" style={{ borderRadius: "24px", padding: "32px" }}>
      <h4
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          marginBottom: "20px",
          textAlign: "center",
          color: "var(--text-primary)",
        }}
      >
        AQI Statistics Overview
      </h4>
      <div style={{ position: "relative", height: "280px" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
