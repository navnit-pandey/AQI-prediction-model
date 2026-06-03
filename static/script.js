/* ===== DOM ELEMENTS ===== */
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const loadingContainer = document.getElementById("loading");
const resultsSection = document.getElementById("results");
const errorToast = document.getElementById("error-toast");

let chartInstance = null;

/* ===== EVENT LISTENERS ===== */
searchBtn.addEventListener("click", handleSearch);
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

/* ===== SEARCH HANDLER ===== */
async function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  showLoading(true);
  hideResults();
  hideError();

  try {
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    renderResults(data);
  } catch (err) {
    showError(err.message || "Failed to fetch data. Please try again.");
  } finally {
    showLoading(false);
  }
}

/* ===== RENDER RESULTS ===== */
function renderResults(data) {
  // City Header
  document.getElementById("city-name").textContent = `${data.city}, ${data.country}`;
  document.getElementById("city-coords").textContent = `${data.lat}°N, ${data.lon}°E`;

  // Stats
  const latestAqi = data.history[data.history.length - 1];
  const avgHistory = data.history.reduce((s, h) => s + h.aqi, 0) / data.history.length;
  const avgForecast = data.predictions.reduce((s, p) => s + p.aqi, 0) / data.predictions.length;

  document.getElementById("stat-current-value").textContent = latestAqi.aqi;
  document.getElementById("stat-current-sub").textContent = latestAqi.category;
  setCategoryColor(document.getElementById("stat-current-value"), latestAqi.category);

  document.getElementById("stat-avg-history").textContent = Math.round(avgHistory);
  document.getElementById("stat-avg-history-sub").textContent = getCategory(avgHistory);

  document.getElementById("stat-avg-forecast").textContent = Math.round(avgForecast);
  document.getElementById("stat-avg-forecast-sub").textContent = getCategory(avgForecast);

  // Gauge
  animateGauge(latestAqi.aqi, latestAqi.category);

  // Forecast cards
  renderForecast(data.predictions);

  // Chart
  renderChart(data.history, data.predictions);

  // Model metrics
  document.getElementById("metric-r2").textContent = data.model_metrics.r2;
  document.getElementById("metric-mae").textContent = data.model_metrics.mae;

  // History table
  renderHistoryTable(data.history);

  // Show results
  resultsSection.classList.add("active");
  resultsSection.style.display = "block";
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ===== GAUGE ===== */
function animateGauge(aqi, category) {
  const ring = document.getElementById("gauge-ring");
  const valueEl = document.getElementById("gauge-aqi-value");
  const catEl = document.getElementById("gauge-category");

  const maxAqi = 500;
  const percent = Math.min((aqi / maxAqi) * 100, 100);
  const color = getCategoryColor(category);

  ring.style.setProperty("--gauge-color", color);

  // Animate the gauge fill
  let currentPercent = 0;
  const duration = 1500;
  const startTime = performance.now();

  function step(timestamp) {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    currentPercent = eased * percent;

    ring.style.setProperty("--gauge-percent", `${currentPercent}%`);

    const currentAqi = Math.round(eased * aqi);
    valueEl.textContent = currentAqi;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);

  catEl.textContent = category;
  catEl.style.color = color;
  valueEl.style.color = color;
}

/* ===== FORECAST ===== */
function renderForecast(predictions) {
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  predictions.forEach((p, i) => {
    const gradient = getCategoryGradient(p.category);
    const catColors = getCategoryPillColors(p.category);
    const dateObj = new Date(p.date);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const card = document.createElement("div");
    card.className = "forecast-card animate-in";
    card.style.setProperty("--card-gradient", gradient);
    card.innerHTML = `
      <div class="forecast-day">${dayName}</div>
      <div class="forecast-date">${dateStr}</div>
      <div class="forecast-aqi" style="color: ${getCategoryColor(p.category)}">${p.aqi}</div>
      <span class="forecast-category" style="--cat-bg: ${catColors.bg}; --cat-color: ${catColors.text}">${p.category}</span>
    `;
    grid.appendChild(card);
  });
}

/* ===== CHART ===== */
function renderChart(history, predictions) {
  const ctx = document.getElementById("aqi-chart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  const historyLabels = history.map((h) =>
    new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );
  const predLabels = predictions.map((p) =>
    new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );

  const allLabels = [...historyLabels, ...predLabels];
  const historyData = [...history.map((h) => h.aqi), ...Array(predictions.length).fill(null)];
  const predData = [...Array(history.length - 1).fill(null), history[history.length - 1].aqi, ...predictions.map((p) => p.aqi)];

  const gradientHistory = ctx.createLinearGradient(0, 0, 0, 380);
  gradientHistory.addColorStop(0, "rgba(79, 140, 255, 0.25)");
  gradientHistory.addColorStop(1, "rgba(79, 140, 255, 0)");

  const gradientPred = ctx.createLinearGradient(0, 0, 0, 380);
  gradientPred.addColorStop(0, "rgba(168, 85, 247, 0.2)");
  gradientPred.addColorStop(1, "rgba(168, 85, 247, 0)");

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: allLabels,
      datasets: [
        {
          label: "Historical AQI",
          data: historyData,
          borderColor: "#4f8cff",
          backgroundColor: gradientHistory,
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 5,
          pointBackgroundColor: "#4f8cff",
          pointBorderColor: "#0d1130",
          pointBorderWidth: 2,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#4f8cff",
          pointHoverBorderWidth: 3,
        },
        {
          label: "Predicted AQI",
          data: predData,
          borderColor: "#a855f7",
          backgroundColor: gradientPred,
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          borderDash: [8, 4],
          pointRadius: 5,
          pointBackgroundColor: "#a855f7",
          pointBorderColor: "#0d1130",
          pointBorderWidth: 2,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#a855f7",
          pointHoverBorderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          labels: {
            color: "rgba(240, 242, 255, 0.6)",
            font: { family: "'Inter', sans-serif", size: 12, weight: "500" },
            padding: 20,
            usePointStyle: true,
            pointStyleWidth: 10,
          },
        },
        tooltip: {
          backgroundColor: "rgba(13, 17, 48, 0.95)",
          titleColor: "#f0f2ff",
          bodyColor: "rgba(240, 242, 255, 0.8)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          cornerRadius: 12,
          padding: 14,
          titleFont: { family: "'Inter', sans-serif", size: 13, weight: "700" },
          bodyFont: { family: "'Inter', sans-serif", size: 12 },
          displayColors: true,
          callbacks: {
            label: function (context) {
              if (context.parsed.y === null) return null;
              return ` ${context.dataset.label}: ${context.parsed.y.toFixed(1)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.04)", drawBorder: false },
          ticks: {
            color: "rgba(240, 242, 255, 0.35)",
            font: { family: "'Inter', sans-serif", size: 11 },
          },
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.04)", drawBorder: false },
          ticks: {
            color: "rgba(240, 242, 255, 0.35)",
            font: { family: "'Inter', sans-serif", size: 11 },
          },
          beginAtZero: true,
        },
      },
      animation: {
        duration: 1500,
        easing: "easeInOutQuart",
      },
    },
  });
}

/* ===== HISTORY TABLE ===== */
function renderHistoryTable(history) {
  const tbody = document.getElementById("history-body");
  tbody.innerHTML = "";

  history.forEach((h) => {
    const color = getCategoryColor(h.category);
    const pillColors = getCategoryPillColors(h.category);
    const dateStr = new Date(h.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${dateStr}</td>
      <td>
        <span class="aqi-badge">
          <span class="aqi-dot" style="background: ${color}"></span>
          ${h.aqi}
        </span>
      </td>
      <td>
        <span class="category-pill" style="--cat-bg: ${pillColors.bg}; --cat-color: ${pillColors.text}">
          ${h.category}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ===== HELPERS ===== */
function getCategory(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy (Sensitive)";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function getCategoryColor(category) {
  const colors = {
    Good: "#22c55e",
    Moderate: "#eab308",
    "Unhealthy (Sensitive)": "#f97316",
    Unhealthy: "#ef4444",
    "Very Unhealthy": "#a855f7",
    Hazardous: "#991b1b",
  };
  return colors[category] || "#4f8cff";
}

function getCategoryGradient(category) {
  const gradients = {
    Good: "linear-gradient(135deg, #22c55e, #10b981)",
    Moderate: "linear-gradient(135deg, #eab308, #f59e0b)",
    "Unhealthy (Sensitive)": "linear-gradient(135deg, #f97316, #fb923c)",
    Unhealthy: "linear-gradient(135deg, #ef4444, #f87171)",
    "Very Unhealthy": "linear-gradient(135deg, #a855f7, #c084fc)",
    Hazardous: "linear-gradient(135deg, #7f1d1d, #991b1b)",
  };
  return gradients[category] || "linear-gradient(135deg, #4f8cff, #60a5fa)";
}

function getCategoryPillColors(category) {
  const pills = {
    Good: { bg: "rgba(34, 197, 94, 0.12)", text: "#4ade80" },
    Moderate: { bg: "rgba(234, 179, 8, 0.12)", text: "#facc15" },
    "Unhealthy (Sensitive)": { bg: "rgba(249, 115, 22, 0.12)", text: "#fb923c" },
    Unhealthy: { bg: "rgba(239, 68, 68, 0.12)", text: "#f87171" },
    "Very Unhealthy": { bg: "rgba(168, 85, 247, 0.12)", text: "#c084fc" },
    Hazardous: { bg: "rgba(153, 27, 27, 0.15)", text: "#fca5a5" },
  };
  return pills[category] || { bg: "rgba(79, 140, 255, 0.12)", text: "#93c5fd" };
}

function setCategoryColor(el, category) {
  el.style.color = getCategoryColor(category);
}

function showLoading(show) {
  loadingContainer.classList.toggle("active", show);
  searchBtn.disabled = show;
}

function hideResults() {
  resultsSection.classList.remove("active");
  resultsSection.style.display = "none";
}

function showError(message) {
  errorToast.textContent = message;
  errorToast.classList.add("active");
  setTimeout(() => hideError(), 5000);
}

function hideError() {
  errorToast.classList.remove("active");
}
