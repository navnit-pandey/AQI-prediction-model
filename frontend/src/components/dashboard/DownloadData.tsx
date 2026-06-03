"use client";

import React, { useState } from "react";
import { AqiDataPoint, AqiPrediction, ModelMetrics } from "@/types";

interface DownloadDataProps {
  city: string;
  country: string;
  history: AqiDataPoint[];
  fullHistory: AqiDataPoint[];
  predictions: AqiPrediction[];
  modelMetrics: ModelMetrics;
}

type DownloadScope = "history" | "predictions" | "full";
type DownloadFormat = "csv" | "json";

/**
 * Download Data component.
 * Provides users with options to download AQI history, predictions,
 * or the full dataset as CSV or JSON files.
 */
export default function DownloadData({
  city,
  country,
  history,
  fullHistory,
  predictions,
  modelMetrics,
}: DownloadDataProps) {
  // Use full 365-day history for downloads
  const downloadHistory = fullHistory.length > 0 ? fullHistory : history;
  const [activeFormat, setActiveFormat] = useState<DownloadFormat>("csv");
  const [downloading, setDownloading] = useState<DownloadScope | null>(null);

  /** Generate CSV content from history data (full 365 days) */
  function historyToCsv(): string {
    const header = "Date,AQI,Category\n";
    const rows = downloadHistory
      .map((h) => `${h.date},${h.aqi},"${h.category}"`)
      .join("\n");
    return header + rows;
  }

  /** Generate CSV content from prediction data */
  function predictionsToCsv(): string {
    const header = "Day,Date,AQI,Category\n";
    const rows = predictions
      .map((p) => `${p.day},${p.date},${p.aqi},"${p.category}"`)
      .join("\n");
    return header + rows;
  }

  /** Generate full CSV with both history and predictions separated by a header */
  function fullCsv(): string {
    let csv = `AQI Report for ${city} (${country})\n`;
    csv += `Generated on: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\n`;
    csv += `Model R² Score: ${modelMetrics.r2} | MAE: ${modelMetrics.mae}\n\n`;
    csv += "=== Historical Data ===\n";
    csv += historyToCsv();
    csv += "\n\n=== 5-Day Predictions ===\n";
    csv += predictionsToCsv();
    return csv;
  }

  /** Generate JSON content */
  function toJson(scope: DownloadScope): string {
    const base = { city, country, generated: new Date().toISOString() };
    switch (scope) {
      case "history":
        return JSON.stringify({ ...base, history: downloadHistory }, null, 2);
      case "predictions":
        return JSON.stringify({ ...base, predictions }, null, 2);
      case "full":
        return JSON.stringify(
          { ...base, model_metrics: modelMetrics, history: downloadHistory, predictions },
          null,
          2
        );
    }
  }

  /** Trigger file download */
  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /** Handle download click */
  function handleDownload(scope: DownloadScope) {
    setDownloading(scope);

    const citySlug = city.toLowerCase().replace(/\s+/g, "-");
    const dateStr = new Date().toISOString().slice(0, 10);

    setTimeout(() => {
      if (activeFormat === "csv") {
        let content: string;
        switch (scope) {
          case "history":
            content = historyToCsv();
            break;
          case "predictions":
            content = predictionsToCsv();
            break;
          case "full":
            content = fullCsv();
            break;
        }
        downloadFile(content, `aqi-${scope}-${citySlug}-${dateStr}.csv`, "text/csv;charset=utf-8;");
      } else {
        const content = toJson(scope);
        downloadFile(content, `aqi-${scope}-${citySlug}-${dateStr}.json`, "application/json;charset=utf-8;");
      }

      setDownloading(null);
    }, 400); // Brief delay for visual feedback
  }

  const downloadOptions: { scope: DownloadScope; icon: string; label: string; desc: string; count: number }[] = [
    {
      scope: "history",
      icon: "📜",
      label: "Historical Data",
      desc: `${downloadHistory.length} days of AQI records`,
      count: downloadHistory.length,
    },
    {
      scope: "predictions",
      icon: "🔮",
      label: "Predictions",
      desc: "Next 5-day AQI forecast",
      count: predictions.length,
    },
    {
      scope: "full",
      icon: "📦",
      label: "Full Report",
      desc: "History + predictions + metrics",
      count: downloadHistory.length + predictions.length,
    },
  ];

  return (
    <div
      style={{
        marginBottom: "48px",
        animation: "fadeInUp 0.6s ease 0.5s forwards",
        opacity: 0,
      }}
    >
      {/* Section header */}
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
          <span style={{ fontSize: "1.2rem" }}>⬇️</span> Download Data
        </h3>

        {/* Format toggle */}
        <div
          style={{
            display: "flex",
            background: "var(--bg-card)",
            border: "1px solid var(--glass-border)",
            borderRadius: "14px",
            padding: "4px",
            backdropFilter: "blur(10px)",
          }}
        >
          {(["csv", "json"] as DownloadFormat[]).map((fmt) => (
            <button
              key={fmt}
              id={`download-format-${fmt}`}
              onClick={() => setActiveFormat(fmt)}
              style={{
                padding: "8px 20px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontSize: "0.78rem",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                background:
                  activeFormat === fmt
                    ? "linear-gradient(135deg, #4f8cff, #a855f7)"
                    : "transparent",
                color:
                  activeFormat === fmt
                    ? "#fff"
                    : "var(--text-secondary)",
                boxShadow:
                  activeFormat === fmt
                    ? "0 4px 20px rgba(79, 140, 255, 0.3)"
                    : "none",
              }}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Download cards grid */}
      <div
        id="download-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {downloadOptions.map((opt) => {
          const isDownloading = downloading === opt.scope;

          return (
            <button
              key={opt.scope}
              id={`download-${opt.scope}`}
              onClick={() => handleDownload(opt.scope)}
              disabled={isDownloading}
              className="glass-card"
              style={{
                borderRadius: "20px",
                padding: "28px 24px",
                cursor: isDownloading ? "wait" : "pointer",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "14px",
                border: "1px solid var(--glass-border)",
                background: "var(--bg-card)",
                fontFamily: "'Inter', sans-serif",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: isDownloading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isDownloading) {
                  e.currentTarget.style.borderColor = "rgba(79, 140, 255, 0.3)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(79, 140, 255, 0.12)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--glass-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Decorative shimmer on downloading */}
              {isDownloading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, transparent 25%, rgba(79, 140, 255, 0.08) 50%, transparent 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.2s infinite",
                    borderRadius: "20px",
                  }}
                />
              )}

              {/* Icon */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "rgba(79, 140, 255, 0.08)",
                  border: "1px solid rgba(79, 140, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  transition: "transform 0.3s ease",
                }}
              >
                {isDownloading ? (
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "2px solid rgba(79, 140, 255, 0.3)",
                      borderTopColor: "#4f8cff",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                ) : (
                  opt.icon
                )}
              </div>

              {/* Label */}
              <div>
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                  }}
                >
                  {opt.label}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    fontWeight: 400,
                  }}
                >
                  {opt.desc}
                </div>
              </div>

              {/* Download action pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 18px",
                  borderRadius: "100px",
                  background: isDownloading
                    ? "rgba(79, 140, 255, 0.15)"
                    : "linear-gradient(135deg, rgba(79, 140, 255, 0.12), rgba(168, 85, 247, 0.12))",
                  border: "1px solid rgba(79, 140, 255, 0.2)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "#4f8cff",
                  letterSpacing: "0.03em",
                  transition: "all 0.25s ease",
                }}
              >
                {isDownloading ? (
                  "Preparing..."
                ) : (
                  <>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download .{activeFormat.toUpperCase()}
                  </>
                )}
              </div>

              {/* Row count */}
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                {opt.count} records
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
