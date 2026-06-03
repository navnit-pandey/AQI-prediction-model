"use client";

import React from "react";

/**
 * Empty state component shown before a search is performed.
 * Displays a welcoming illustration and prompt.
 */
export default function EmptyState() {
  return (
    <div
      id="empty-state"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        padding: "60px 24px",
        textAlign: "center",
        animation: "fadeIn 0.5s ease",
      }}
    >
      {/* Decorative icon */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "24px",
          background: "var(--bg-card)",
          border: "1px solid var(--glass-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "36px",
          backdropFilter: "blur(10px)",
        }}
      >
        🌤️
      </div>
      <div>
        <h3
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            marginBottom: "8px",
            color: "var(--text-primary)",
          }}
        >
          Search for a city
        </h3>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.95rem",
            maxWidth: "400px",
            lineHeight: 1.6,
          }}
        >
          Enter any city name above to get real-time AQI data and AI-powered
          5-day air quality predictions.
        </p>
      </div>

      {/* Suggestion chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "center",
          marginTop: "8px",
        }}
      >
        {["Delhi", "Tokyo", "London", "New York", "Sydney"].map((city) => (
          <span
            key={city}
            style={{
              padding: "6px 16px",
              borderRadius: "100px",
              background: "var(--bg-card)",
              border: "1px solid var(--glass-border)",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            {city}
          </span>
        ))}
      </div>
    </div>
  );
}
