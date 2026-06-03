"use client";

import React, { useEffect, useRef, useState } from "react";
import { AqiCategory } from "@/types";
import { getCategoryColor } from "@/lib/utils";

interface AqiGaugeProps {
  aqi: number;
  category: AqiCategory;
}

/**
 * Animated circular gaugevisualizing the current AQI value.
 * Features a conic-gradient ring that fills based on AQI percentage,
 * with a smooth counter animation from 0 to the target value.
 */
export default function AqiGauge({ aqi, category }: AqiGaugeProps) {
  const [displayAqi, setDisplayAqi] = useState(0);
  const [gaugePercent, setGaugePercent] = useState(0);
  const animationRef = useRef<number | null>(null);
  const color = getCategoryColor(category);

  // Animate gauge fill and counter on mount / value change
  useEffect(() => {
    const maxAqi = 500;
    const targetPercent = Math.min((aqi / maxAqi) * 100, 100);
    const duration = 1500;
    const startTime = performance.now();

    function step(timestamp: number) {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutCubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      setGaugePercent(eased * targetPercent);
      setDisplayAqi(Math.round(eased * aqi));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      }
    }

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [aqi]);

  return (
    <div
      id="aqi-gauge"
      style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "48px",
        animation: "fadeInUp 0.6s ease 0.2s forwards",
        opacity: 0,
      }}
    >
      <div
        className="glass-card"
        style={{
          borderRadius: "24px",
          padding: "40px 60px",
          textAlign: "center",
        }}
      >
        {/* Gauge ring */}
        <div
          style={{
            position: "relative",
            width: "200px",
            height: "200px",
            margin: "0 auto 24px",
          }}
        >
          <div
            className="gauge-ring"
            style={
              {
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                "--gauge-color": color,
                "--gauge-percent": `${gaugePercent}%`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "none",
              } as React.CSSProperties
            }
          >
            {/* Inner circle */}
            <div
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                background: "var(--bg-secondary)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: "2.8rem",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  color: color,
                }}
              >
                {displayAqi}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                }}
              >
                AQI
              </div>
            </div>
          </div>
        </div>

        {/* Category label */}
        <div
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            marginBottom: "4px",
            color: color,
          }}
        >
          {category}
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            fontWeight: 400,
          }}
        >
          Current Air Quality Index
        </div>
      </div>
    </div>
  );
}
