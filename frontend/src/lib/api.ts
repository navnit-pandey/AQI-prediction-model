import { MetroCitiesResponse, PredictionResponse } from "@/types";

const API_BASE = "/api";
const DEFAULT_TIMEOUT_MS = 25000;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function createAbortSignal(timeoutMs: number, externalSignal?: AbortSignal) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
}

export async function fetchPrediction(
  city: string,
  options?: { signal?: AbortSignal; timeoutMs?: number }
): Promise<PredictionResponse> {
  if (!city.trim()) {
    throw new ApiError("City name is required.", 400);
  }

  const { signal, cleanup } = createAbortSignal(
    options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    options?.signal
  );

  try {
    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city: city.trim() }),
      signal,
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
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        "The request timed out or was cancelled. Please try again.",
        408
      );
    }

    throw new ApiError(
      "Failed to connect to the server. Please check if the backend is running.",
      503
    );
  } finally {
    cleanup();
  }
}

export async function fetchMetroCities(
  options?: { signal?: AbortSignal; timeoutMs?: number }
): Promise<MetroCitiesResponse> {
  const { signal, cleanup } = createAbortSignal(
    options?.timeoutMs ?? 12000,
    options?.signal
  );

  try {
    const response = await fetch(`${API_BASE}/metro-cities`, { signal });
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || "Unable to fetch metro city data.",
        response.status
      );
    }

    return data as MetroCitiesResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Metro city request timed out.", 408);
    }
    throw new ApiError("Failed to fetch metro city data.", 503);
  } finally {
    cleanup();
  }
}
