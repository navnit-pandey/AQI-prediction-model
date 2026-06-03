"use client";

import React from "react";
import { AqiCategory } from "@/types";
import { getCategoryColor } from "@/lib/utils";

interface HealthSuggestionsProps {
  aqi: number;
  category: AqiCategory;
  city: string;
}

/* ===== DATA: Health tips organized by AQI category ===== */

interface SuggestionData {
  emoji: string;
  riskLevel: string;
  riskColor: string;
  healthMessage: string;
  safetyTips: { icon: string; title: string; description: string }[];
  actions: { icon: string; title: string; description: string }[];
  whoAtRisk: string[];
}

function getSuggestions(category: AqiCategory): SuggestionData {
  switch (category) {
    case "Good":
      return {
        emoji: "😊",
        riskLevel: "Low Risk",
        riskColor: "#22c55e",
        healthMessage:
          "Air quality is satisfactory. It's a great day to be outdoors!",
        safetyTips: [
          {
            icon: "🏃",
            title: "Outdoor Activities",
            description: "Perfect conditions for jogging, cycling, or any outdoor exercise.",
          },
          {
            icon: "🪟",
            title: "Open Windows",
            description: "Open windows to let fresh air circulate through your home.",
          },
          {
            icon: "👶",
            title: "Safe for Everyone",
            description: "No precautions needed. Safe for children, elderly, and all groups.",
          },
        ],
        actions: [
          {
            icon: "🌱",
            title: "Plant Trees",
            description: "Support local tree-planting drives to maintain good air quality.",
          },
          {
            icon: "🚲",
            title: "Use Eco Transport",
            description: "Continue using bicycles, walking, or public transport to keep AQI low.",
          },
          {
            icon: "📢",
            title: "Spread Awareness",
            description: "Encourage neighbors to adopt green practices to sustain clean air.",
          },
        ],
        whoAtRisk: [],
      };

    case "Moderate":
      return {
        emoji: "😐",
        riskLevel: "Moderate Risk",
        riskColor: "#eab308",
        healthMessage:
          "Air quality is acceptable. Some people may be mildly affected.",
        safetyTips: [
          {
            icon: "⏱️",
            title: "Limit Prolonged Outdoor Exertion",
            description: "Sensitive individuals should reduce extended outdoor workouts.",
          },
          {
            icon: "💊",
            title: "Keep Medications Ready",
            description: "If you have asthma or allergies, carry your inhaler or medications.",
          },
          {
            icon: "🏠",
            title: "Indoor Breaks",
            description: "Take regular breaks indoors, especially during peak traffic hours.",
          },
        ],
        actions: [
          {
            icon: "🚗",
            title: "Reduce Vehicle Use",
            description: "Carpool, use public transit, or work from home to cut emissions.",
          },
          {
            icon: "🔥",
            title: "Avoid Burning Waste",
            description: "Don't burn garbage, leaves, or crop residue in the open.",
          },
          {
            icon: "🏭",
            title: "Report Polluters",
            description: "Report visible industrial emissions to local pollution control boards.",
          },
        ],
        whoAtRisk: ["People with respiratory conditions", "Children under 12"],
      };

    case "Unhealthy (Sensitive)":
      return {
        emoji: "😷",
        riskLevel: "High Risk for Sensitive Groups",
        riskColor: "#f97316",
        healthMessage:
          "Sensitive groups may experience health effects. General public is less likely to be affected.",
        safetyTips: [
          {
            icon: "😷",
            title: "Wear N95 Masks",
            description: "Use N95 or KN95 masks when going outdoors, especially during commute.",
          },
          {
            icon: "🏠",
            title: "Stay Indoors",
            description: "Sensitive individuals should stay indoors and close windows.",
          },
          {
            icon: "💧",
            title: "Stay Hydrated",
            description: "Drink plenty of water to help your body flush out toxins.",
          },
          {
            icon: "🌿",
            title: "Use Air Purifiers",
            description: "Run HEPA air purifiers indoors to maintain clean air inside.",
          },
        ],
        actions: [
          {
            icon: "🚫",
            title: "No Outdoor Exercise",
            description: "Avoid jogging, cycling or playing sports outdoors—switch to gym or yoga indoors.",
          },
          {
            icon: "🚌",
            title: "Switch to Public Transit",
            description: "Reduce private vehicle trips. Each car off the road helps reduce PM2.5.",
          },
          {
            icon: "🌳",
            title: "Support Green Spaces",
            description: "Advocate for urban green corridors and vertical gardens in your area.",
          },
        ],
        whoAtRisk: [
          "People with asthma",
          "People with heart disease",
          "Elderly (65+)",
          "Children",
          "Pregnant women",
        ],
      };

    case "Unhealthy":
      return {
        emoji: "🤢",
        riskLevel: "High Risk for Everyone",
        riskColor: "#ef4444",
        healthMessage:
          "Everyone may begin to experience health effects. Sensitive groups face serious health risks.",
        safetyTips: [
          {
            icon: "🏠",
            title: "Stay Indoors",
            description: "Avoid going outside unless absolutely necessary. Keep all windows shut.",
          },
          {
            icon: "😷",
            title: "Mandatory Masks",
            description: "If going out, always wear N95/KN95 masks. Regular cloth masks won't help.",
          },
          {
            icon: "🧴",
            title: "Protect Eyes & Skin",
            description: "Wear sunglasses and wash face/hands immediately after coming inside.",
          },
          {
            icon: "💊",
            title: "Medical Alert",
            description: "Keep emergency medications ready. Consult a doctor if you feel breathless.",
          },
        ],
        actions: [
          {
            icon: "🚗",
            title: "Avoid Driving",
            description: "Vehicle emissions are a top polluter. Walk short distances or use EVs.",
          },
          {
            icon: "🏭",
            title: "Industrial Accountability",
            description: "Demand factories use scrubbers and follow emission norms strictly.",
          },
          {
            icon: "📱",
            title: "Use AQI Apps",
            description: "Monitor AQI hourly and plan outdoor activities only when levels drop.",
          },
          {
            icon: "🗣️",
            title: "Community Action",
            description: "Organize neighborhood clean air campaigns and petition local government.",
          },
        ],
        whoAtRisk: [
          "Everyone—especially outdoor workers",
          "Children and elderly",
          "People with heart/lung disease",
          "Pregnant women",
        ],
      };

    case "Very Unhealthy":
      return {
        emoji: "🚨",
        riskLevel: "Very High Risk",
        riskColor: "#a855f7",
        healthMessage:
          "Health alert! Everyone is at serious risk. Emergency measures recommended.",
        safetyTips: [
          {
            icon: "🚫",
            title: "Do NOT Go Outside",
            description: "Avoid all outdoor activities. This is an emergency-level situation.",
          },
          {
            icon: "🏥",
            title: "Seek Medical Help",
            description: "If experiencing cough, breathlessness, or chest pain, visit a doctor immediately.",
          },
          {
            icon: "🌡️",
            title: "Seal Your Home",
            description: "Close all windows, doors, and use wet towels to seal gaps. Run air purifiers.",
          },
          {
            icon: "💧",
            title: "Hydrate & Eat Antioxidants",
            description: "Drink warm water, eat vitamin C-rich foods (oranges, amla) to boost immunity.",
          },
        ],
        actions: [
          {
            icon: "🚨",
            title: "Demand Government Action",
            description: "Call for emergency measures: construction bans, odd-even rules, factory shutdowns.",
          },
          {
            icon: "🌱",
            title: "Mass Tree Plantation",
            description: "Organize community drives. One mature tree absorbs 48 lbs of CO₂/year.",
          },
          {
            icon: "⚡",
            title: "Switch to Clean Energy",
            description: "Push for solar panels, EVs, and phasing out of diesel generators.",
          },
        ],
        whoAtRisk: [
          "Entire population",
          "Outdoor workers at extreme risk",
          "Hospitalization risk for vulnerable groups",
        ],
      };

    case "Hazardous":
      return {
        emoji: "☠️",
        riskLevel: "EMERGENCY — Hazardous",
        riskColor: "#991b1b",
        healthMessage:
          "Health emergency! Entire population is seriously affected. Avoid ALL outdoor exposure.",
        safetyTips: [
          {
            icon: "⛔",
            title: "STAY INDOORS",
            description: "Absolute emergency. Do not step outside for any reason unless life-threatening.",
          },
          {
            icon: "🏥",
            title: "Emergency Medical Kit",
            description: "Keep nebulizers, inhalers, oxygen cylinders ready. Call 108 for emergencies.",
          },
          {
            icon: "😷",
            title: "N95 Even Indoors",
            description: "If your home isn't sealed, wear N95 masks even inside. Use wet cloths on vents.",
          },
          {
            icon: "🚨",
            title: "Evacuate If Possible",
            description: "If you can, temporarily relocate to an area with better air quality.",
          },
        ],
        actions: [
          {
            icon: "📢",
            title: "Declare Air Emergency",
            description: "Demand authorities declare a public health emergency and shut down polluters.",
          },
          {
            icon: "🏫",
            title: "Close Schools & Offices",
            description: "Push for school/office closures. No one should be forced outdoors.",
          },
          {
            icon: "🚒",
            title: "Water Spraying",
            description: "Demand municipal water spraying on roads to suppress dust particles.",
          },
          {
            icon: "🌍",
            title: "Long-Term Policy Change",
            description: "Advocate for stricter emission laws, renewable energy mandates, and green cities.",
          },
        ],
        whoAtRisk: [
          "ENTIRE POPULATION at serious risk",
          "Life-threatening for elderly & children",
          "Immediate medical attention for respiratory patients",
        ],
      };

    default:
      return getSuggestions("Moderate");
  }
}

