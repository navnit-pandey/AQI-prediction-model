"use client";

import React from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";

/**
 * Top navigation bar with logo and theme toggle.
 * Sticky with glassmorphism blur effect.
 */
export default function Navbar() {
  return (
    <nav
      id="main-navbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(6, 9, 24, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--glass-border)",
        padding: "0 24px",
        transition: "background 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* AQI icon */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--gradient-hero)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            🌍
          </div>
          <span
            style={{
              fontSize: "1.2rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            <span className="gradient-text">AirQ</span>{" "}
            <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
              Predict
            </span>
          </span>
        </div>

        {/* Right side actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
