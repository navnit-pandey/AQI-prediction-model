"use client";

import React from "react";
import { AqiPrediction } from "@/types";
import {
  getCategoryColor,
  getCategoryGradient,
  getCategoryPillColors,
  getDayName,
  getShortDate,
} from "@/lib/utils";

interface ForecastGridProps {
  predictions: AqiPrediction[];
}

/**
 * 5-day forecast grid with staggered animation.
 * Each card shows day name, date, predicted AQI, and category badge.
 */
export default function ForecastGrid({ predictions }: ForecastGridProps) {
  return (
    <div style={{ marginBottom: "48px" }}>
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
        <span style={{ fontSize: "1.2rem" }}>🔮</span> 5-Day Forecast
      </h3>

      <div
        id="forecast-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "16px",
        }}
      >
        {predictions.map((p, i) => {
          const color = getCategoryColor(p.category);
          const gradient = getCategoryGradient(p.category);
          const pillColors = getCategoryPillColors(p.category);

          return (
            <div
              key={p.day}
              className="glass-card"
              style={{
                borderRadius: "16px",
                padding: "24px 16px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                animation: `fadeInUp 0.5s ease ${0.05 + i * 0.05}s forwards`,
                opacity: 0,
              }}
            >
              {/* Top gradient bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: gradient,
                  borderRadius: "3px 3px 0 0",
                  opacity: 0.8,
                }}
              />

              {/* Day name */}
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  marginBottom: "4px",
                }}
              >
                {getDayName(p.date)}
              </div>

              {/* Date */}
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  marginBottom: "16px",
                  fontWeight: 400,
                }}
              >
                {getShortDate(p.date)}
              </div>

              {/* AQI value */}
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  marginBottom: "8px",
                  color: color,
                }}
              >
                {p.aqi}
              </div>

              {/* Category badge */}
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: "100px",
                  display: "inline-block",
                  background: pillColors.bg,
                  color: pillColors.text,
                }}
              >
                {p.category}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
