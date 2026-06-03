import { AqiCategory } from "@/types";

/* ===== AQI CATEGORY HELPERS ===== */

/** Get AQI category from numeric value */
export function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy (Sensitive)";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

/** Get the color associated with an AQI category */
export function getCategoryColor(category: AqiCategory): string {
  const colors: Record<AqiCategory, string> = {
    Good: "#22c55e",
    Moderate: "#eab308",
    "Unhealthy (Sensitive)": "#f97316",
    Unhealthy: "#ef4444",
    "Very Unhealthy": "#a855f7",
    Hazardous: "#991b1b",
  };
  return colors[category] || "#4f8cff";
}

/** Get the gradient associated with an AQI category */
export function getCategoryGradient(category: AqiCategory): string {
  const gradients: Record<AqiCategory, string> = {
    Good: "linear-gradient(135deg, #22c55e, #10b981)",
    Moderate: "linear-gradient(135deg, #eab308, #f59e0b)",
    "Unhealthy (Sensitive)": "linear-gradient(135deg, #f97316, #fb923c)",
    Unhealthy: "linear-gradient(135deg, #ef4444, #f87171)",
    "Very Unhealthy": "linear-gradient(135deg, #a855f7, #c084fc)",
    Hazardous: "linear-gradient(135deg, #7f1d1d, #991b1b)",
  };
  return gradients[category] || "linear-gradient(135deg, #4f8cff, #60a5fa)";
}

/** Get pill/badge colors for an AQI category */
export function getCategoryPillColors(category: AqiCategory): {
  bg: string;
  text: string;
} {
  const pills: Record<AqiCategory, { bg: string; text: string }> = {
    Good: { bg: "rgba(34, 197, 94, 0.12)", text: "#4ade80" },
    Moderate: { bg: "rgba(234, 179, 8, 0.12)", text: "#facc15" },
    "Unhealthy (Sensitive)": {
      bg: "rgba(249, 115, 22, 0.12)",
      text: "#fb923c",
    },
    Unhealthy: { bg: "rgba(239, 68, 68, 0.12)", text: "#f87171" },
    "Very Unhealthy": { bg: "rgba(168, 85, 247, 0.12)", text: "#c084fc" },
    Hazardous: { bg: "rgba(153, 27, 27, 0.15)", text: "#fca5a5" },
  };
  return pills[category] || { bg: "rgba(79, 140, 255, 0.12)", text: "#93c5fd" };
}

/** Light-mode category pill colors */
export function getCategoryPillColorsLight(category: AqiCategory): {
  bg: string;
  text: string;
} {
  const pills: Record<AqiCategory, { bg: string; text: string }> = {
    Good: { bg: "rgba(34, 197, 94, 0.15)", text: "#16a34a" },
    Moderate: { bg: "rgba(234, 179, 8, 0.15)", text: "#a16207" },
    "Unhealthy (Sensitive)": {
      bg: "rgba(249, 115, 22, 0.15)",
      text: "#c2410c",
    },
    Unhealthy: { bg: "rgba(239, 68, 68, 0.15)", text: "#dc2626" },
    "Very Unhealthy": { bg: "rgba(168, 85, 247, 0.15)", text: "#7c3aed" },
    Hazardous: { bg: "rgba(153, 27, 27, 0.2)", text: "#991b1b" },
  };
  return pills[category] || { bg: "rgba(79, 140, 255, 0.15)", text: "#2563eb" };
}

/* ===== DATE FORMATTING ===== */

/** Format a date string for display */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Format a date string with year */
export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Get short day name from date string */
export function getDayName(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
}

/** Get month + day from date string */
export function getShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* ===== UTILITY ===== */

/** Generate a unique ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
