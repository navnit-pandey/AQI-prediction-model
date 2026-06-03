"use client";

import React from "react";
import { AqiDataPoint } from "@/types";
import {
  getCategoryColor,
  getCategoryPillColors,
  formatDateLong,
} from "@/lib/utils";

interface HistoryTableProps {
  history: AqiDataPoint[];
}

/**
 * Historical AQI data table with colored category badges.
 * Displays date, AQI value with colored dot, and category pill.
 */
export default function HistoryTable({ history }: HistoryTableProps) {
  return (
    <div
      style={{
        marginBottom: "48px",
        animation: "fadeInUp 0.6s ease 0.4s forwards",
        opacity: 0,
      }}
    >
      <h3
        style={{
          fontSize: "1.3rem",
          fontWeight: 700,
          marginBottom: "20px",
          letterSpacing: "-0.01em",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>📊</span> Historical Data
      </h3>

      <div
        className="glass-card"
        id="history-table"
        style={{
          borderRadius: "24px",
          overflow: "hidden",
          transform: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "none";
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Date", "AQI", "Category"].map((header) => (
                <th
                  key={header}
                  style={{
                    padding: "16px 24px",
                    textAlign: "left",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--text-muted)",
                    borderBottom: "1px solid var(--glass-border)",
                    background: "rgba(255, 255, 255, 0.02)",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => {
              const color = getCategoryColor(h.category);
              const pillColors = getCategoryPillColors(h.category);

              return (
                <tr
                  key={h.date}
                  style={{
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.03)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td
                    style={{
                      padding: "14px 24px",
                      fontSize: "0.88rem",
                      borderBottom:
                        i < history.length - 1
                          ? "1px solid rgba(255, 255, 255, 0.03)"
                          : "none",
                    }}
                  >
                    {formatDateLong(h.date)}
                  </td>
                  <td
                    style={{
                      padding: "14px 24px",
                      fontSize: "0.88rem",
                      borderBottom:
                        i < history.length - 1
                          ? "1px solid rgba(255, 255, 255, 0.03)"
                          : "none",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: 600,
                      }}
                    >
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: color,
                          flexShrink: 0,
                        }}
                      />
                      {h.aqi}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "14px 24px",
                      fontSize: "0.88rem",
                      borderBottom:
                        i < history.length - 1
                          ? "1px solid rgba(255, 255, 255, 0.03)"
                          : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        padding: "4px 12px",
                        borderRadius: "100px",
                        background: pillColors.bg,
                        color: pillColors.text,
                      }}
                    >
                      {h.category}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
