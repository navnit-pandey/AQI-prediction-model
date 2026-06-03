"use client";

import React from "react";
import { AqiDataPoint, AqiPrediction } from "@/types";
import { getCategoryColor, getAqiCategory } from "@/lib/utils";

interface AqiMiniStatsProps {
  history: AqiDataPoint[];
  predictions: AqiPrediction[];
}

/**
 * Mini statistics cards row showing additional computed insights:
 * - Worst day recorded
 * - Best day recorded  
 * - Day-over-day trend (improving/worsening)
 * - Air quality rating out of 10
 */
export default function AqiMiniStats({ history, predictions }: AqiMiniStatsProps) {
  const aqiValues = history.map((h) => h.aqi);
  const maxAqi = Math.max(...aqiValues);
  const minAqi = Math.min(...aqiValues);
  const latestAqi = aqiValues[aqiValues.length - 1];
  const previousAqi = aqiValues.length > 1 ? aqiValues[aqiValues.length - 2] : latestAqi;
  
  // Day-over-day change
  const dayChange = latestAqi - previousAqi;
  const dayChangePercent = previousAqi > 0 ? ((dayChange / previousAqi) * 100) : 0;
  
  // Air quality rating: 10 = perfect (AQI 0), 0 = hazardous (AQI 500)
  const rating = Math.max(0, Math.min(10, 10 - (latestAqi / 50)));
  
  // Forecast trend
  const forecastEnd = predictions[predictions.length - 1]?.aqi || latestAqi;
  const forecastTrend = forecastEnd - latestAqi;

  const stats = [
    {
      icon: "📉",
      label: "Best Day",
      value: Math.round(minAqi),
      sub: getAqiCategory(minAqi),
      color: getCategoryColor(getAqiCategory(minAqi)),
    },
    {
      icon: "📈",
      label: "Worst Day",
      value: Math.round(maxAqi),
      sub: getAqiCategory(maxAqi),
      color: getCategoryColor(getAqiCategory(maxAqi)),
    },
    {
      icon: dayChange <= 0 ? "✅" : "⚠️",
      label: "24h Change",
      value: `${dayChange > 0 ? "+" : ""}${Math.round(dayChange)}`,
      sub: `${dayChangePercent > 0 ? "+" : ""}${dayChangePercent.toFixed(1)}%`,
      color: dayChange <= 0 ? "#22c55e" : "#ef4444",
    },
    {
      icon: "⭐",
      label: "Air Quality Rating",
      value: rating.toFixed(1),
      sub: `out of 10`,
      color: rating >= 7 ? "#22c55e" : rating >= 4 ? "#eab308" : "#ef4444",
    },
    {
      icon: forecastTrend <= 0 ? "🎯" : "🔺",
      label: "5-Day Forecast Trend",
      value: `${forecastTrend > 0 ? "+" : ""}${Math.round(forecastTrend)}`,
      sub: forecastTrend <= 0 ? "Improving" : "Worsening",
      color: forecastTrend <= 0 ? "#22c55e" : "#ef4444",
    },
  ];

  return (
    <div
      style={{
        marginBottom: "48px",
        animation: "fadeInUp 0.6s ease 0.2s forwards",
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
        <span style={{ fontSize: "1.2rem" }}>📋</span> Quick Insights
      </h3>

      <div
        id="mini-stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "12px",
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="glass-card"
            style={{
              borderRadius: "16px",
              padding: "20px 16px",
              textAlign: "center",
              animation: `fadeInUp 0.4s ease ${0.05 + i * 0.05}s forwards`,
              opacity: 0,
            }}
          >
            <div style={{ fontSize: "1.4rem", marginBottom: "10px" }}>
              {stat.icon}
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-muted)",
                marginBottom: "8px",
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                color: stat.color,
                lineHeight: 1,
                marginBottom: "4px",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              {stat.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
