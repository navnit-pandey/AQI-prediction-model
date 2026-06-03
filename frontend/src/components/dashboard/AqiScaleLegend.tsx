"use client";

import React from "react";

/**
 * Visual AQI color scale legend bar.
 * Shows all 6 AQI categories with their ranges as a horizontal gradient bar
 * with labeled sections. Helps users understand what each AQI value means.
 */
export default function AqiScaleLegend() {
  const scales = [
    { label: "Good", range: "0–50", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
    { label: "Moderate", range: "51–100", color: "#eab308", bg: "rgba(234,179,8,0.15)" },
    { label: "Sensitive", range: "101–150", color: "#f97316", bg: "rgba(249,115,22,0.15)" },
    { label: "Unhealthy", range: "151–200", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
    { label: "Very Unhealthy", range: "201–300", color: "#a855f7", bg: "rgba(168,85,247,0.15)" },
    { label: "Hazardous", range: "300+", color: "#991b1b", bg: "rgba(153,27,27,0.15)" },
  ];

  return (
    <div
      style={{
        marginBottom: "48px",
        animation: "fadeInUp 0.6s ease 0.1s forwards",
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
        <span style={{ fontSize: "1.2rem" }}>🌈</span> AQI Scale Reference
      </h3>

      <div
        className="glass-card"
        style={{
          borderRadius: "20px",
          padding: "28px",
          overflow: "hidden",
        }}
      >
        {/* Gradient bar */}
        <div
          style={{
            height: "12px",
            borderRadius: "100px",
            background: `linear-gradient(to right, #22c55e 0%, #eab308 20%, #f97316 40%, #ef4444 60%, #a855f7 80%, #991b1b 100%)`,
            marginBottom: "20px",
            position: "relative",
          }}
        />

        {/* Labels grid */}
        <div
          id="aqi-scale-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "8px",
          }}
        >
          {scales.map((s) => (
            <div
              key={s.label}
              style={{
                textAlign: "center",
                padding: "12px 8px",
                borderRadius: "12px",
                background: s.bg,
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: s.color,
                  margin: "0 auto 8px",
                  boxShadow: `0 0 8px ${s.color}60`,
                }}
              />
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: s.color,
                  marginBottom: "2px",
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: "0.68rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                {s.range}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
