/* ===== API RESPONSE TYPES ===== */

/** Single AQI data point for historical records */
export interface AqiDataPoint {
  date: string;
  aqi: number;
  category: AqiCategory;
}

/** Single prediction for future AQI */
export interface AqiPrediction {
  day: number;
  date: string;
  aqi: number;
  category: AqiCategory;
}

/** Model performance metrics */
export interface ModelMetrics {
  r2: number;
  mae: number;
}

/** Full API response from /api/predict */
export interface PredictionResponse {
  city: string;
  country: string;
  lat: number;
  lon: number;
  history: AqiDataPoint[];
  full_history: AqiDataPoint[];
  predictions: AqiPrediction[];
  model_metrics: ModelMetrics;
}

/** AQI category strings */
export type AqiCategory =
  | "Good"
  | "Moderate"
  | "Unhealthy (Sensitive)"
  | "Unhealthy"
  | "Very Unhealthy"
  | "Hazardous";

/** Saved city in localStorage */
export interface SavedCity {
  id: string;
  name: string;
  country: string;
  lastAqi: number;
  lastCategory: AqiCategory;
  savedAt: string;
}

/** Toast notification types */
export type ToastType = "success" | "error" | "info" | "warning";

/** Toast notification */
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

/** Theme mode */
export type ThemeMode = "dark" | "light";
