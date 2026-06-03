"use client";

import React, { useState, useCallback, useRef } from "react";
import { PredictionResponse } from "@/types";
import { fetchPrediction, ApiError } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

// Components
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
import AqiBarChart from "@/components/dashboard/AqiBarChart";
import AqiDoughnutChart from "@/components/dashboard/AqiDoughnutChart";
import AqiPolarChart from "@/components/dashboard/AqiPolarChart";
import HealthSuggestions from "@/components/dashboard/HealthSuggestions";
import ModelMetrics from "@/components/dashboard/ModelMetrics";
import HistoryTable from "@/components/dashboard/HistoryTable";
import DownloadData from "@/components/dashboard/DownloadData";
import SavedCities from "@/components/dashboard/SavedCities";
import MetroCities from "@/components/dashboard/MetroCities";
import Footer from "@/components/layout/Footer";

/**
 * Main dashboard page.
 * Orchestrates the entire AQI prediction flow:
 * search → loading → results display with all dashboard widgets.
 */
export default function HomePage() {
  const [data, setData] = useState<PredictionResponse | null>(null);
  const [previousData, setPreviousData] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { addToast } = useToast();

  /**
   * Handle city search.
   * Stores the previous result for city comparison.
   */
  const handleSearch = useCallback(
    async (city: string) => {
      setIsLoading(true);
      setError(null);

      // Save current data as previous for comparison
      if (data) {
        setPreviousData(data);
      }
      setData(null);

      try {
        const result = await fetchPrediction(city);
        setData(result);
        setLastUpdated(new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }));
        addToast(
          "success",
          `AQI predictions loaded for ${result.city}, ${result.country}`
        );
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "An unexpected error occurred. Please try again.";
        setError(message);
        addToast("error", message);
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, data]
  );

  // Compute latest AQI for components
  const latestAqi = data?.history[data.history.length - 1];

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 24px",
      }}
    >
      {/* ===== HERO SECTION ===== */}
      <header
        id="hero"
        style={{
          textAlign: "center",
          padding: "60px 0 40px",
        }}
      >
        {/* ML badge */}
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

        {/* Title */}
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

        {/* Subtitle */}
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
          Enter any city to get real-time AQI data and AI-powered air quality
          predictions for the next 5 days.
        </p>
      </header>

      {/* ===== SEARCH BAR ===== */}
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      {/* ===== LOADING STATE ===== */}
      {isLoading && <LoadingSpinner />}

      {/* ===== ERROR STATE ===== */}
      {error && !isLoading && (
        <div
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

      {/* ===== EMPTY STATE ===== */}
      {!data && !isLoading && !error && <EmptyState />}

      {/* ===== RESULTS SECTION ===== */}
      {data && !isLoading && (
        <section
          id="results"
          style={{
            paddingBottom: "20px",
            animation: "fadeInUp 0.6s ease",
          }}
        >
          {/* City header + Last Updated */}
          <div
            id="city-header"
            style={{
              textAlign: "center",
              marginBottom: "48px",
            }}
          >
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
              <span>{data.lat}°N, {data.lon}°E</span>
              {lastUpdated && (
                <>
                  <span style={{ opacity: 0.3 }}>•</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    🕐 Updated {lastUpdated}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* City Comparison (shows if there's a previous city) */}
          <CityCompare currentData={data} previousData={previousData} />

          {/* Stats row */}
          <StatsRow data={data} />

          {/* AQI Gauge */}
          <AqiGauge
            aqi={latestAqi!.aqi}
            category={latestAqi!.category}
          />

          {/* AQI Scale Legend */}
          <AqiScaleLegend />

          {/* Quick Insights row */}
          <AqiMiniStats history={data.history} predictions={data.predictions} />

          {/* 5-Day Forecast */}
          <ForecastGrid predictions={data.predictions} />

          {/* Line chart */}
          <AqiChart history={data.history} predictions={data.predictions} fullHistory={data.full_history} />

          {/* Bar chart */}
          <AqiBarChart history={data.history} predictions={data.predictions} fullHistory={data.full_history} />

          {/* Doughnut + Polar charts in 2-column grid */}
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

          {/* Health suggestions & actions */}
          <HealthSuggestions
            aqi={latestAqi!.aqi}
            category={latestAqi!.category}
            city={data.city}
          />

          {/* Model metrics */}
          <ModelMetrics metrics={data.model_metrics} />

          {/* History table */}
          <HistoryTable history={data.history} />

          {/* Download data */}
          <DownloadData
            city={data.city}
            country={data.country}
            history={data.history}
            fullHistory={data.full_history}
            predictions={data.predictions}
            modelMetrics={data.model_metrics}
          />

          {/* Saved cities */}
          <SavedCities
            currentCity={data.city}
            currentCountry={data.country}
            currentAqi={latestAqi!.aqi}
            currentCategory={latestAqi!.category}
            onCityClick={handleSearch}
          />
        </section>
      )}

      {/* ===== INDIA METRO CITIES ===== */}
      <MetroCities onCityClick={handleSearch} />

      {/* ===== FOOTER ===== */}
      <Footer />
    </div>
  );
}
