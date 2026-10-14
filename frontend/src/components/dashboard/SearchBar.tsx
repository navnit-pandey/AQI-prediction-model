"use client";

import React, { useState, useRef } from "react";

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = value.trim();
    if (trimmed && !isLoading) {
      onSearch(trimmed);
    }
  };

  return (
    <section
      id="search-section"
      aria-label="Search AQI by city"
      style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "60px",
      }}
    >
      <form
        className="glass-card"
        onSubmit={handleSubmit}
        aria-busy={isLoading}
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
      >
        <svg
          aria-hidden="true"
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

        <label htmlFor="city-input" className="sr-only">
          City name
        </label>
        <input
          ref={inputRef}
          id="city-input"
          name="city"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search any city… e.g. Delhi, Tokyo, London"
          autoComplete="off"
          disabled={isLoading}
          aria-disabled={isLoading}
          maxLength={80}
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

        <button
          id="search-btn"
          type="submit"
          disabled={isLoading || !value.trim()}
          aria-disabled={isLoading || !value.trim()}
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
        >
          <svg
            aria-hidden="true"
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
      </form>
    </section>
  );
}
