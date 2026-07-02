import React, { useState, useEffect, useMemo } from 'react';
import { 
  Droplets, 
  Sprout, 
  Thermometer, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Download, 
  Layers, 
  CheckCircle2, 
  X, 
  Play, 
  Pause, 
  RefreshCw,
  Search,
  BookOpen,
  Plus,
  Compass,
  ArrowRight,
  Info
} from 'lucide-react';

// Define structures
interface Plot {
  id: string;
  name: string;
  gps: string;
  moisture: number; // 0 - 100%
  ndvi: number; // 0.0 - 1.0
  temp: number; // °C
  crop: string;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  plotId: string;
  title: string;
  message: string;
  time: string;
  actionLabel?: string;
  actionType: 'irrigate' | 'fertilize' | 'calibrate';
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'critical';
}

export default function App() {
  // --- 1. INITIAL STATES ---
  const [plots, setPlots] = useState<Plot[]>([
    { id: 'A1', name: 'Sector A1', gps: '45.321°N, 122.671°W', moisture: 42, ndvi: 0.78, temp: 24.1, crop: 'Spring Wheat' },
    { id: 'A2', name: 'Sector A2', gps: '45.321°N, 122.672°W', moisture: 38, ndvi: 0.74, temp: 24.3, crop: 'Spring Wheat' },
    { id: 'A3', name: 'Sector A3', gps: '45.321°N, 122.673°W', moisture: 31, ndvi: 0.38, temp: 24.5, crop: 'Alfalfa Feed' },
    { id: 'A4', name: 'Sector A4', gps: '45.321°N, 122.674°W', moisture: 45, ndvi: 0.81, temp: 23.9, crop: 'Spring Wheat' },
    { id: 'B1', name: 'Sector B1', gps: '45.322°N, 122.671°W', moisture: 40, ndvi: 0.76, temp: 24.2, crop: 'Grain Barley' },
    { id: '4B', name: 'Zone 4B', gps: '45.322°N, 122.672°W', moisture: 18.4, ndvi: 0.72, temp: 34.2, crop: 'Silage Corn' },
    { id: 'B3', name: 'Sector B3', gps: '45.322°N, 122.673°W', moisture: 36, ndvi: 0.73, temp: 24.4, crop: 'Grain Barley' },
    { id: 'B4', name: 'Sector B4', gps: '45.322°N, 122.674°W', moisture: 41, ndvi: 0.75, temp: 24.0, crop: 'Grain Barley' },
    { id: 'C1', name: 'Sector C1', gps: '45.323°N, 122.671°W', moisture: 44, ndvi: 0.80, temp: 23.8, crop: 'Canola Oilseed' },
    { id: 'C2', name: 'Sector C2', gps: '45.323°N, 122.672°W', moisture: 43, ndvi: 0.79, temp: 24.0, crop: 'Canola Oilseed' },
    { id: 'C3', name: 'Sector C3', gps: '45.323°N, 122.673°W', moisture: 39, ndvi: 0.77, temp: 24.1, crop: 'Canola Oilseed' },
    { id: 'C4', name: 'Sector C4', gps: '45.323°N, 122.674°W', moisture: 42, ndvi: 0.78, temp: 23.9, crop: 'Canola Oilseed' },
  ]);

  const [selectedPlotId, setSelectedPlotId] = useState<string>('4B');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1); // 1x, 2x
  const [historyData, setHistoryData] = useState<Array<{ time: string; moisture: number; ndvi: number; temp: number }>>([
    { time: '72h ago', moisture: 28, ndvi: 0.71, temp: 26 },
    { time: '48h ago', moisture: 25, ndvi: 0.72, temp: 29 },
    { time: '36h ago', moisture: 22, ndvi: 0.72, temp: 31 },
    { time: '24h ago', moisture: 20, ndvi: 0.72, temp: 33 },
    { time: '12h ago', moisture: 19, ndvi: 0.72, temp: 34 },
    { time: 'Current', moisture: 18.4, ndvi: 0.72, temp: 34.2 },
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '05:40 AM', message: 'Telemetry mesh node connected successfully (8/8 online)', type: 'success' },
    { id: '2', timestamp: '05:45 AM', message: 'NDVI satellite imagery updated for Clover Creek Farm', type: 'info' },
  ]);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Custom User Notes/Prescriptions
  const [customPrescriptionText, setCustomPrescriptionText] = useState<string>('');
  const [userCreatedAlerts, setUserCreatedAlerts] = useState<Alert[]>([]);

  // Search input for sectors / crops
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Ask Agronomist AI input
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // --- 2. SELECT ACTIVE PLOT METRICS ---
  const activePlot = useMemo(() => {
    return plots.find(p => p.id === selectedPlotId) || plots[5]; // Fallback to 4B
  }, [plots, selectedPlotId]);

  // Sync historical chart to active plot when selection changes
  useEffect(() => {
    setHistoryData([
      { time: '72h ago', moisture: Math.min(100, Math.max(0, Math.round(activePlot.moisture * 1.5))), ndvi: Math.max(0.1, +(activePlot.ndvi - 0.02).toFixed(2)), temp: Math.round(activePlot.temp - 5) },
      { time: '48h ago', moisture: Math.min(100, Math.max(0, Math.round(activePlot.moisture * 1.35))), ndvi: Math.max(0.1, +(activePlot.ndvi - 0.01).toFixed(2)), temp: Math.round(activePlot.temp - 3) },
      { time: '36h ago', moisture: Math.min(100, Math.max(0, Math.round(activePlot.moisture * 1.2))), ndvi: Math.max(0.1, +activePlot.ndvi.toFixed(2)), temp: Math.round(activePlot.temp - 1) },
      { time: '24h ago', moisture: Math.min(100, Math.max(0, Math.round(activePlot.moisture * 1.1))), ndvi: Math.max(0.1, +activePlot.ndvi.toFixed(2)), temp: Math.round(activePlot.temp) },
      { time: '12h ago', moisture: Math.min(100, Math.max(0, Math.round(activePlot.moisture * 1.05))), ndvi: Math.max(0.1, +activePlot.ndvi.toFixed(2)), temp: Math.round(activePlot.temp + 0.5) },
      { time: 'Current', moisture: activePlot.moisture, ndvi: activePlot.ndvi, temp: activePlot.temp },
    ]);
  }, [activePlot.id]);

  // --- 3. DYNAMIC PRESCRIPTION/ALERT LOGIC TRIGGERS ---
  const ruleGeneratedAlerts = useMemo(() => {
    const generated: Alert[] = [];
    plots.forEach(plot => {
      // 1. Evaporation Crisis Rule: moisture < 20% & temp > 32°C
      if (plot.moisture < 20 && plot.temp > 32) {
        generated.push({
          id: `rule-evap-${plot.id}`,
          type: 'critical',
          plotId: plot.id,
          title: `${plot.name}: Evaporation Crisis`,
          message: `Moisture dropped to ${plot.moisture}% with temp at ${plot.temp}°C. Risk of irreversible biomass wilting.`,
          time: 'Just now',
          actionLabel: `Trigger Drip Irrigation ${plot.id}`,
          actionType: 'irrigate'
        });
      }
      // 2. Biomass Deficit Rule: ndvi < 0.4
      else if (plot.ndvi < 0.4) {
        generated.push({
          id: `rule-nitrogen-${plot.id}`,
          type: 'warning',
          plotId: plot.id,
          title: `${plot.name}: Biomass Health Deficit`,
          message: `NDVI index has declined to ${plot.ndvi}. Crop stress detected in ${plot.crop}.`,
          time: '5m ago',
          actionLabel: 'Apply Variable Rate Nitrogen',
          actionType: 'fertilize'
        });
      }
      // 3. Waterlogging Rule: moisture > 80%
      else if (plot.moisture > 80) {
        generated.push({
          id: `rule-waterlog-${plot.id}`,
          type: 'warning',
          plotId: plot.id,
          title: `${plot.name}: Soil Saturation Warning`,
          message: `Soil moisture reached saturation (${plot.moisture}%). Anaerobic conditions may trigger root rot.`,
          time: '12m ago',
          actionLabel: 'Calibrate Drainage Flow',
          actionType: 'calibrate'
        });
      }
    });
    return generated;
  }, [plots]);

  const allAlerts = useMemo(() => {
    return [...ruleGeneratedAlerts, ...userCreatedAlerts];
  }, [ruleGeneratedAlerts, userCreatedAlerts]);

  // --- 4. TELEMETRY STREAM SIMULATION TICKER ---
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setPlots(prevPlots => {
        return prevPlots.map(p => {
          // If simulating, slowly fluctuate moisture & temp based on current ambient states
          // Critical alerts (like 4B) slowly dry up even further if not irrigated
          let moistureDelta = -0.1 * simulationSpeed;
          let tempDelta = (Math.random() - 0.5) * 0.2 * simulationSpeed;

          // If moisture gets very low, NDVI declines slightly over time
          let ndviDelta = 0;
          if (p.moisture < 15) {
            ndviDelta = -0.005 * simulationSpeed;
          }

          const newMoisture = Math.max(5, Math.min(95, +(p.moisture + moistureDelta).toFixed(1)));
          const newNdvi = Math.max(0.1, Math.min(1.0, +(p.ndvi + ndviDelta).toFixed(3)));
          const newTemp = Math.max(10, Math.min(45, +(p.temp + tempDelta).toFixed(1)));

          return {
            ...p,
            moisture: newMoisture,
            ndvi: newNdvi,
            temp: newTemp
          };
        });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed]);

  // Dynamic status color checker for map plots
  const getPlotStatus = (plot: Plot) => {
    if (plot.moisture < 20 && plot.temp > 32) return 'critical';
    if (plot.ndvi < 0.4 || plot.moisture < 25 || plot.moisture > 80) return 'warning';
    return 'nominal';
  };

  // --- 5. ACTION HANDLERS ---
  const handleIrrigate = (plotId: string) => {
    // Reset moisture level for specified plot
    setPlots(prev => prev.map(p => {
      if (p.id === plotId) {
        return { ...p, moisture: 55.0, temp: Math.max(18, p.temp - 4) }; // Cools down as it gets irrigated
      }
      return p;
    }));

    // Add success log
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      {
        id: Date.now().toString(),
        timestamp,
        message: `Drip irrigation activated successfully for ${plots.find(p => p.id === plotId)?.name || plotId}.`,
        type: 'success'
      },
      ...prev
    ]);

    // Show toast
    triggerToast(`Irrigation system successfully triggered for Sector ${plotId}!`, 'success');
  };

  const handleFertilize = (plotId: string) => {
    // Boost NDVI
    setPlots(prev => prev.map(p => {
      if (p.id === plotId) {
        return { ...p, ndvi: Math.min(0.85, +(p.ndvi + 0.35).toFixed(2)) };
      }
      return p;
    }));

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      {
        id: Date.now().toString(),
        timestamp,
        message: `Variable-rate Nitrogen formula dispatched to Sector ${plotId}.`,
        type: 'success'
      },
      ...prev
    ]);

    triggerToast(`Nitrogen fertilization application scheduled for Sector ${plotId}.`, 'success');
  };

  const handleCalibrate = (plotId: string) => {
    // Normalise moisture slightly
    setPlots(prev => prev.map(p => {
      if (p.id === plotId) {
        return { ...p, moisture: Math.max(45, p.moisture - 15) };
      }
      return p;
    }));

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      {
        id: Date.now().toString(),
        timestamp,
        message: `Soil drainage pathways recalibrated for Sector ${plotId}. Excess runoff reduced.`,
        type: 'success'
      },
      ...prev
    ]);

    triggerToast(`Runoff calibration complete for Sector ${plotId}.`, 'success');
  };

  const handleApplyPreset = (scenario: 'heatwave' | 'optimal' | 'drought' | 'rain' | 'stress') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let scenarioMsg = '';
    setPlots(prev => prev.map(p => {
      // Modify sector parameters according to scenario
      if (scenario === 'heatwave') {
        scenarioMsg = 'Injected Climate Scenario: Severe Heatwave (Moisture down, temperatures extreme).';
        return {
          ...p,
          moisture: p.id === '4B' ? 14.5 : Math.max(10, +(p.moisture * 0.5).toFixed(1)),
          temp: p.id === '4B' ? 38.4 : +(p.temp + 10 + Math.random() * 3).toFixed(1)
        };
      } else if (scenario === 'optimal') {
        scenarioMsg = 'Injected Climate Scenario: Optimal Growth Conditions (Balanced water, excellent NDVI).';
        return {
          ...p,
          moisture: 48.0,
          temp: 23.5,
          ndvi: Math.min(0.95, +(p.ndvi + 0.15).toFixed(2))
        };
      } else if (scenario === 'drought') {
        scenarioMsg = 'Injected Climate Scenario: Prolonged Drought (Extremely dry soils, biomass damage).';
        return {
          ...p,
          moisture: Math.max(6, +(p.moisture * 0.25).toFixed(1)),
          ndvi: Math.max(0.2, +(p.ndvi - 0.25).toFixed(2)),
          temp: +(p.temp + 6).toFixed(1)
        };
      } else if (scenario === 'rain') {
        scenarioMsg = 'Injected Climate Scenario: Heavy Precipitations (Waterlogged, cool ambient).';
        return {
          ...p,
          moisture: Math.min(92, +(p.moisture + 40).toFixed(1)),
          temp: Math.max(12, +(p.temp - 8).toFixed(1))
        };
      } else { // stress
        scenarioMsg = 'Injected Crop Stress Scenario: Nitrogen Deficiency in southern sectors.';
        if (p.id === 'A3' || p.id === 'C3') {
          return { ...p, ndvi: 0.28 };
        }
        return p;
      }
    }));

    setLogs(prev => [
      { id: Date.now().toString(), timestamp, message: scenarioMsg, type: 'warning' },
      ...prev
    ]);

    triggerToast(`Scenario ${scenario.toUpperCase()} successfully initialized!`, 'info');
  };

  const handleAddCustomPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrescriptionText.trim()) return;

    const newAlert: Alert = {
      id: `custom-${Date.now()}`,
      type: 'info',
      plotId: selectedPlotId,
      title: `${activePlot.name}: Manual Prescription`,
      message: customPrescriptionText,
      time: 'Just now',
      actionLabel: 'Acknowledge Note',
      actionType: 'calibrate' // uses basic response
    };

    setUserCreatedAlerts(prev => [newAlert, ...prev]);
    setCustomPrescriptionText('');

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      { id: Date.now().toString(), timestamp, message: `Added custom farmer Rx for ${activePlot.name}: "${customPrescriptionText}"`, type: 'info' },
      ...prev
    ]);

    triggerToast('Custom farmer notes added to localized prescriptions.', 'success');
  };

  const dismissAlert = (alertId: string) => {
    setUserCreatedAlerts(prev => prev.filter(a => a.id !== alertId));
    triggerToast('Prescription card dismissed.', 'info');
  };

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleExportMap = () => {
    // Generate actual downloadable CSV matching user's data
    const headers = 'Sector,Crop Type,GPS Location,Soil Moisture (%),NDVI Health Index,Ambient Temp (C),Alert Status\n';
    const rows = plots.map(p => {
      const status = getPlotStatus(p).toUpperCase();
      return `"${p.name}","${p.crop}","${p.gps}",${p.moisture},${p.ndvi},${p.temp},"${status}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `agripulse_fields_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();

    triggerToast('Field state shapefile exported as CSV successfully!', 'success');
  };

  // --- 6. ASK AGRONOMIST AI AGENT (MOCKED & EXPERT GROUNDING) ---
  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setIsAiLoading(true);
    setAiResponse('');

    // Pre-calculate agronomist context based on the actual live state
    const currentStatsContext = `Active Sector is ${activePlot.name} planting ${activePlot.crop} at coordinates ${activePlot.gps}. Localized Soil Moisture: ${activePlot.moisture}%, NDVI index: ${activePlot.ndvi}, Ambient Temperature: ${activePlot.temp}°C. Current active farm-wide critical alerts: ${allAlerts.length}.`;

    // Simulate thinking delay
    setTimeout(() => {
      const query = aiQuestion.toLowerCase();
      let answer = '';

      if (query.includes('irrigate') || query.includes('moisture') || query.includes('water')) {
        if (activePlot.moisture < 20) {
          answer = `🌾 **Agronomist Recommendation for ${activePlot.name}**: Since soil moisture is critical at **${activePlot.moisture}%** and ambient temperature is elevated (**${activePlot.temp}°C**), evapo-transpiration rates are extremely high. Immediate activation of localized drip irrigation is highly recommended to secure root development and prevent permanent cell plasmolysis.`;
        } else if (activePlot.moisture > 75) {
          answer = `🌊 **Agronomist Warning for ${activePlot.name}**: Soil moisture is extremely high at **${activePlot.moisture}%** which creates anaerobic root zones. Retain all irrigation schedules. Ensure secondary drainage canals are fully open to prevent waterlogged hypoxia.`;
        } else {
          answer = `✅ **Agronomist Evaluation for ${activePlot.name}**: Soil moisture of **${activePlot.moisture}%** is in the optimal buffer range for ${activePlot.crop}. No stress detected. Continue routine automated irrigation schedule.`;
        }
      } else if (query.includes('ndvi') || query.includes('nitrogen') || query.includes('fertilizer') || query.includes('health')) {
        if (activePlot.ndvi < 0.4) {
          answer = `🌱 **Agronomist Analysis on Crop Health**: Sector ${activePlot.id} exhibits severe chlorophyll reflection loss with an NDVI of **${activePlot.ndvi}**. This indicates nutrient stress (highly likely Nitrogen depletion). We recommend initiating a Variable-Rate Nitrogen (VRA) application immediately at 15kg/hectare to restore canopy density.`;
        } else if (activePlot.ndvi > 0.75) {
          answer = `✨ **Crop Health Report**: Excellent biomass health! An NDVI of **${activePlot.ndvi}** is indicative of a lush, highly productive photosynthetic canopy. Keep doing what you're doing. Field potential is at maximum capacity.`;
        } else {
          answer = `🌾 **Crop Health Report**: NDVI health is nominal at **${activePlot.ndvi}**. Consistent foliage biomass detected. Monitor for any regionalized color changes during routine tractor passes.`;
        }
      } else if (query.includes('temp') || query.includes('weather') || query.includes('climate') || query.includes('heat')) {
        if (activePlot.temp > 30) {
          answer = `☀️ **Heat stress hazard active**: The ambient temperature of **${activePlot.temp}°C** is above the optimal thermal enzyme range for ${activePlot.crop}. High heat forces stomatal closure, suspending sugar synthesis. Maintain high hydration levels in target soils to cool down root structures.`;
        } else {
          answer = `🌡️ **Thermal Status**: Temperatures of **${activePlot.temp}°C** are within optimal metabolic limits for spring crops. Expected daily photosynthesis cycles are fully nominal.`;
        }
      } else {
        // Universal intelligent answer based on current farm variables
        answer = `🤖 **AgriPulse Advisory Node**: Based on field telemetry, your crop health is rated **${activePlot.ndvi > 0.7 ? 'Excellent' : activePlot.ndvi > 0.4 ? 'Stable' : 'Critical'}**. Soil moisture average is **${activePlot.moisture}%**. We currently advise prioritizing localized actions in **Zone 4B** where evaporation risk is paramount. Let me know if you would like irrigation formulas for any other sector.`;
      }

      setAiResponse(answer);
      setIsAiLoading(false);
    }, 1000);
  };

  // Filter plots list based on search query (by ID or crop)
  const filteredPlots = useMemo(() => {
    return plots.filter(p => 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.crop.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [plots, searchQuery]);

  return (
    <div id="agripulse-wrapper" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-6 font-sans antialiased">
      
      {/* Toast Notification */}
      {toast && (
        <div id="agripulse-toast" className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border backdrop-blur-md flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' :
          toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/30 text-amber-300' :
          'bg-slate-900/90 border-slate-700 text-slate-100'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
          <p className="text-xs font-semibold">{toast.message}</p>
        </div>
      )}

      {/* --- HEADER NAVIGATION --- */}
      <header id="agripulse-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Compass className="w-6 h-6 text-slate-950" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              AgriPulse<span className="text-emerald-400 font-semibold text-sm bg-emerald-500/10 px-1.5 py-0.5 rounded">Predictive Yield AI</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Predictive Agronomy & Mesh Telemetry Engine</p>
          </div>
        </div>

        {/* Global Control Buttons */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <span className="text-slate-500 uppercase tracking-widest font-semibold text-[9px]">Simulation Ticker:</span>
            <button 
              id="btn-toggle-sim"
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md font-bold text-[10px] transition-all uppercase ${
                isSimulating 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isSimulating ? <Play className="w-3 h-3 fill-emerald-400" /> : <Pause className="w-3 h-3" />}
              {isSimulating ? 'Active' : 'Paused'}
            </button>
            {isSimulating && (
              <button
                id="btn-sim-speed"
                onClick={() => setSimulationSpeed(s => s === 1 ? 2.5 : 1)}
                className="bg-slate-800 border border-slate-700 text-slate-300 font-semibold px-2 py-1 rounded-md text-[9px] hover:bg-slate-700"
              >
                Speed: {simulationSpeed}x
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 bg-slate-900/50 px-3 py-2 rounded-xl border border-slate-800">
            <div className="flex flex-col items-end">
              <p className="text-xs font-semibold text-slate-200">Clover Creek Farm • Oregon</p>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Mesh synced: Just now
              </p>
            </div>
            <div className="w-10 h-10 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center">
              <span className="text-xs font-bold text-emerald-400">CC</span>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN SECTION --- */}
      <div id="agripulse-main-grid" className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT & CENTER PANEL (12cols maps to 8cols in desktop layout) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* SCENARIO INJECTOR PANEL (Interactive Feature) */}
          <div id="scenario-injector" className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Climate & Environment Scenario Injector
              </h3>
              <span className="text-[10px] text-slate-500 italic">Select to simulate rapid telemetry transitions</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                id="btn-preset-optimal"
                onClick={() => handleApplyPreset('optimal')}
                className="py-2 px-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 text-xs font-bold transition-all text-center"
              >
                🌱 Optimal Growth
              </button>
              <button
                id="btn-preset-heatwave"
                onClick={() => handleApplyPreset('heatwave')}
                className="py-2 px-3 rounded-xl border border-orange-500/20 bg-orange-950/20 text-orange-400 hover:bg-orange-950/40 text-xs font-bold transition-all text-center"
              >
                🔥 Heatwave Core
              </button>
              <button
                id="btn-preset-drought"
                onClick={() => handleApplyPreset('drought')}
                className="py-2 px-3 rounded-xl border border-red-500/20 bg-red-950/10 text-red-400 hover:bg-red-950/20 text-xs font-bold transition-all text-center"
              >
                🍂 Severe Drought
              </button>
              <button
                id="btn-preset-rain"
                onClick={() => handleApplyPreset('rain')}
                className="py-2 px-3 rounded-xl border border-blue-500/20 bg-blue-950/20 text-blue-400 hover:bg-blue-950/40 text-xs font-bold transition-all text-center"
              >
                🌧️ Heavy Rainfall
              </button>
              <button
                id="btn-preset-stress"
                onClick={() => handleApplyPreset('stress')}
                className="py-2 px-3 rounded-xl border border-amber-500/20 bg-amber-950/20 text-amber-400 hover:bg-amber-950/40 text-xs font-bold transition-all text-center col-span-2 sm:col-span-1"
              >
                🔬 Nitrogen Stress
              </button>
            </div>
          </div>

          {/* --- KPI HERO ANALYTICS PANEL --- */}
          <div id="telemetry-hero-cards" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Moisture Card */}
            <div id="kpi-moisture" className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
              <div className="flex justify-between items-start mb-2">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  Soil Moisture
                </p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activePlot.moisture < 20 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                  activePlot.moisture > 75 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {activePlot.moisture < 20 ? 'CRITICAL DRY' : activePlot.moisture > 75 ? 'SURPLUS WATER' : 'NOMINAL'}
                </span>
              </div>
              
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-blue-400">{activePlot.moisture}%</span>
                <span className={`text-xs ${activePlot.moisture < 25 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {activePlot.moisture < 25 ? '▼ critical' : '▲ stable'}
                </span>
              </div>
              
              {/* Dynamic Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    activePlot.moisture < 20 ? 'bg-red-400' : activePlot.moisture > 75 ? 'bg-blue-600' : 'bg-blue-400'
                  }`} 
                  style={{ width: `${activePlot.moisture}%` }} 
                />
              </div>

              {/* Live Interactive Sliders to manually override parameter */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Adjust Simulated Moisture:</span>
                  <span className="font-mono text-blue-400 font-bold">{activePlot.moisture}%</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="95" 
                  step="0.5"
                  value={activePlot.moisture} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setPlots(prev => prev.map(p => p.id === activePlot.id ? { ...p, moisture: val } : p));
                  }}
                  className="w-full accent-blue-400 cursor-pointer"
                />
              </div>
              <p className="text-[9px] text-slate-500 mt-1 italic group-hover:hidden">Hover or click plot to override moisture value manually</p>
            </div>

            {/* NDVI Health Index Card */}
            <div id="kpi-ndvi" className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
              <div className="flex justify-between items-start mb-2">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                  NDVI Health Index
                </p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activePlot.ndvi < 0.4 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {activePlot.ndvi < 0.4 ? 'DEFICIT' : 'OPTIMAL'}
                </span>
              </div>
              
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-emerald-400">{activePlot.ndvi}</span>
                <span className="text-xs text-emerald-400 text-opacity-70 font-mono">
                  {activePlot.ndvi < 0.4 ? 'VRA Nitrate Required' : 'Photosynthesis Peak'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-500" 
                  style={{ width: `${activePlot.ndvi * 100}%` }} 
                />
              </div>

              {/* Live Interactive Sliders to manually override parameter */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Adjust Simulated NDVI:</span>
                  <span className="font-mono text-emerald-400 font-bold">{activePlot.ndvi}</span>
                </div>
                <input 
                  type="range" 
                  min="0.10" 
                  max="1.00" 
                  step="0.01"
                  value={activePlot.ndvi} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setPlots(prev => prev.map(p => p.id === activePlot.id ? { ...p, ndvi: val } : p));
                  }}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
              <p className="text-[9px] text-slate-500 mt-1 italic group-hover:hidden">Hover or click plot to override NDVI health manually</p>
            </div>

            {/* Ambient Temp Card */}
            <div id="kpi-temp" className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl" />
              <div className="flex justify-between items-start mb-2">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                  Ambient Temp
                </p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activePlot.temp > 32 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {activePlot.temp > 32 ? 'THERMAL STRESS' : 'SAFE REGIME'}
                </span>
              </div>
              
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-orange-400">{activePlot.temp}°C</span>
                <span className={`text-xs ${activePlot.temp > 32 ? 'text-orange-400' : 'text-slate-400'}`}>
                  {activePlot.temp > 32 ? 'High Evap Index' : 'Foliage Friendly'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${activePlot.temp > 32 ? 'bg-orange-500' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.min(100, Math.max(10, (activePlot.temp / 45) * 100))}%` }} 
                />
              </div>

              {/* Live Interactive Sliders to manually override parameter */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Adjust Simulated Temp:</span>
                  <span className="font-mono text-orange-400 font-bold">{activePlot.temp}°C</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="45" 
                  step="0.5"
                  value={activePlot.temp} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setPlots(prev => prev.map(p => p.id === activePlot.id ? { ...p, temp: val } : p));
                  }}
                  className="w-full accent-orange-400 cursor-pointer"
                />
              </div>
              <p className="text-[9px] text-slate-500 mt-1 italic group-hover:hidden">Hover or click plot to override temperature value manually</p>
            </div>

          </div>

          {/* --- MAP & CHARTS PANEL --- */}
          <div id="field-and-trends-split" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SATELLITE FIELD PLOT GRID */}
            <div id="satellite-map-card" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-white">
                    <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '10s' }} />
                    Field Spatial Satellite Analysis
                  </h3>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-bold">Zone: Clover Creek</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Click any plot below to load its telemetry inside the dashboard inspector.</p>
              </div>

              {/* Interactive 4x3 Grid Map */}
              <div className="grid grid-cols-4 grid-rows-3 gap-2 p-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl min-h-[220px]">
                {plots.map(plot => {
                  const status = getPlotStatus(plot);
                  const isSelected = plot.id === selectedPlotId;
                  
                  return (
                    <button
                      key={plot.id}
                      id={`plot-${plot.id}`}
                      onClick={() => setSelectedPlotId(plot.id)}
                      className={`relative rounded-xl flex flex-col items-center justify-center p-2 border transition-all cursor-pointer ${
                        status === 'critical' 
                          ? 'bg-red-950/40 border-red-500/50 hover:bg-red-950/60 text-red-300' 
                          : status === 'warning'
                          ? 'bg-amber-950/40 border-amber-500/40 hover:bg-amber-950/60 text-amber-300'
                          : 'bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-950/30 text-emerald-300'
                      } ${isSelected ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950 scale-[1.03] shadow-lg shadow-emerald-500/10' : ''}`}
                    >
                      <span className="text-xs font-black tracking-tight">{plot.id}</span>
                      <span className="text-[8px] opacity-70 block text-slate-400 font-mono mt-0.5">{plot.crop.split(' ')[0]}</span>
                      
                      {/* Pulse Indicator on warning/critical plots */}
                      {status === 'critical' && (
                        <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                        </span>
                      )}
                      {status === 'warning' && (
                        <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Map Footer Metadata */}
              <div className="flex items-center justify-between mt-4 text-[10px] text-slate-500">
                <span className="flex items-center gap-1 font-mono">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  GPS Ref: 45.32°N, 122.67°W
                </span>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Nominal</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Warn</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Critical</span>
                </div>
              </div>
            </div>

            {/* TIME-SERIES TELEMETRY GRAPH */}
            <div id="historical-trends-card" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Historic Moisture Retention (72h)
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Plot {selectedPlotId}</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Time-series response of moisture retention vs daily thermal evaporation cycle.</p>
              </div>

              {/* Custom High-Fidelity SVG Interactive Chart */}
              <div className="relative w-full h-[180px] bg-slate-950/40 rounded-2xl border border-slate-800 p-2 flex flex-col justify-between">
                
                {/* Y-Axis Labels */}
                <div className="absolute left-2 top-2 bottom-6 flex flex-col justify-between text-[8px] text-slate-600 font-mono pointer-events-none">
                  <span>100%</span>
                  <span>50%</span>
                  <span>0%</span>
                </div>

                {/* SVG Drawing of area, lines, gridlines, and interactive points */}
                <div className="w-full h-full pl-6 pr-2 pb-5 pt-2 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Gradients */}
                    <defs>
                      <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal gridlines */}
                    <line x1="0" y1="0" x2="100" y2="0" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                    <line x1="0" y1="100" x2="100" y2="100" stroke="#1e293b" strokeWidth="0.5" />

                    {/* Critical Threshold Warning line (dashed red at 20% value i.e. y=80) */}
                    <line x1="0" y1="80" x2="100" y2="80" stroke="#ef4444" strokeWidth="0.75" strokeDasharray="4,2" opacity="0.6" />

                    {/* Generated Area SVG path */}
                    <path
                      d={`
                        M 0,${100 - historyData[0].moisture} 
                        L 20,${100 - historyData[1].moisture} 
                        L 40,${100 - historyData[2].moisture} 
                        L 60,${100 - historyData[3].moisture} 
                        L 80,${100 - historyData[4].moisture} 
                        L 100,${100 - historyData[5].moisture} 
                        L 100,100 L 0,100 Z
                      `}
                      fill="url(#chart-glow)"
                    />

                    {/* Generated Line path */}
                    <path
                      d={`
                        M 0,${100 - historyData[0].moisture} 
                        L 20,${100 - historyData[1].moisture} 
                        L 40,${100 - historyData[2].moisture} 
                        L 60,${100 - historyData[3].moisture} 
                        L 80,${100 - historyData[4].moisture} 
                        L 100,${100 - historyData[5].moisture}
                      `}
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="2"
                    />

                    {/* Plot Points */}
                    {historyData.map((d, i) => {
                      const x = i * 20;
                      const y = 100 - d.moisture;
                      return (
                        <g key={i} className="group/dot cursor-pointer">
                          <circle 
                            cx={x} 
                            cy={y} 
                            r="3" 
                            fill="#1e1b4b" 
                            stroke="#60a5fa" 
                            strokeWidth="1.5" 
                          />
                          <circle 
                            cx={x} 
                            cy={y} 
                            r="7" 
                            fill="#60a5fa" 
                            opacity="0" 
                            className="hover:opacity-30 transition-all"
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Absolute positioning X axis labels */}
                  <div className="absolute left-6 right-2 bottom-0 flex justify-between text-[8px] text-slate-500 font-mono mt-1">
                    {historyData.map((d, idx) => (
                      <span key={idx} className="w-12 text-center -ml-6 first:ml-0">{d.time}</span>
                    ))}
                  </div>

                  {/* Hover interactive labels display */}
                  <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 text-[9px] px-2 py-1 rounded text-slate-400 font-mono">
                    Live: <span className="text-blue-400 font-bold">{activePlot.moisture}%</span> | Temp: <span className="text-orange-400 font-bold">{activePlot.temp}°C</span>
                  </div>
                </div>
              </div>

              {/* Chart footer */}
              <div className="flex items-center justify-between text-[9px] text-slate-500 mt-2 font-mono">
                <span className="flex items-center gap-1 text-red-400">
                  <span className="inline-block w-2 border-t border-dashed border-red-500" />
                  Evaporation Limit (20% Min)
                </span>
                <span>Source: Soil Mesh Nodes</span>
              </div>
            </div>

          </div>

          {/* --- ACTIVE SECTOR INSPECTOR (Sub-feature of Field Map) --- */}
          <div id="sector-inspector-panel" className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                  getPlotStatus(activePlot) === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  getPlotStatus(activePlot) === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {activePlot.id}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Plot Inspector: {activePlot.name}
                    <span className="text-xs font-normal text-slate-400">({activePlot.crop})</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">{activePlot.gps}</p>
                </div>
              </div>

              {/* Inspector Quick Control Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  id={`btn-irrigate-${activePlot.id}`}
                  onClick={() => handleIrrigate(activePlot.id)}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-slate-950 font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all"
                >
                  <Droplets className="w-3.5 h-3.5" /> Trigger Irrigation
                </button>
                <button
                  id={`btn-fertilize-${activePlot.id}`}
                  onClick={() => handleFertilize(activePlot.id)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all"
                >
                  <Sprout className="w-3.5 h-3.5" /> Fertilize VRA
                </button>
                <button
                  id={`btn-drain-${activePlot.id}`}
                  onClick={() => handleCalibrate(activePlot.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> Drain Excess
                </button>
              </div>
            </div>

            {/* Interactive Grid of Sector parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Crop Stand</span>
                <span className="text-xs font-bold text-slate-200 mt-1">{activePlot.crop}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Moisture Level</span>
                <span className={`text-xs font-bold mt-1 ${activePlot.moisture < 20 ? 'text-red-400' : 'text-blue-400'}`}>{activePlot.moisture}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">NDVI Biomass</span>
                <span className={`text-xs font-bold mt-1 ${activePlot.ndvi < 0.4 ? 'text-amber-400' : 'text-emerald-400'}`}>{activePlot.ndvi}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Heat Regime</span>
                <span className={`text-xs font-bold mt-1 ${activePlot.temp > 32 ? 'text-orange-400' : 'text-slate-200'}`}>{activePlot.temp}°C</span>
              </div>
            </div>
          </div>

          {/* --- SEARCH / SECTORS DIRECTORY TABLE --- */}
          <div id="sectors-directory" className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Clover Creek Field Roster</h3>
                <p className="text-xs text-slate-400">Total telemetry coverage across 12 mesh sectors.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search sector or crop..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-emerald-500 transition-all w-full sm:w-64"
                />
              </div>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800/80">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800 font-bold">
                    <th className="p-3">Sector</th>
                    <th className="p-3">Crop Variety</th>
                    <th className="p-3">GPS Coordinate</th>
                    <th className="p-3">Soil Moisture</th>
                    <th className="p-3">NDVI index</th>
                    <th className="p-3">Temp</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Quick action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs">
                  {filteredPlots.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-slate-500 italic">No matching sectors found.</td>
                    </tr>
                  ) : (
                    filteredPlots.map(p => {
                      const status = getPlotStatus(p);
                      return (
                        <tr 
                          key={p.id} 
                          onClick={() => setSelectedPlotId(p.id)}
                          className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${p.id === selectedPlotId ? 'bg-slate-800/20' : ''}`}
                        >
                          <td className="p-3 font-bold text-white">{p.id}</td>
                          <td className="p-3 text-slate-300">{p.crop}</td>
                          <td className="p-3 text-slate-500 font-mono text-[10px]">{p.gps}</td>
                          <td className={`p-3 font-semibold ${p.moisture < 20 ? 'text-red-400' : 'text-blue-400'}`}>{p.moisture}%</td>
                          <td className={`p-3 font-semibold ${p.ndvi < 0.4 ? 'text-amber-400' : 'text-emerald-400'}`}>{p.ndvi}</td>
                          <td className={`p-3 ${p.temp > 32 ? 'text-orange-400' : 'text-slate-300'}`}>{p.temp}°C</td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              status === 'critical' ? 'bg-red-500/10 text-red-400' :
                              status === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleIrrigate(p.id)}
                              className="text-[10px] text-blue-400 hover:text-blue-300 bg-blue-500/5 hover:bg-blue-500/10 px-2 py-1 rounded border border-blue-500/10"
                            >
                              Irrigate
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- AGRONOMIST AI ASSISTANT BOX --- */}
          <div id="agronomist-ai-panel" className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AgriPulse AI Grounded Expert Advisor</h3>
                <p className="text-xs text-slate-400">Ask agronomy-grounded advice based on the active plot's real-time parameters.</p>
              </div>
            </div>

            <form onSubmit={handleAskAi} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Is it time to irrigate? or What does an NDVI of 0.38 signify?"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-all flex-1"
                />
                <button
                  type="submit"
                  disabled={isAiLoading}
                  className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:bg-slate-800 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
                >
                  {isAiLoading ? 'Analyzing...' : <>Ask AI <ArrowRight className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            </form>

            {aiResponse && (
              <div id="ai-response-box" className="mt-4 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed transition-all">
                {aiResponse}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500 items-center">
              <span>Quick Prompts:</span>
              <button 
                onClick={() => setAiQuestion(`Is Sector ${activePlot.id} in risk of heat damage?`)}
                className="bg-slate-800/50 hover:bg-slate-800 px-2 py-0.5 rounded text-slate-400 hover:text-slate-300"
              >
                "Heat damage?"
              </button>
              <button 
                onClick={() => setAiQuestion(`What is recommended for NDVI of ${activePlot.ndvi}?`)}
                className="bg-slate-800/50 hover:bg-slate-800 px-2 py-0.5 rounded text-slate-400 hover:text-slate-300"
              >
                "NDVI prescription?"
              </button>
              <button 
                onClick={() => setAiQuestion('How does waterlogging affect barley roots?')}
                className="bg-slate-800/50 hover:bg-slate-800 px-2 py-0.5 rounded text-slate-400 hover:text-slate-300"
              >
                "Waterlogging effects?"
              </button>
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: PRESCRIPTION FEED & ACTION LOGS (4cols) */}
        <aside id="sidebar-prescriptions" className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between">
          
          {/* Header Panel */}
          <div>
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-emerald-400" />
                  Localized Prescriptions
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase">Dynamic Advisory Node</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                allAlerts.length > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {allAlerts.length} Active Rx
              </span>
            </div>
            
            {/* Real-time Rule Alert Feed */}
            <div className="p-5 flex flex-col gap-4 max-h-[420px] overflow-y-auto">
              {allAlerts.length === 0 ? (
                <div className="p-6 text-center text-slate-500 italic flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <p className="text-xs">All fields currently nominal. No prescriptions triggered.</p>
                </div>
              ) : (
                allAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`p-4 rounded-2xl border transition-all ${
                      alert.type === 'critical' 
                        ? 'bg-red-500/10 border-red-500/20 text-red-100' 
                        : alert.type === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-100'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        alert.type === 'critical' ? 'text-red-400' : alert.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                      }`}>
                        {alert.type.toUpperCase()} Rx Triggered
                      </span>
                      <button 
                        onClick={() => dismissAlert(alert.id)}
                        className="text-slate-500 hover:text-slate-300"
                        title="Dismiss alert"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <h4 className="text-xs font-bold text-white mb-1">{alert.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{alert.message}</p>
                    
                    {alert.actionLabel && (
                      <button 
                        onClick={() => {
                          if (alert.actionType === 'irrigate') handleIrrigate(alert.plotId);
                          else if (alert.actionType === 'fertilize') handleFertilize(alert.plotId);
                          else handleCalibrate(alert.plotId);
                        }}
                        className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          alert.type === 'critical' 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : alert.type === 'warning'
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-600'
                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        }`}
                      >
                        {alert.actionLabel}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add custom prescription form */}
          <div className="p-5 border-t border-slate-800">
            <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-1">
              <Plus className="w-3 h-3 text-emerald-400" />
              Add Farmer Advisory Notes
            </h4>
            <form onSubmit={handleAddCustomPrescription} className="flex gap-2">
              <input
                type="text"
                placeholder="Log notes for Plot..."
                value={customPrescriptionText}
                onChange={(e) => setCustomPrescriptionText(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 transition-all flex-1"
              />
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-black px-3 py-2 rounded-xl text-xs"
              >
                Add
              </button>
            </form>
          </div>

          {/* Real-time Logs / Event Log Panel */}
          <div className="p-5 border-t border-slate-800 bg-slate-950/40">
            <h3 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-1.5">
              <Layers className="w-3 h-3" /> Live Event Streams
            </h3>
            <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1">
              {logs.map(log => (
                <div key={log.id} className="text-[10px] leading-relaxed flex items-start gap-2 border-b border-slate-900/40 pb-2">
                  <span className="text-slate-600 font-mono flex-shrink-0">{log.timestamp}</span>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      log.type === 'success' ? 'text-emerald-400' :
                      log.type === 'warning' ? 'text-amber-400' :
                      'text-slate-300'
                    }`}>
                      {log.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shapefile / CSV Map Exporter Component */}
          <div className="p-4 bg-slate-950/70 border-t border-slate-800">
            <button
              id="btn-export-map"
              onClick={handleExportMap}
              className="w-full flex items-center gap-3 p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl cursor-pointer transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Download className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white uppercase tracking-wider">Export Field Shapefiles</p>
                <p className="text-[9px] text-slate-500 font-mono truncate">SHAPEFILE_LATEST_Q2_2026.csv</p>
              </div>
            </button>
          </div>

        </aside>
      </div>

      {/* --- FOOTER REGULATION --- */}
      <footer id="agripulse-footer" className="mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-slate-900 pt-4 gap-4 text-center sm:text-left">
        <div className="flex flex-wrap justify-center sm:justify-start gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Predictive Engine Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mesh Node Connected (8/8)</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-600 font-mono">
          AGRI-OS v4.12.0 // PREDICTIVE_REVOLUTION_ACTIVE
        </div>
      </footer>
    </div>
  );
}
