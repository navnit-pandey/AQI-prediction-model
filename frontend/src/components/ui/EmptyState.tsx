"use client";

import React from "react";

export default function EmptyState({
  onCitySelect,
}: {
  onCitySelect?: (city: string) => void;
}) {
  const suggestions = ["Delhi", "Tokyo", "London", "New York", "Sydney"];

  return (
    <section
      id="empty-state"
      aria-label="City suggestions"
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
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            marginBottom: "8px",
            color: "var(--text-primary)",
          }}
        >
          Search for a city
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.95rem",
            maxWidth: "400px",
            lineHeight: 1.6,
          }}
        >
          Enter a city to get recent AQI trends and a short-term forecast.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "center",
          marginTop: "8px",
        }}
      >
        {suggestions.map((city) => (
          <button
            type="button"
            key={city}
            onClick={() => onCitySelect?.(city)}
            style={{
              padding: "6px 16px",
              borderRadius: "100px",
              background: "var(--bg-card)",
              border: "1px solid var(--glass-border)",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {city}
          </button>
        ))}
      </div>
    </section>
  );
}
