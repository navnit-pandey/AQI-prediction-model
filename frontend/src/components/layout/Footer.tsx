"use client";

import React from "react";

/**
 * Footer component with attribution
 */
export default function Footer() {
  return (
    <footer
      id="main-footer"
      style={{
        textAlign: "center",
        padding: "40px 24px",
        color: "var(--text-muted)",
        fontSize: "0.8rem",
        borderTop: "1px solid var(--glass-border)",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <p>
        Data sourced from OpenWeatherMap · Model: Random Forest Regressor ·
        Built with Next.js, Tailwind CSS & Flask
      </p>
      <p style={{ marginTop: "8px", opacity: 0.6 }}>
        © {new Date().getFullYear()} AirQ Predict. All rights reserved.
      </p>
    </footer>
  );
}
