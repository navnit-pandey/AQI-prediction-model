"use client";

import React, { useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { PredictionResponse } from "@/types";
import { fetchPrediction, ApiError } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

import SearchBar from "@/components/dashboard/SearchBar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import StatsRow from "@/components/dashboard/StatsRow";
import AqiGauge from "@/components/dashboard/AqiGauge";
import AqiScaleLegend from "@/components/dashboard/AqiScaleLegend";
import AqiMiniStats from "@/components/dashboard/AqiMiniStats";
import CityCompare from "@/components/dashboard/CityCompare";
import ForecastGrid from "@/components/dashboard/ForecastGrid";
import AqiChart from "@/components/dashboard/AqiChart";
import HealthSuggestions from "@/components/dashboard/HealthSuggestions";
import ModelMetrics from "@/components/dashboard/ModelMetrics";
import HistoryTable from "@/components/dashboard/HistoryTable";
import DownloadData from "@/components/dashboard/DownloadData";
import SavedCities from "@/components/dashboard/SavedCities";
import MetroCities from "@/components/dashboard/MetroCities";
import Footer from "@/components/layout/Footer";

const AqiBarChart = dynamic(() => import("@/components/dashboard/AqiBarChart"), {
  loading: () => <LoadingSpinner message="Loading AQI comparison chart" />,
});
const AqiDoughnutChart = dynamic(
  () => import("@/components/dashboard/AqiDoughnutChart"),
  { loading: () => <LoadingSpinner message="Loading AQI category chart" /> }
);
const AqiPolarChart = dynamic(() => import("@/components/dashboard/AqiPolarChart"), {
  loading: () => <LoadingSpinner message="Loading AQI seasonal chart" />,
});

export default function HomePage() {
  const [data, setData] = useState<PredictionResponse | null>(null);
  const [previousData, setPreviousData] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { addToast } = useToast();

  const handleSearch = useCallback(
    async (city: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);

      if (data) {
        setPreviousData(data);
      }
      setData(null);

      try {
        const result = await fetchPrediction(city, {
          signal: controller.signal,
          timeoutMs: 25000,
        });
        setData(result);
        setLastUpdated(
          new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
        addToast("success", `AQI predictions loaded for ${result.city}, ${result.country}`);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        const message =
          err instanceof ApiError
            ? err.message
            : "An unexpected error occurred. Please try again.";
        setError(message);
        addToast("error", message);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [addToast, data]
  );

  const latestAqi = data?.history[data.history.length - 1];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
      <header id="hero" style={{ textAlign: "center", padding: "60px 0 40px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            background: "var(--bg-card)",
            border: "1px solid var(--glass-border)",
            borderRadius: "100px",
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "var(--text-secondary)",
            marginBottom: "28px",
            backdropFilter: "blur(10px)",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              background: "#22c55e",
              borderRadius: "50%",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          Powered by Machine Learning
        </div>

        <h1
          style={{
            fontSize: "clamp(2.8rem, 7vw, 5rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "20px",
          }}
        >
          <span className="gradient-text">AirQ Predict</span>
        </h1>

        <p
          style={{
            fontSize: "1.15rem",
            color: "var(--text-secondary)",
            maxWidth: "540px",
            margin: "0 auto 48px",
            fontWeight: 400,
            lineHeight: 1.7,
          }}
        >
          Enter any city to get AQI history and a 5-day forecast. Guidance is
          informational only and not medical advice.
        </p>
      </header>

      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      <section aria-live="polite" aria-busy={isLoading}>
        {isLoading && <LoadingSpinner />}

        {error && !isLoading && (
          <div
            role="alert"
            style={{
              textAlign: "center",
              padding: "40px 24px",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "20px",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                margin: "0 auto 16px",
              }}
            >
              ⚠️
            </div>
            <p
              style={{
                color: "#fca5a5",
                fontSize: "0.95rem",
                fontWeight: 500,
                maxWidth: "400px",
                margin: "0 auto",
              }}
            >
              {error}
            </p>
          </div>
        )}

        {!data && !isLoading && !error && <EmptyState onCitySelect={handleSearch} />}
      </section>

      {data && !isLoading && latestAqi && (
        <section id="results" style={{ paddingBottom: "20px", animation: "fadeInUp 0.6s ease" }}>
          <div id="city-header" style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: "6px",
              }}
            >
              {data.city}, {data.country}
            </h2>
            <div
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                fontWeight: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <span>
                {data.lat}°N, {data.lon}°E
              </span>
              {lastUpdated && (
                <>
                  <span style={{ opacity: 0.3 }}>•</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    🕐 Updated {lastUpdated}
                  </span>
                </>
              )}
            </div>
            <p style={{ marginTop: "8px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Data coverage: {Math.round(data.data_quality.coverage_ratio * 100)}% observed ({data.data_quality.observed_days}/{data.data_quality.total_days} days)
            </p>
            {data.data_quality.notes.length > 0 && (
              <p style={{ marginTop: "4px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {data.data_quality.notes.join(" ")}
              </p>
            )}
          </div>

          <CityCompare currentData={data} previousData={previousData} />
          <StatsRow data={data} />
          <AqiGauge aqi={latestAqi.aqi} category={latestAqi.category} />

          <HealthSuggestions aqi={latestAqi.aqi} category={latestAqi.category} city={data.city} />

          <AqiScaleLegend />
          <AqiMiniStats history={data.history} predictions={data.predictions} />
          <ForecastGrid predictions={data.predictions} />
          <AqiChart history={data.history} predictions={data.predictions} fullHistory={data.full_history} />
          <AqiBarChart history={data.history} predictions={data.predictions} fullHistory={data.full_history} />

          <div
            id="charts-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "48px",
              animation: "fadeInUp 0.6s ease 0.4s forwards",
              opacity: 0,
            }}
          >
            <AqiDoughnutChart history={data.history} fullHistory={data.full_history} />
            <AqiPolarChart history={data.history} fullHistory={data.full_history} />
          </div>

          <ModelMetrics metrics={data.model_metrics} />
          <HistoryTable history={data.history} />
          <DownloadData
            city={data.city}
            country={data.country}
            history={data.history}
            fullHistory={data.full_history}
            predictions={data.predictions}
            modelMetrics={data.model_metrics}
          />
          <SavedCities
            currentCity={data.city}
            currentCountry={data.country}
            currentAqi={latestAqi.aqi}
            currentCategory={latestAqi.category}
            onCityClick={handleSearch}
          />
        </section>
      )}

      <MetroCities onCityClick={handleSearch} />
      <Footer />
    </div>
  );
}
