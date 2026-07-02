# AgriPulse 

Modern agriculture faces unprecedented volatility due to shifting climate patterns, rising input costs, and supply chain vulnerabilities. Traditional farm management tools capture data but fail to translate it into real-time, predictive actions. 

**AgriPulse** is a robust, data-first mobile and web application designed to bridge this gap. Built by combining enterprise-grade software development with predictive data analytics, AgriPulse transforms raw environmental, soil, and satellite data into localized, actionable prescriptions that improve crop yield, optimize resource allocation, and maximize profitability.

---

## Key Features

- **Real-Time Telemetry Ingestion:** Aggregates and visualizes live field data stream metrics, including Soil Moisture (%), NDVI Biomass Health Index (0.0 to 1.0), and Ambient Temperature (°C).
- **Predictive Action Engine:** Evaluates multi-modal data thresholds to instantly generate high-confidence, localized growth and irrigation prescriptions.
- **Interactive Satellite Field Maps:** Clear, color-coded visual zoning (Green for nominal, Red for critical) to let farmers pinpoint stress areas at a glance.
- **Mobile-First Design:** A fully responsive UI tailored for on-the-field farmers using mobile devices or tablets under harsh sunlight.

---

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Icons & UI Elements:** Lucide React
- **Data Visualization:** Recharts / D3.js (Interactive time-series telemetry pipelines)
- **Ecosystem:** Generated and provisioned via the **Google Antigravity Agent Environment** (Google AI Studio)

---

## Project Structure

```text
agripulse/
├── app/                  # Next.js App Router (Pages & API Routes)
│   ├── layout.tsx        # Global layout & Tailwind injection
│   ├── page.tsx          # AgriPulse Main Dashboard View
│   └── api/telemetry/    # Inline mock live data stream endpoints
├── components/           # Reusable UI Architecture
│   ├── AnalyticsPanel.tsx # Live telemetry cards
│   ├── FieldMap.tsx      # Satellite zone placeholder map
│   ├── Prescriptions.tsx # Predictive alert feed
│   └── TelemetryChart.tsx # Recharts time-series data pipeline
├── public/               # Static assets & icons
└── package.json          # Dependency tree
