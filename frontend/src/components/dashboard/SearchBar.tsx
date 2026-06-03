"use client";

import React, { useState, useRef } from "react";

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

/**
 * Search bar component for city input.
 * Features a glassmorphism pill design with search icon and gradient submit button.
 * Supports Enter key to submit and handles validation.
 */
export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed && !isLoading) {
      onSearch(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <section
      id="search-section"
      style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "60px",
      }}
    >
      <div
        className="glass-card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderRadius: "100px",
          padding: "8px 8px 8px 28px",
          width: "100%",
          maxWidth: "560px",
          boxShadow: "var(--shadow-glow-blue)",
          transform: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "none";
        }}
      >
        {/* Search icon */}
        <svg
          style={{
            color: "var(--text-muted)",
            flexShrink: 0,
            width: "20px",
            height: "20px",
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        {/* Input field */}
        <input
          ref={inputRef}
          id="city-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search any city… e.g. Delhi, Tokyo, London"
          autoComplete="off"
          disabled={isLoading}
          style={{
            flex: 1,
            background: "none",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontFamily: "inherit",
            fontSize: "1rem",
            fontWeight: 400,
            minWidth: 0,
          }}
        />

        {/* Submit button */}
        <button
          id="search-btn"
          onClick={handleSubmit}
          disabled={isLoading || !value.trim()}
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 28px",
            background: "var(--gradient-hero)",
            border: "none",
            borderRadius: "100px",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: isLoading || !value.trim() ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            opacity: isLoading || !value.trim() ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading && value.trim()) {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow =
                "0 8px 30px rgba(79, 140, 255, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
          <span>{isLoading ? "Predicting…" : "Predict"}</span>
        </button>
      </div>
    </section>
  );
}
