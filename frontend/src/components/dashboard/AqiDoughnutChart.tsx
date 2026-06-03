"use client";

import React, { useEffect, useRef } from "react";
import { AqiDataPoint } from "@/types";

let Chart: typeof import("chart.js/auto").default | null = null;

interface AqiDoughnutChartProps {
  history: AqiDataPoint[];
  fullHistory: AqiDataPoint[];
}

/**
 * Doughnut chart showing the distribution of AQI categories
 * across historical data. Gives a visual sense of overall air quality.
 */
export default function AqiDoughnutChart({ history, fullHistory }: AqiDoughnutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<InstanceType<typeof import("chart.js/auto").default> | null>(null);

  // Use full 365-day history for distribution
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

      // Count categories
      const counts: Record<string, number> = {
        Good: 0,
        Moderate: 0,
        "Unhealthy (Sensitive)": 0,
        Unhealthy: 0,
        "Very Unhealthy": 0,
        Hazardous: 0,
      };

      chartHistory.forEach((h) => {
        if (counts[h.category] !== undefined) {
          counts[h.category]++;
        }
      });

      // Filter out zero categories
      const filteredLabels = Object.keys(counts).filter((k) => counts[k] > 0);
      const filteredData = filteredLabels.map((k) => counts[k]);

      const colorMap: Record<string, string> = {
        Good: "#22c55e",
        Moderate: "#eab308",
        "Unhealthy (Sensitive)": "#f97316",
        Unhealthy: "#ef4444",
        "Very Unhealthy": "#a855f7",
        Hazardous: "#991b1b",
      };
      const bgColorMap: Record<string, string> = {
        Good: "rgba(34, 197, 94, 0.8)",
        Moderate: "rgba(234, 179, 8, 0.8)",
        "Unhealthy (Sensitive)": "rgba(249, 115, 22, 0.8)",
        Unhealthy: "rgba(239, 68, 68, 0.8)",
        "Very Unhealthy": "rgba(168, 85, 247, 0.8)",
        Hazardous: "rgba(153, 27, 27, 0.8)",
      };

      const colors = filteredLabels.map((l) => bgColorMap[l] || "rgba(79, 140, 255, 0.8)");
      const borderColors = filteredLabels.map((l) => colorMap[l] || "#4f8cff");

      chartRef.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: filteredLabels,
          datasets: [
            {
              data: filteredData,
              backgroundColor: colors,
              borderColor: borderColors,
              borderWidth: 2,
              hoverOffset: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "65%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: textColor,
                font: { family: "'Inter', sans-serif", size: 12, weight: 500 },
                padding: 16,
                usePointStyle: true,
                pointStyleWidth: 10,
              },
            },
            tooltip: {
              backgroundColor: isDark ? "rgba(13, 17, 48, 0.95)" : "rgba(255, 255, 255, 0.95)",
              titleColor: isDark ? "#f0f2ff" : "#0f172a",
              bodyColor: isDark ? "rgba(240, 242, 255, 0.8)" : "rgba(15, 23, 42, 0.7)",
              cornerRadius: 12,
              padding: 14,
              titleFont: { family: "'Inter', sans-serif", size: 13, weight: 700 },
              bodyFont: { family: "'Inter', sans-serif", size: 12 },
              callbacks: {
                label: function (context) {
                  const total = filteredData.reduce((a, b) => a + b, 0);
                  const pct = ((context.parsed / total) * 100).toFixed(1);
                  return ` ${context.label}: ${context.parsed} days (${pct}%)`;
                },
              },
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
        AQI Category Distribution
      </h4>
      <div style={{ position: "relative", height: "280px" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