/**
 * Health Suggestions & Actions component.
 * Shows personalized safety tips, actions to reduce AQI,
 * and at-risk groups based on the current AQI category.
 */
export default function HealthSuggestions({ aqi, category, city }: HealthSuggestionsProps) {
  const data = getSuggestions(category);
  const color = getCategoryColor(category);

  return (
    <div
      style={{
        marginBottom: "48px",
        animation: "fadeInUp 0.6s ease 0.45s forwards",
        opacity: 0,
      }}
    >
      <h3
        style={{
          fontSize: "1.3rem",
          fontWeight: 700,
          marginBottom: "20px",
          letterSpacing: "-0.01em",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>🛡️</span> Health Advisory &
        Actions
      </h3>

      {/* ===== Risk Level Banner ===== */}
      <div
        className="glass-card"
        style={{
          borderRadius: "20px",
          padding: "28px 32px",
          marginBottom: "20px",
          borderLeft: `4px solid ${color}`,
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: "3rem" }}>{data.emoji}</div>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: data.riskColor,
              marginBottom: "6px",
            }}
          >
            {data.riskLevel}
          </div>
          <div
            style={{
              fontSize: "1.05rem",
              fontWeight: 500,
              color: "var(--text-primary)",
              lineHeight: 1.6,
            }}
          >
            {data.healthMessage}
          </div>
          <div
            style={{
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              marginTop: "4px",
            }}
          >
            Current AQI in {city}: <strong style={{ color }}>{aqi}</strong>
          </div>
        </div>
      </div>

      {/* ===== Two-column grid: Safety Tips + Actions ===== */}
      <div
        id="suggestions-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Safety Tips */}
        <div
          className="glass-card"
          style={{ borderRadius: "20px", padding: "28px", overflow: "hidden" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(79, 140, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              🛡️
            </div>
            <h4
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              How to Stay Safe
            </h4>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {data.safetyTips.map((tip, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "14px",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  background: "var(--bg-input)",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    fontSize: "1.4rem",
                    flexShrink: 0,
                    lineHeight: 1,
                    marginTop: "2px",
                  }}
                >
                  {tip.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: "4px",
                    }}
                  >
                    {tip.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {tip.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions to Reduce AQI */}
        <div
          className="glass-card"
          style={{ borderRadius: "20px", padding: "28px", overflow: "hidden" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(34, 197, 94, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              🌍
            </div>
            <h4
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Actions to Reduce AQI
            </h4>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {data.actions.map((action, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "14px",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  background: "var(--bg-input)",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    fontSize: "1.4rem",
                    flexShrink: 0,
                    lineHeight: 1,
                    marginTop: "2px",
                  }}
                >
                  {action.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: "4px",
                    }}
                  >
                    {action.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {action.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== At-Risk Groups ===== */}
      {data.whoAtRisk.length > 0 && (
        <div
          className="glass-card"
          style={{
            borderRadius: "20px",
            padding: "24px 28px",
            borderLeft: `4px solid ${data.riskColor}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>⚠️</span>
            <h4
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: data.riskColor,
              }}
            >
              Who Is at Risk?
            </h4>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {data.whoAtRisk.map((group, i) => (
              <span
                key={i}
                style={{
                  padding: "6px 14px",
                  borderRadius: "100px",
                  background: `${data.riskColor}18`,
                  border: `1px solid ${data.riskColor}30`,
                  color: data.riskColor,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                {group}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
