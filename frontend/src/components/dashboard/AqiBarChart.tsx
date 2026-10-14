"use client";

import React, { useEffect, useRef } from "react";
import { AqiDataPoint, AqiPrediction } from "@/types";

let Chart: typeof import("chart.js/auto").default | null = null;

interface AqiBarChartProps {
  history: AqiDataPoint[];
  predictions: AqiPrediction[];
  fullHistory: AqiDataPoint[];
}

/**
 * Scrollable bar chart showing all 365 days of AQI data + predictions.
 * Each bar is color-coded by AQI severity level.
 * Horizontally scrollable with auto-scroll to the most recent data.
 */
export default function AqiBarChart({ history, predictions, fullHistory }: AqiBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<InstanceType<typeof import("chart.js/auto").default> | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use full history for the bar chart
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
      const gridColor = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.06)";

      // All history + predictions
      const labels = [
        ...chartHistory.map((h) =>
          new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        ),
        ...predictions.map((p) =>
          new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        ),
      ];

      /** Get bar color based on AQI value */
      const getBarColor = (aqi: number, alpha: number = 0.85) => {
        if (aqi <= 50) return `rgba(34, 197, 94, ${alpha})`;
        if (aqi <= 100) return `rgba(234, 179, 8, ${alpha})`;
        if (aqi <= 150) return `rgba(249, 115, 22, ${alpha})`;
        if (aqi <= 200) return `rgba(239, 68, 68, ${alpha})`;
        if (aqi <= 300) return `rgba(168, 85, 247, ${alpha})`;
        return `rgba(153, 27, 27, ${alpha})`;
      };

      const historyData = [
        ...chartHistory.map((h) => h.aqi),
        ...Array(predictions.length).fill(null),
      ];
      const predData = [
        ...Array(chartHistory.length).fill(null),
        ...predictions.map((p) => p.aqi),
      ];

      const historyColors = chartHistory.map((h) => getBarColor(h.aqi));
      const predColors = predictions.map((p) => getBarColor(p.aqi, 0.65));

      chartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Historical AQI",
              data: historyData,
              backgroundColor: historyColors,
              borderColor: historyColors.map((c) => c.replace(/[\d.]+\)$/, "1)")),
              borderWidth: 1,
              borderRadius: 4,
              borderSkipped: false,
              barPercentage: 0.92,
              categoryPercentage: 0.88,
            },
            {
              label: "Predicted AQI",
              data: predData,
              backgroundColor: predColors,
              borderColor: predColors.map((c) => c.replace(/[\d.]+\)$/, "1)")),
              borderWidth: 1,
              borderRadius: 4,
              borderSkipped: false,
              barPercentage: 0.92,
              categoryPercentage: 0.88,
            },
          ],
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: textColor,
                font: { family: "'Inter', sans-serif", size: 12, weight: 500 },
                padding: 20,
                usePointStyle: true,
              },
            },
            tooltip: {
              backgroundColor: isDark ? "rgba(13, 17, 48, 0.95)" : "rgba(255, 255, 255, 0.95)",
              titleColor: isDark ? "#f0f2ff" : "#0f172a",
              bodyColor: isDark ? "rgba(240, 242, 255, 0.8)" : "rgba(15, 23, 42, 0.7)",
              borderColor: gridColor,
              borderWidth: 1,
              cornerRadius: 12,
              padding: 14,
              titleFont: { family: "'Inter', sans-serif", size: 13, weight: 700 },
              bodyFont: { family: "'Inter', sans-serif", size: 12 },
              callbacks: {
                label: function (context) {
                  if (context.parsed.y === null) return "";
                  return ` ${context.dataset.label}: ${context.parsed.y.toFixed(1)}`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                font: { family: "'Inter', sans-serif", size: 10 },
                maxRotation: 45,
                autoSkip: true,
                maxTicksLimit: 40,
              },
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                font: { family: "'Inter', sans-serif", size: 11 },
              },
              beginAtZero: true,
            },
          },
          animation: { duration: 1200, easing: "easeOutQuart" },
        },
      });

      // Auto-scroll to the right (most recent data)
      if (scrollContainerRef.current) {
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft =
              scrollContainerRef.current.scrollWidth;
          }
        }, 100);
      }
    }

    initChart();
    return () => {
      mounted = false;
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [chartHistory, predictions]);

  // Calculate dynamic width: ~14px per data point for thick bars, minimum of container width
  const totalPoints = chartHistory.length + predictions.length;
  const chartWidth = Math.max(totalPoints * 14, 1100);

  // Compute min & max AQI for the stat badges
  const allAqi = chartHistory.map((h) => h.aqi);
  const minAqi = allAqi.length > 0 ? Math.min(...allAqi) : 0;
  const maxAqi = allAqi.length > 0 ? Math.max(...allAqi) : 0;

  const getStatColor = (aqi: number) => {
    if (aqi <= 50) return "#22c55e";
    if (aqi <= 100) return "#eab308";
    if (aqi <= 150) return "#f97316";
    if (aqi <= 200) return "#ef4444";
    if (aqi <= 300) return "#a855f7";
    return "#991b1b";
  };

  return (
    <div style={{ marginBottom: "48px", animation: "fadeInUp 0.6s ease 0.35s forwards", opacity: 0 }}>
      {/* Header with stats */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <h3
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>📊</span> Daily AQI Comparison
        </h3>

        {/* Min / Max badges */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: `${getStatColor(minAqi)}15`,
              border: `1px solid ${getStatColor(minAqi)}30`,
              borderRadius: "14px",
              fontSize: "0.78rem",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: getStatColor(minAqi),
              }}
            >
              {Math.round(minAqi)}
            </span>
            <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
              ↓ Min AQI
            </span>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: `${getStatColor(maxAqi)}15`,
              border: `1px solid ${getStatColor(maxAqi)}30`,
              borderRadius: "14px",
              fontSize: "0.78rem",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: getStatColor(maxAqi),
              }}
            >
              {Math.round(maxAqi)}
            </span>
            <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
              ↑ Max AQI
            </span>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ borderRadius: "24px", padding: "32px" }}>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "12px" }}>
          Bar height and labels represent AQI values; colors are supplemented by min/max badges above.
        </p>
        {/* Scroll hint */}
        {chartHistory.length > 30 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              marginBottom: "16px",
              fontSize: "0.72rem",
              fontWeight: 500,
              color: "var(--text-muted)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Scroll to explore {chartHistory.length} days of data
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        )}

        {/* Scrollable chart container */}
        <div
          ref={scrollContainerRef}
          id="aqi-bar-scroll"
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            position: "relative",
            scrollBehavior: "smooth",
            paddingBottom: "8px",
          }}
        >
          <div
            style={{
              width: `${chartWidth}px`,
              height: "340px",
              minWidth: "100%",
            }}
          >
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="Daily AQI bar chart comparing historical and forecast AQI values"
              width={chartWidth}
              height={340}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
