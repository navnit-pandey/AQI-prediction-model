import { PredictionResponse } from "@/types";

/**
 * Base URL for the Flask backend API.
 * In development, the Flask server runs on port 5000.
 * The Next.js dev server proxies requests via next.config.ts rewrites.
 */
const API_BASE = "/api";

/**
 * Custom error class for API errors with status codes
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Fetch AQI predictions for a given city.
 * Sends a POST request to the Flask backend /api/predict endpoint.
 *
 * @param city - Name of the city to predict AQI for
 * @returns Promise resolving to the prediction response data
 * @throws ApiError if the request fails or returns an error
 */
export async function fetchPrediction(
  city: string
): Promise<PredictionResponse> {
  if (!city.trim()) {
    throw new ApiError("City name is required.", 400);
  }

  try {
    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city: city.trim() }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || "Something went wrong. Please try again.",
        response.status
      );
    }

    return data as PredictionResponse;
  } catch (error) {
    // Re-throw ApiError instances as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    throw new ApiError(
      "Failed to connect to the server. Please check if the backend is running.",
      503
    );
  }
}
