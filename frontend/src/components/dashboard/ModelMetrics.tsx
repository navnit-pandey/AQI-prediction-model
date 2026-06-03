"use client";

import React from "react";
import { ModelMetrics as ModelMetricsType } from "@/types";

interface ModelMetricsProps {
  metrics: ModelMetricsType;
}

/**
 * Model performance metrics display.
 * Shows R² score and MAE in glassmorphism cards with descriptive labels.
 */
export default function ModelMetrics({ metrics }: ModelMetricsProps) {
  return (
    <div
      style={{
        marginBottom: "48px",
        animation: "fadeInUp 0.6s ease 0.35s forwards",
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
        <span style={{ fontSize: "1.2rem" }}>🧠</span> Model Performance
      </h3>

      <div
        id="metrics-row"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <MetricCard
          label="R² Score"
          value={`${(metrics.r2 * 100).toFixed(2)}%`}
          description="How well the model fits the data (closer to 100% is better)"
        />
        <MetricCard
          label="Mean Absolute Error"
          value={metrics.mae.toString()}
          description="Average prediction error in AQI units (lower is better)"
        />
      </div>
    </div>
  );
}

/** Individual metric card */
function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div
      className="glass-card"
      style={{
        borderRadius: "16px",
        padding: "24px",
      }}
    >
      <div
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-muted)",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "1.6rem",
          fontWeight: 800,
          color: "var(--text-primary)",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.78rem",
          color: "var(--text-secondary)",
          marginTop: "4px",
        }}
      >
        {description}
      </div>
    </div>
  );
}
