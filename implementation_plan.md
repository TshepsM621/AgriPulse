# AgriPulse Implementation Plan

AgriPulse is a predictive, data-first agricultural analytics web app designed to give farmers real-time insights, spatial field analysis, and localized prescriptions. It is styled with the **Sophisticated Dark** aesthetic (slate-950, emerald accents, and elegant, high-contrast layouts).

---

## 1. Scope & Core Features

### A. Dashboard View (Telemetry Hub)
*   **Hero Analytics Cards**:
    *   **Soil Moisture**: Styled in electric blue, displaying current levels with delta indicators and dynamic retention bar.
    *   **NDVI Health**: Styled in emerald green, indicating crop biomass density (0.0 to 1.0) with localized evaluation.
    *   **Ambient Temperature**: Styled in glowing orange, warning of high heat waves and evaporation risks.
*   **Interactive Simulation Console**:
    *   Allows users to manually toggle/slide values or run pre-set scenarios (e.g., **Heatwave**, **Optimal Spring**, **Severe Drought**, **Heavy Rainfall**) to see how telemetry charts, field maps, and alerts dynamically adapt.
*   **Historical Telemetry Charts**:
    *   Interactive time-series charts (using `recharts` or custom high-fidelity SVG graphics for ultimate control and reliability under Vite) displaying historical trends of Moisture, NDVI, and Temp over 72 hours.

### B. Actionable Prescriptions Engine
*   **Dynamic Logic Triggers**:
    *   **Moisture < 20% & Temp > 32°C**: Trigger "Zone 4B: Evaporation Crisis" alert with an active button: `Trigger Drip Irrigation Zone 4B`.
    *   **NDVI Index < 0.40**: Trigger "Biomass Deficit" alert with active button: `Schedule Variable-Rate Nitrogen Prescription`.
    *   **Moisture > 75%**: Warning alert: "Waterlogging detected in low-lying sectors. Hold irrigation."
*   **Interactive Feed Actions**:
    *   Farmers can click **"Trigger"**, **"Approve"**, or **"Dismiss"** on prescriptions. Action states will display loading feedback, success notifications, and directly update the simulated state of the farm.

### C. Field Map Visualizer (Satellite Grid)
*   **Spatial Plot Layout**:
    *   An interactive 4x3 grid map showing sections A1-C4 in deep-space dark colors with color-coded alerts (Green: Nominal, Orange: Warning, Red: Critical).
    *   Clicking on any plot (e.g., Zone 4B) brings up a **Plot Inspector Panel** showing specific coordinates, moisture level, and biomass health for that individual zone.
*   **Interactive Map Actions**:
    *   A manual override to irrigate a specific plot or flag a plot for a physical inspection.
    *   An **"Export Map"** action mock which creates a CSV/Shapefile simulation export.

### D. Full Responsiveness & Usability
*   **Mobile-First Adaptability**: Large tap targets (>= 44px), full-width flex stacking, scrollable tables/grids, and a collapsible telemetry control drawer.
*   **Aesthetic Alignment**: Styled fully in `slate-950` with elegant `emerald-500` glow points, borders of `slate-800`, and high-contrast typographic hierarchy matching the provided theme.

---

## 2. Technical Stack & Dependencies

*   **Framework**: React (Vite-based client SPA).
*   **Styling**: Tailwind CSS (loaded via `@import "tailwindcss"` with `@tailwindcss/vite`).
*   **Icons**: Lucide React.
*   **Data/Charts**: Interactive custom SVGs or `recharts` (installed if needed). Custom SVGs will match the exact visual fidelity of the provided design template, featuring interactive tooltips and crisp gradients.
*   **State Management**: Unified React context for the simulation state (active alerts, scenario configurations, individual plot values, and historical telemetry data streams).

---

## 3. Implementation Steps

### Step 1: Update Application Metadata
*   Edit `metadata.json` to assign the proper app name ("AgriPulse") and an informative description.

### Step 2: Install Package Dependencies
*   Install `recharts` (if we choose to use it, or we will use high-fidelity interactive SVGs which can be customized more deeply to fit the "Sophisticated Dark" aesthetic perfectly).

### Step 3: Create the Simulation Engine & Core Components
*   Build a centralized simulator state in `src/App.tsx` containing:
    *   Current values for Soil Moisture, NDVI, and Temp.
    *   Historical datasets for the chart.
    *   Grid plot states (A1 through C4) including current status overrides.
    *   Active alerts queue.
    *   Simulated action log / history tracking.

### Step 4: Build UI Layout with "Sophisticated Dark" Styling
*   **Header Navigation**: Title, logo, farm location ("Clover Creek Farm • Zone 4B"), connection state badge.
*   **KPI Cards Panel**: Responsive flex/grid containing Soil Moisture, NDVI, and Ambient Temp. Includes a slider simulation dock to allow users to play with values.
*   **Visualizer Grid**: Split screen containing the Spatial Satellite Grid and Interactive Historical Trends.
*   **Prescriptions Drawer / Aside**: Real-time prescription stream containing active alerts with interactive approval buttons.
*   **Footer Status**: Operational metrics and system logs.

### Step 5: Validation & Testing
*   Verify compilation via `compile_applet`.
*   Ensure all components are typed correctly and satisfy ESLint rules.
