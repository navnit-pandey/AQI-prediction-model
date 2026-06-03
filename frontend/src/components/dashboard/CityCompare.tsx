"use client";

import React from "react";
import { PredictionResponse } from "@/types";
import { getCategoryColor, getCategoryPillColors } from "@/lib/utils";

interface CityCompareProps {
  currentData: PredictionResponse;
  previousData: PredictionResponse | null;
}

/**
 * Side-by-side city comparison component.
 * Compares AQI stats between the current city and the previous search.
 * Shows visual indicators for which city has better/worse air quality.
 */
export default function CityCompare({ currentData, previousData }: CityCompareProps) {
  if (!previousData) return null;

  // Don't compare a city with itself
  if (
    currentData.city.toLowerCase() === previousData.city.toLowerCase() &&
    currentData.country === previousData.country
  ) {
    return null;
  }

  const currentLatest = currentData.history[currentData.history.length - 1];
  const previousLatest = previousData.history[previousData.history.length - 1];

  const currentAvg =
    currentData.predictions.reduce((s, p) => s + p.aqi, 0) /
    currentData.predictions.length;
  const previousAvg =
    previousData.predictions.reduce((s, p) => s + p.aqi, 0) /
    previousData.predictions.length;

  const currentColor = getCategoryColor(currentLatest.category);
  const previousColor = getCategoryColor(previousLatest.category);
  const currentPill = getCategoryPillColors(currentLatest.category);
  const previousPill = getCategoryPillColors(previousLatest.category);

  /** Comparison arrow and color */
  const getDiffIndicator = (current: number, previous: number) => {
    const diff = current - previous;
    if (Math.abs(diff) < 1) return { text: "Same", color: "var(--text-muted)", arrow: "=" };
    if (diff > 0) return { text: `+${Math.round(diff)}`, color: "#ef4444", arrow: "↑" };
    return { text: `${Math.round(diff)}`, color: "#22c55e", arrow: "↓" };
  };

  const aqiDiff = getDiffIndicator(currentLatest.aqi, previousLatest.aqi);
  const forecastDiff = getDiffIndicator(currentAvg, previousAvg);

  return (
    <div
      style={{
        marginBottom: "48px",
        animation: "fadeInUp 0.6s ease 0.15s forwards",
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
        <span style={{ fontSize: "1.2rem" }}>⚔️</span> City Comparison
      </h3>

      <div
        className="glass-card"
        id="city-compare"
        style={{
          borderRadius: "20px",
          padding: "28px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: "24px",
          alignItems: "center",
        }}
      >
        {/* Current City */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-muted)",
              marginBottom: "8px",
            }}
          >
            Current
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "4px" }}>
            {currentData.city}
          </div>
          <div
            style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "16px" }}
          >
            {currentData.country}
          </div>
          <div
            style={{
              fontSize: "2.6rem",
              fontWeight: 900,
              color: currentColor,
              lineHeight: 1,
              marginBottom: "8px",
            }}
          >
            {currentLatest.aqi}
          </div>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "4px 14px",
              borderRadius: "100px",
              background: currentPill.bg,
              color: currentPill.text,
            }}
          >
            {currentLatest.category}
          </span>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              marginTop: "12px",
            }}
          >
            Forecast Avg:{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {Math.round(currentAvg)}
            </strong>
          </div>
        </div>

        {/* VS Divider */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "1px",
              height: "40px",
              background: "var(--glass-border)",
            }}
          />
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "var(--bg-card)",
              border: "1px solid var(--glass-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              fontWeight: 800,
              color: "var(--text-muted)",
            }}
          >
            VS
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: 800,
                color: aqiDiff.color,
              }}
            >
              {aqiDiff.arrow} {aqiDiff.text}
            </span>
            <span
              style={{
                fontSize: "0.65rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              AQI diff
            </span>
          </div>
          <div
            style={{
              width: "1px",
              height: "40px",
              background: "var(--glass-border)",
            }}
          />
        </div>

        {/* Previous City */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-muted)",
              marginBottom: "8px",
            }}
          >
            Previous
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "4px" }}>
            {previousData.city}
          </div>
          <div
            style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "16px" }}
          >
            {previousData.country}
          </div>
          <div
            style={{
              fontSize: "2.6rem",
              fontWeight: 900,
              color: previousColor,
              lineHeight: 1,
              marginBottom: "8px",
            }}
          >
            {previousLatest.aqi}
          </div>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "4px 14px",
              borderRadius: "100px",
              background: previousPill.bg,
              color: previousPill.text,
            }}
          >
            {previousLatest.category}
          </span>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              marginTop: "12px",
            }}
          >
            Forecast Avg:{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {Math.round(previousAvg)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
