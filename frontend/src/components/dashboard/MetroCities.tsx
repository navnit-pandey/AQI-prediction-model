"use client";

import React, { useEffect, useState } from "react";

interface MetroCity {
  name: string;
  lat: number;
  lon: number;
  aqi: number | null;
  category: string | null;
  temp: number | null;
  humidity: number | null;
}

/** Landmark emoji for each metro city */
const cityIcons: Record<string, string> = {
  Ahmedabad: "🕌",
  Bangalore: "🏛️",
  Chennai: "⛪",
  Hyderabad: "🏰",
  Kolkata: "🌉",
  Mumbai: "🌊",
  "New Delhi": "🏛️",
  Pune: "⛰️",
};

/** Get AQI color based on value */
function getAqiColor(aqi: number): string {
  if (aqi <= 50) return "#22c55e";
  if (aqi <= 100) return "#eab308";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#a855f7";
  return "#991b1b";
}

/**
 * India's Metro Cities section.
 * Displays a grid of cards showing live AQI, temperature, and humidity
 * for 8 major Indian metro cities.
 */
export default function MetroCities({
  onCityClick,
}: {
  onCityClick?: (city: string) => void;
}) {
  const [cities, setCities] = useState<MetroCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchMetroCities() {
      try {
        const res = await fetch("/api/metro-cities");
        const data = await res.json();
        if (data.cities) {
          setCities(data.cities);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchMetroCities();
  }, []);

  if (error) return null;

  return (
    <div
      style={{
        marginBottom: "48px",
        animation: "fadeInUp 0.6s ease 0.2s forwards",
        opacity: 0,
      }}
    >
      {/* Section header */}
      <div style={{ marginBottom: "8px" }}>
        <h3
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>🇮🇳</span> India&apos;s Metro
          Cities
        </h3>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--accent-blue)",
            fontWeight: 500,
            marginTop: "4px",
            marginBottom: "20px",
          }}
        >
          Air Quality Index
        </p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div
          id="metro-cities-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: "160px",
                borderRadius: "20px",
              }}
            />
          ))}
        </div>
      )}

      {/* City cards grid */}
      {!loading && cities.length > 0 && (
        <div
          id="metro-cities-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {cities.map((city, index) => {
            const aqiColor = city.aqi !== null ? getAqiColor(city.aqi) : "#4f8cff";

            return (
              <div
                key={city.name}
                className="glass-card"
                style={{
                  borderRadius: "20px",
                  padding: "24px",
                  cursor: onCityClick ? "pointer" : "default",
                  position: "relative",
                  overflow: "hidden",
                  animation: `fadeInUp 0.5s ease ${0.05 * index}s forwards`,
                  opacity: 0,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onClick={() => onCityClick?.(city.name)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${aqiColor}40`;
                  e.currentTarget.style.boxShadow = `0 8px 32px ${aqiColor}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--glass-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Top row: icon + city name + arrow */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {/* City landmark icon */}
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      {cityIcons[city.name] || "🏙️"}
                    </div>
                    <span
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      {city.name}
                    </span>
                  </div>

                  {/* Arrow icon */}
                  {onCityClick && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--text-muted)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ opacity: 0.5 }}
                    >
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  )}
                </div>

                {/* AQI value */}
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: aqiColor,
                    lineHeight: 1.1,
                    marginBottom: "14px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {city.aqi !== null ? Math.round(city.aqi) : "—"}
                </div>

                {/* Temp & Humidity row */}
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 500,
                        marginBottom: "2px",
                        fontSize: "0.68rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Temp.
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {city.temp !== null ? `${city.temp}°C` : "—"}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 500,
                        marginBottom: "2px",
                        fontSize: "0.68rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Hum.
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {city.humidity !== null ? `${city.humidity}%` : "—"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
