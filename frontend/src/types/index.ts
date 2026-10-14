/* ===== API RESPONSE TYPES ===== */

export type ApiStatus = "ok" | "partial" | "unavailable";

/** Single AQI data point for historical records */
export interface AqiDataPoint {
  date: string;
  aqi: number;
  category: AqiCategory;
  estimated?: boolean;
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
  baseline_mae?: number;
  validation_method?: string;
  window_size_days?: number;
  train_samples?: number;
  test_samples?: number;
}

export interface DataQuality {
  observed_days: number;
  interpolated_days: number;
  total_days: number;
  coverage_ratio: number;
  notes: string[];
}

/** Full API response from /api/predict */
export interface PredictionResponse {
  status: ApiStatus;
  city: string;
  country: string;
  lat: number;
  lon: number;
  history: AqiDataPoint[];
  full_history: AqiDataPoint[];
  predictions: AqiPrediction[];
  model_metrics: ModelMetrics;
  data_quality: DataQuality;
}

export interface MetroCity {
  name: string;
  lat: number;
  lon: number;
  aqi: number | null;
  category: string | null;
  temp: number | null;
  humidity: number | null;
  data_status?: ApiStatus;
}

export interface MetroCitiesResponse {
  status: ApiStatus;
  cities: MetroCity[];
  updated_at?: string;
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
