"use client";

import React from "react";
import { PredictionResponse, AqiCategory } from "@/types";
import { getAqiCategory, getCategoryColor } from "@/lib/utils";

interface StatsRowProps {
  data: PredictionResponse;
}

/**
 * Stats row showing 3 key metrics: Today's AQI, 11-Day Average, 5-Day Forecast Average.
 * Each card features glassmorphism styling and hover lift effect.
 */
export default function StatsRow({ data }: StatsRowProps) {
  const latestAqi = data.history[data.history.length - 1];
  const avgHistory =
    data.history.reduce((sum, h) => sum + h.aqi, 0) / data.history.length;
  const avgForecast =
    data.predictions.reduce((sum, p) => sum + p.aqi, 0) /
    data.predictions.length;

  const avgHistoryCategory = getAqiCategory(avgHistory);
  const avgForecastCategory = getAqiCategory(avgForecast);

  return (
    <div
      id="stats-row"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        marginBottom: "40px",
      }}
    >
      <StatCard
        label="Today's AQI"
        value={latestAqi.aqi}
        sub={latestAqi.category}
        color={getCategoryColor(latestAqi.category)}
        delay="0.05s"
      />
      <StatCard
        label="11-Day Average"
        value={Math.round(avgHistory)}
        sub={avgHistoryCategory}
        color={getCategoryColor(avgHistoryCategory)}
        delay="0.1s"
      />
      <StatCard
        label="5-Day Forecast Avg"
        value={Math.round(avgForecast)}
        sub={avgForecastCategory}
        color={getCategoryColor(avgForecastCategory)}
        delay="0.15s"
      />
    </div>
  );
}

/** Individual stat card */
function StatCard({
  label,
  value,
  sub,
  color,
  delay,
}: {
  label: string;
  value: number;
  sub: AqiCategory;
  color: string;
  delay: string;
}) {
  return (
    <div
      className="glass-card"
      style={{
        borderRadius: "16px",
        padding: "28px",
        textAlign: "center",
        animation: `fadeInUp 0.5s ease ${delay} forwards`,
        opacity: 0,
      }}
    >
      <div
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-muted)",
          marginBottom: "12px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "2.2rem",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          color: color,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          marginTop: "6px",
          fontWeight: 500,
        }}
      >
        {sub}
      </div>
    </div>
  );
}
