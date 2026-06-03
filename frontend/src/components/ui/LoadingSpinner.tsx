"use client";

import React from "react";

/**
 * Loading spinner component with animated gradient ring.
 * Used during API calls and data fetching.
 */
export default function LoadingSpinner({ message = "Fetching AQI data & training model" }: { message?: string }) {
  return (
    <div
      id="loading-spinner"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        padding: "60px 0",
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* Spinning ring */}
      <div
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
      {/* Loading text with animated dots */}
      <div
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.95rem",
          fontWeight: 500,
        }}
      >
        {message}
        <span style={{ animation: "dotPulse 1.4s infinite" }}>.</span>
        <span style={{ animation: "dotPulse 1.4s infinite 0.2s" }}>.</span>
        <span style={{ animation: "dotPulse 1.4s infinite 0.4s" }}>.</span>
      </div>
    </div>
  );
}
