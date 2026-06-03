"use client";

import React, { useEffect, useRef } from "react";
import { AqiDataPoint, AqiPrediction } from "@/types";

// Dynamically import Chart.js to avoid SSR issues
let Chart: typeof import("chart.js/auto").default | null = null;

interface AqiChartProps {
  history: AqiDataPoint[];
  predictions: AqiPrediction[];
  fullHistory: AqiDataPoint[];
}

/**
 * Interactive AQI trend chart using Chart.js.
 * Shows full 365 days of historical data with horizontal scrolling,
 * plus predictions as a dashed line.
 * Dynamically loads Chart.js on the client side.
 */
export default function AqiChart({ history, predictions, fullHistory }: AqiChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<InstanceType<typeof import("chart.js/auto").default> | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use full 365-day history for the chart
  const chartHistory = fullHistory.length > 0 ? fullHistory : history;

  useEffect(() => {
    let mounted = true;

    async function initChart() {
      // Dynamic import of Chart.js (client-side only)
      if (!Chart) {
        const module = await import("chart.js/auto");
        Chart = module.default;
      }

      if (!mounted || !canvasRef.current || !Chart) return;

      // Destroy previous chart instance
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      // Prepare labels and data
      const historyLabels = chartHistory.map((h) =>
        new Date(h.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      );
      const predLabels = predictions.map((p) =>
        new Date(p.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      );

      const allLabels = [...historyLabels, ...predLabels];
      const historyData = [
        ...chartHistory.map((h) => h.aqi),
        ...Array(predictions.length).fill(null),
      ];
      const predData = [
        ...Array(chartHistory.length - 1).fill(null),
        chartHistory[chartHistory.length - 1].aqi,
        ...predictions.map((p) => p.aqi),
      ];

      // Create gradients for fill areas
      const gradientHistory = ctx.createLinearGradient(0, 0, 0, 380);
      gradientHistory.addColorStop(0, "rgba(79, 140, 255, 0.25)");
      gradientHistory.addColorStop(1, "rgba(79, 140, 255, 0)");

      const gradientPred = ctx.createLinearGradient(0, 0, 0, 380);
      gradientPred.addColorStop(0, "rgba(168, 85, 247, 0.2)");
      gradientPred.addColorStop(1, "rgba(168, 85, 247, 0)");

      // Detect theme for text colors
      const isDark =
        document.documentElement.getAttribute("data-theme") !== "light";
      const textColor = isDark
        ? "rgba(240, 242, 255, 0.6)"
        : "rgba(15, 23, 42, 0.5)";
      const mutedColor = isDark
        ? "rgba(240, 242, 255, 0.35)"
        : "rgba(15, 23, 42, 0.3)";
      const gridColor = isDark
        ? "rgba(255, 255, 255, 0.04)"
        : "rgba(0, 0, 0, 0.06)";
      const tooltipBg = isDark
        ? "rgba(13, 17, 48, 0.95)"
        : "rgba(255, 255, 255, 0.95)";
      const tooltipTitle = isDark ? "#f0f2ff" : "#0f172a";
      const tooltipBody = isDark
        ? "rgba(240, 242, 255, 0.8)"
        : "rgba(15, 23, 42, 0.7)";
      const pointBorder = isDark ? "#0d1130" : "#ffffff";

      // For 365 days, use smaller points to avoid clutter
      const pointRadius = chartHistory.length > 30 ? 0 : 5;
      const pointHoverRadius = chartHistory.length > 30 ? 6 : 8;

      chartInstanceRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: allLabels,
          datasets: [
            {
              label: "Historical AQI",
              data: historyData,
              borderColor: "#4f8cff",
              backgroundColor: gradientHistory,
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: pointRadius,
              pointBackgroundColor: "#4f8cff",
              pointBorderColor: pointBorder,
              pointBorderWidth: 2,
              pointHoverRadius: pointHoverRadius,
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "#4f8cff",
              pointHoverBorderWidth: 3,
            },
            {
              label: "Predicted AQI",
              data: predData,
              borderColor: "#a855f7",
              backgroundColor: gradientPred,
              fill: true,
              tension: 0.4,
              borderWidth: 2.5,
              borderDash: [8, 4],
              pointRadius: 5,
              pointBackgroundColor: "#a855f7",
              pointBorderColor: pointBorder,
              pointBorderWidth: 2,
              pointHoverRadius: 8,
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "#a855f7",
              pointHoverBorderWidth: 3,
            },
          ],
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: "index",
          },
          plugins: {
            legend: {
              labels: {
                color: textColor,
                font: { family: "'Inter', sans-serif", size: 12, weight: 500 },
                padding: 20,
                usePointStyle: true,
                pointStyleWidth: 10,
              },
            },
            tooltip: {
              backgroundColor: tooltipBg,
              titleColor: tooltipTitle,
              bodyColor: tooltipBody,
              borderColor: gridColor,
              borderWidth: 1,
              cornerRadius: 12,
              padding: 14,
              titleFont: {
                family: "'Inter', sans-serif",
                size: 13,
                weight: 700,
              },
              bodyFont: { family: "'Inter', sans-serif", size: 12 },
              displayColors: true,
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
                color: mutedColor,
                font: { family: "'Inter', sans-serif", size: 11 },
                maxRotation: 45,
                autoSkip: true,
                maxTicksLimit: 30,
              },
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: mutedColor,
                font: { family: "'Inter', sans-serif", size: 11 },
              },
              beginAtZero: true,
            },
          },
          animation: {
            duration: 1500,
            easing: "easeInOutQuart",
          },
        },
      });

      // Scroll to the end (most recent data) after chart renders
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
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartHistory, predictions]);

  // Calculate dynamic width: ~8px per data point, minimum of container width
  const totalPoints = chartHistory.length + predictions.length;
  const chartWidth = Math.max(totalPoints * 8, 1100);

  return (
    <div
      style={{
        marginBottom: "48px",
        animation: "fadeInUp 0.6s ease 0.3s forwards",
        opacity: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "8px",
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
          <span style={{ fontSize: "1.2rem" }}>📈</span> AQI Trend
        </h3>

        {/* Scroll hint badge */}
        {chartHistory.length > 30 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              background: "var(--bg-card)",
              border: "1px solid var(--glass-border)",
              borderRadius: "100px",
              fontSize: "0.72rem",
              fontWeight: 500,
              color: "var(--text-muted)",
              backdropFilter: "blur(10px)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Scroll to explore {chartHistory.length} days
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        )}
      </div>

      <div
        className="glass-card"
        style={{
          borderRadius: "24px",
          padding: "32px",
        }}
      >
        {/* Scrollable chart container */}
        <div
          ref={scrollContainerRef}
          id="aqi-trend-scroll"
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
              height: "380px",
              minWidth: "100%",
            }}
          >
            <canvas
              ref={canvasRef}
              id="aqi-chart"
              width={chartWidth}
              height={380}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
