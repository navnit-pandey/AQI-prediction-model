"use client";

import React, { useState, useEffect } from "react";
import { SavedCity } from "@/types";
import { getCategoryColor, getCategoryPillColors, generateId } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

interface SavedCitiesProps {
  currentCity?: string;
  currentCountry?: string;
  currentAqi?: number;
  currentCategory?: string;
  onCityClick: (city: string) => void;
}

/**
 * Saved cities panel with CRUD operations.
 * Uses localStorage for persistence. Shows a list of bookmarked cities
 * with their last known AQI values. Supports save, remove, and re-search.
 */
export default function SavedCities({
  currentCity,
  currentCountry,
  currentAqi,
  currentCategory,
  onCityClick,
}: SavedCitiesProps) {
  const [cities, setCities] = useState<SavedCity[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("airq-saved-cities");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
    }
    return [];
  });
  const [isOpen, setIsOpen] = useState(false);
  const { addToast } = useToast();

  // Persist to localStorage on changes
  useEffect(() => {
    localStorage.setItem("airq-saved-cities", JSON.stringify(cities));
  }, [cities]);

  /** Check if current city is already saved */
  const isSaved = currentCity
    ? cities.some(
        (c) => c.name.toLowerCase() === currentCity.toLowerCase()
      )
    : false;

  /** Save current city */
  const handleSave = () => {
    if (!currentCity || !currentCountry || !currentAqi || !currentCategory)
      return;

    if (isSaved) {
      // Update existing
      setCities((prev) =>
        prev.map((c) =>
          c.name.toLowerCase() === currentCity.toLowerCase()
            ? {
                ...c,
                lastAqi: currentAqi,
                lastCategory: currentCategory as SavedCity["lastCategory"],
                savedAt: new Date().toISOString(),
              }
            : c
        )
      );
      addToast("success", `Updated ${currentCity} in saved cities`);
    } else {
      // Add new
      const newCity: SavedCity = {
        id: generateId(),
        name: currentCity,
        country: currentCountry,
        lastAqi: currentAqi,
        lastCategory: currentCategory as SavedCity["lastCategory"],
        savedAt: new Date().toISOString(),
      };
      setCities((prev) => [newCity, ...prev]);
      addToast("success", `${currentCity} saved to favorites!`);
    }
  };

  /** Remove a saved city */
  const handleRemove = (id: string, name: string) => {
    setCities((prev) => prev.filter((c) => c.id !== id));
    addToast("info", `${name} removed from saved cities`);
  };

  return (
    <div style={{ marginBottom: "48px" }}>
      {/* Header with toggle and save button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span style={{ fontSize: "1.2rem" }}>⭐</span> Saved Cities
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: "transform 0.3s ease",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              color: "var(--text-muted)",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--text-muted)",
              background: "var(--bg-card)",
              padding: "2px 10px",
              borderRadius: "100px",
              border: "1px solid var(--glass-border)",
            }}
          >
            {cities.length}
          </span>
        </h3>

        {/* Save current city button */}
        {currentCity && (
          <button
            id="save-city-btn"
            onClick={handleSave}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "100px",
              background: isSaved
                ? "rgba(34, 197, 94, 0.12)"
                : "var(--bg-card)",
              border: `1px solid ${
                isSaved ? "rgba(34, 197, 94, 0.3)" : "var(--glass-border)"
              }`,
              color: isSaved ? "#4ade80" : "var(--text-secondary)",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--glass-border-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isSaved
                ? "rgba(34, 197, 94, 0.3)"
                : "var(--glass-border)";
            }}
          >
            {isSaved ? "✓ Saved" : "＋ Save City"}
          </button>
        )}
      </div>

      {/* Cities list (collapsible) */}
      {isOpen && (
        <div
          style={{
            animation: "fadeInUp 0.3s ease",
          }}
        >
          {cities.length === 0 ? (
            <div
              className="glass-card"
              style={{
                borderRadius: "16px",
                padding: "40px",
                textAlign: "center",
                transform: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>📍</div>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                No cities saved yet. Search for a city and click &quot;Save
                City&quot; to bookmark it.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "12px",
              }}
            >
              {cities.map((city) => {
                const color = getCategoryColor(city.lastCategory);
                const pillColors = getCategoryPillColors(city.lastCategory);

                return (
                  <div
                    key={city.id}
                    className="glass-card"
                    style={{
                      borderRadius: "16px",
                      padding: "20px",
                      cursor: "pointer",
                      position: "relative",
                    }}
                    onClick={() => onCityClick(city.name)}
                  >
                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(city.id, city.name);
                      }}
                      aria-label={`Remove ${city.name}`}
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        padding: "4px",
                        opacity: 0.5,
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "0.5";
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>

                    <div
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      {city.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        marginBottom: "12px",
                      }}
                    >
                      {city.country}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: 800,
                          color: color,
                        }}
                      >
                        {city.lastAqi}
                      </span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          padding: "4px 10px",
                          borderRadius: "100px",
                          background: pillColors.bg,
                          color: pillColors.text,
                        }}
                      >
                        {city.lastCategory}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
