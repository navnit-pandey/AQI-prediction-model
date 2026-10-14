"use client";

import React from "react";

export default function LoadingSpinner({
  message = "Fetching AQI data and preparing forecast",
}: {
  message?: string;
}) {
  return (
    <div
      id="loading-spinner"
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        padding: "60px 0",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: "56px",
          height: "56px",
          border: "3px solid var(--bg-card)",
          borderTopColor: "var(--accent-blue)",
          borderRightColor: "var(--accent-purple)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <div
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.95rem",
          fontWeight: 500,
        }}
      >
        {message}
        <span aria-hidden="true" style={{ animation: "dotPulse 1.4s infinite" }}>
          .
        </span>
        <span
          aria-hidden="true"
          style={{ animation: "dotPulse 1.4s infinite 0.2s" }}
        >
          .
        </span>
        <span
          aria-hidden="true"
          style={{ animation: "dotPulse 1.4s infinite 0.4s" }}
        >
          .
        </span>
      </div>
    </div>
  );
}
