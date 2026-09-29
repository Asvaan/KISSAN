import React, { useState, useEffect, useMemo } from 'react';
import { Map, Overlay } from 'pigeon-maps';
import { MOCK_FARMERS, generateVhiData } from '../constants';
import { FarmerData } from '../types';
import {
  INDIA_NATIONAL_BORDER,
  INDIAN_STATES_BOUNDARIES,
  INDIA_REGION_PRESETS,
  StateBoundary
} from '../constants/indiaBoundaries';
import {
  fetchFarmerApiStats,
  FarmerApiStatResponse
} from '../services/farmerApiService';
import {
  Maximize2,
  Minimize2,
  Compass,
  Layers,
  MapPin,
  Crop,
  Globe,
  Sparkles,
  Target,
  Key,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  Flag,
  Activity,
  Zap,
  FileText
} from 'lucide-react';

// Map tile providers
const osmMapTiler = (x: number, y: number, z: number) => {
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
};

const satelliteMapTiler = (x: number, y: number, z: number) => {
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
};

interface MapModuleProps {
  selectedFarmer: FarmerData | null;
  setSelectedFarmer: (farmer: FarmerData) => void;
  externalSearchTerm?: string;
}

interface DynamicParcel {
  id: string;
  farmerId: string;
  name: string;
  district: string;
  crop: string;
  acres: number;
  centerLat: number;
  centerLng: number;
  color: string;
  vertexOffsets: [number, number][];
  recommendation?: 'APPROVED' | 'REVIEW' | 'REJECTED';
}

const MapModule: React.FC<MapModuleProps> = ({ selectedFarmer, setSelectedFarmer, externalSearchTerm }) => {
  // Map viewport state - default centered on Entire India
  const [center, setCenter] = useState<[number, number]>([22.5937, 78.9629]);
  const [zoom, setZoom] = useState<number>(5);
  const [isScanning, setIsScanning] = useState(false);
  const [mapMode, setMapMode] = useState<'osm' | 'satellite'>('satellite');

  // Vector Border Toggles
  const [showIndiaBorder, setShowIndiaBorder] = useState(true);
  const [showStateBorders, setShowStateBorders] = useState(true);
  const [showCadastralParcels, setShowCadastralParcels] = useState(true);

  // Selected State / Region State
  const [activeRegionName, setActiveRegionName] = useState<string>('Entire India');
  const [selectedState, setSelectedState] = useState<StateBoundary | null>(null);

  // Farmer API Integration State (apifarmer.com)
  const [apiKeyInput, setApiKeyInput] = useState<string>(
    (import.meta as any).env?.VITE_FARMER_API_KEY || 'demo_kisan_api_key_2026'
  );
  const [activeApiKey, setActiveApiKey] = useState<string>(
    (import.meta as any).env?.VITE_FARMER_API_KEY || 'demo_kisan_api_key_2026'
  );
  const [showApiModal, setShowApiModal] = useState<boolean>(false);
  const [apiStats, setApiStats] = useState<FarmerApiStatResponse | null>(null);
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [apiStatusMessage, setApiStatusMessage] = useState<string>('Connected');

  // Load Farmer API telemetry on mount and on API key change
  useEffect(() => {
    let isMounted = true;
    setIsApiLoading(true);
    fetchFarmerApiStats(activeApiKey).then((res) => {
      if (isMounted) {
        setApiStats(res.data);
        setIsApiLoading(false);
        if (res.isMock) {
          setApiStatusMessage('Simulated Fallback (Telemetry Active)');
        } else {
          setApiStatusMessage('Live apifarmer.com Verified');
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [activeApiKey]);

  useEffect(() => {
    if (selectedFarmer) {
      setCenter([selectedFarmer.location.lat, selectedFarmer.location.lng]);
      setZoom(13.5);
    }
  }, [selectedFarmer]);

  // Generate dense network of dynamic field parcels across Punjab
  const punjabParcels = useMemo(() => {
    const parcels: DynamicParcel[] = [];
    const colors = ['#10b981', '#06b6d4', '#eab308', '#8b5cf6', '#f97316', '#ec4899', '#3b82f6'];

    MOCK_FARMERS.forEach((farmer, idx) => {
      const baseLat = farmer.location.lat;
      const baseLng = farmer.location.lng;

      parcels.push({
        id: farmer.id,
        farmerId: farmer.id,
        name: farmer.name,
        district: farmer.district || 'Punjab Sector',
        crop: farmer.cropType || 'Basmati Paddy',
        acres: farmer.acres || 12.0,
        centerLat: baseLat,
        centerLng: baseLng,
        color: farmer.themeColor || '#10b981',
        vertexOffsets: [
          [-0.0035, -0.0040],
          [0.0030, -0.0045],
          [0.0040, 0.0035],
          [-0.0025, 0.0045]
        ],
        recommendation: farmer.recommendation
      });

      const gridPositions = [
        [0.007, 0.005],
        [-0.006, 0.007],
        [0.008, -0.006],
        [-0.005, -0.008],
        [0.011, 0.001],
        [-0.010, -0.002]
      ];

      gridPositions.forEach((pos, pIdx) => {
        const pLat = baseLat + pos[0];
        const pLng = baseLng + pos[1];
        const color = colors[(idx * 3 + pIdx) % colors.length];

        parcels.push({
          id: `${farmer.id}-PARCEL-${pIdx + 1}`,
          farmerId: farmer.id,
          name: `${farmer.district?.split(' ')[0]} Field #${pIdx + 1}`,
          district: farmer.district || 'Punjab Sector',
          crop: pIdx % 2 === 0 ? 'Wheat Crop' : 'Basmati Paddy',
          acres: parseFloat((Math.random() * 6 + 4).toFixed(1)),
          centerLat: pLat,
          centerLng: pLng,
          color: color,
          vertexOffsets: [
            [-0.0025 - (pIdx * 0.0003), -0.0030],
            [0.0025 + (pIdx * 0.0002), -0.0035],
            [0.0030, 0.0030 + (pIdx * 0.0002)],
            [-0.0020, 0.0035]
          ]
        });
      });
    });

    return parcels;
  }, []);

  const focusSelectedLand = (farmerToFocus?: FarmerData) => {
    const target = farmerToFocus || selectedFarmer || MOCK_FARMERS[0];
    if (target) {
      setSelectedFarmer(target);
      setCenter([target.location.lat, target.location.lng]);
      setZoom(15);
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 1500);
    }
  };

  const handleMarkerClick = (farmer: FarmerData) => {
    setSelectedFarmer(farmer);
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1500);
  };

  const handleStateClick = (state: StateBoundary) => {
    setSelectedState(state);
    setCenter(state.center);
    setZoom(state.defaultZoom);
    setActiveRegionName(state.name);
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1200);
  };

  const handleApplyApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKeyInput.trim()) {
      setActiveApiKey(apiKeyInput.trim());
      setShowApiModal(false);
    }
  };

  // Helper for computing projection pixel offsets for any lat/lng array relative to anchor
  const computePolygonProjection = (
    polygon: [number, number][],
    anchorLat: number,
    anchorLng: number,
    currentZoom: number
  ) => {
    const pxPerDegreeLng = (256 * Math.pow(2, currentZoom) / 360) * Math.cos(anchorLat * Math.PI / 180);
    const pxPerDegreeLat = (256 * Math.pow(2, currentZoom) / 360);

    const projectedPoints = polygon.map(([lat, lng]) => {
      const vx = (lng - anchorLng) * pxPerDegreeLng;
      const vy = -(lat - anchorLat) * pxPerDegreeLat;
      return { vx, vy, lat, lng };
    });

    const xs = projectedPoints.map(p => p.vx);
    const ys = projectedPoints.map(p => p.vy);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = Math.max(160, Math.ceil(maxX - minX) + 60);
    const height = Math.max(160, Math.ceil(maxY - minY) + 60);

    const viewBoxMinX = minX - 30;
    const viewBoxMinY = minY - 30;

    const svgPointsStr = projectedPoints.map(p => `${p.vx.toFixed(1)},${p.vy.toFixed(1)}`).join(' ');

    return {
      projectedPoints,
      svgPointsStr,
      width,
      height,
      viewBox: `${viewBoxMinX.toFixed(1)} ${viewBoxMinY.toFixed(1)} ${width} ${height}`,
      offset: [-viewBoxMinX, -viewBoxMinY] as [number, number]
    };
  };

  // Projected India National Boundary
  const indiaNationalProj = useMemo(() => {
    return computePolygonProjection(INDIA_NATIONAL_BORDER, 22.5937, 78.9629, zoom);
  }, [zoom]);

  return (
    <div className="relative h-full w-full bg-slate-950 overflow-hidden select-none font-sans">
      {/* --- TOP CONTROL HUD BAR --- */}
      <div className="absolute top-4 left-6 right-6 z-40 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left Group: Sovereign Status & apifarmer.com Live API Badge */}
        <div className="flex flex-wrap items-center gap-3 pointer-events-auto">
          {/* Sovereign India Badge */}
          <div className="bg-slate-900/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-cyan-500/40 shadow-2xl flex items-center gap-3">
            <span className="text-base">🇮🇳</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-white uppercase tracking-wider">India Sovereign Boundary</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shadow-[0_0_12px_#06b6d4]" />
              </div>
              <span className="text-[9px] font-mono text-cyan-400 font-bold">28 States & UTs Demarcated</span>
            </div>
          </div>

          {/* apifarmer.com API Live Integration Status Badge */}
          <button
            onClick={() => setShowApiModal(true)}
            className="bg-slate-900/90 backdrop-blur-xl hover:bg-slate-800/90 px-4 py-2 rounded-2xl border border-emerald-500/40 shadow-2xl flex items-center gap-3 transition-all group cursor-pointer"
            title="Click to configure apifarmer.com API Key"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Radio size={16} className={isApiLoading ? "animate-spin text-emerald-400" : "animate-pulse"} />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Farmer API Endpoint:</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  api.apifarmer.com <Key size={10} className="text-amber-400" />
                </span>
              </div>
              <p className="text-[9px] font-medium text-slate-300">
                {apiStats ? `${(apiStats.totalFarmers / 10000000).toFixed(1)} Cr Farmers • ${(apiStats.totalHectares / 10000000).toFixed(1)} Cr Ha` : 'Connecting...'}
              </p>
            </div>
          </button>
        </div>

        {/* Right Group: Vector Layers & Regional Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto">
          
          {/* Vector Layer Toggles */}
          <div className="flex items-center gap-1.5 border-r border-white/10 pr-2">
            <button
              onClick={() => setShowIndiaBorder(v => !v)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                showIndiaBorder
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.6)] font-extrabold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
              title="Toggle India National Outer Perimeter Vector"
            >
              <Flag size={11} />
              <span>India Border</span>
            </button>

            <button
              onClick={() => setShowStateBorders(v => !v)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                showStateBorders
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.6)] font-extrabold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
              title="Toggle All Indian State Boundary Vectors"
            >
              <Globe size={11} />
              <span>State Borders</span>
            </button>

            <button
              onClick={() => setShowCadastralParcels(v => !v)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                showCadastralParcels
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.6)] font-extrabold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
              title="Toggle Local Cadastral Farm Parcels"
            >
              <Crop size={11} />
              <span>Farm Parcels</span>
            </button>
          </div>

          {/* Region Jump Dropdown */}
          <div className="relative flex items-center gap-2 pl-1">
            <Sparkles size={13} className="text-amber-400" />
            <select
              value={activeRegionName}
              onChange={(e) => {
                const targetName = e.target.value;
                setActiveRegionName(targetName);
                const reg = INDIA_REGION_PRESETS.find(r => r.name === targetName);
                if (reg) {
                  setCenter(reg.coords);
                  setZoom(reg.zoom);
                  setSelectedState(null);
                } else {
                  const st = INDIAN_STATES_BOUNDARIES.find(s => s.name === targetName);
                  if (st) handleStateClick(st);
                }
              }}
              className="bg-slate-950 text-white text-[11px] font-black outline-none cursor-pointer pr-3 py-1 rounded-xl border border-white/10"
            >
              <optgroup label="🇮🇳 National & Zonal Regions">
                {INDIA_REGION_PRESETS.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name} ({r.description.split('(')[0]})
                  </option>
                ))}
              </optgroup>

              <optgroup label="🌾 Indian Agricultural States">
                {INDIAN_STATES_BOUNDARIES.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name} State ({st.primaryCrops[0]})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* --- MAP ENGINE CANVAS --- */}
      <div className="absolute inset-0 z-0">
        <Map
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center);
            setZoom(zoom);
          }}
          onClick={() => {
            setSelectedState(null);
          }}
          provider={mapMode === 'satellite' ? satelliteMapTiler : osmMapTiler}
          dprs={[1, 2]}
          animate={true}
        >

          {/* --- 1. INDIA NATIONAL OUTER BOUNDARY VECTOR PERIMETER --- */}
          {showIndiaBorder && (
            <Overlay anchor={[22.5937, 78.9629]} offset={indiaNationalProj.offset}>
              <div className="relative pointer-events-none">
                <svg
                  width={indiaNationalProj.width}
                  height={indiaNationalProj.height}
                  viewBox={indiaNationalProj.viewBox}
                  className="overflow-visible"
                >
                  <defs>
                    <linearGradient id="indiaGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                    </linearGradient>

                    <radialGradient id="indiaFillGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.12" />
                      <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                    </radialGradient>

                    <filter id="cyanNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Shaded Area for Entire India */}
                  <polygon
                    points={indiaNationalProj.svgPointsStr}
                    fill="url(#indiaFillGlow)"
                    stroke="url(#indiaGlow)"
                    strokeWidth={zoom <= 6 ? "4" : "3"}
                    strokeDasharray="12 6"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    filter="url(#cyanNeonGlow)"
                  />

                  {/* Outer Pulsing Outline */}
                  <polygon
                    points={indiaNationalProj.svgPointsStr}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeOpacity="0.9"
                  />

                  {/* Key Vertex Perimeter Beacon Nodes (Siachen, Kibithu, Kanyakumari, Rann of Kutch) */}
                  {indiaNationalProj.projectedPoints.map((pt, i) => {
                    if (i % 4 === 0) {
                      return (
                        <g key={i}>
                          <circle
                            cx={pt.vx}
                            cy={pt.vy}
                            r={zoom <= 6 ? "5" : "3.5"}
                            fill="#06b6d4"
                            className="animate-ping"
                          />
                          <circle
                            cx={pt.vx}
                            cy={pt.vy}
                            r={zoom <= 6 ? "4" : "3"}
                            fill="#ffffff"
                            stroke="#06b6d4"
                            strokeWidth="2"
                          />
                        </g>
                      );
                    }
                    return null;
                  })}

                  {/* Center Label for National Boundary when zoomed out */}
                  {zoom <= 6 && (
                    <g transform="translate(0, -20)">
                      <rect
                        x="-110"
                        y="-16"
                        width="220"
                        height="32"
                        rx="16"
                        fill="rgba(15, 23, 42, 0.95)"
                        stroke="#06b6d4"
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="10"
                        fontWeight="900"
                        letterSpacing="1.5"
                        fontFamily="sans-serif"
                      >
                        🇮🇳 INDIA SOVEREIGN BORDER
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            </Overlay>
          )}

          {/* --- 2. INDIAN STATE BOUNDARY POLYGONS & AGRI INTELLIGENCE VECTORS --- */}
          {showStateBorders && INDIAN_STATES_BOUNDARIES.map((st) => {
            const stateProj = computePolygonProjection(st.polygon, st.center[0], st.center[1], zoom);
            const isStateSelected = selectedState?.id === st.id;
            const strokeColor = st.color;

            return (
              <React.Fragment key={st.id}>
                <Overlay anchor={st.center} offset={stateProj.offset}>
                  <div
                    className="relative cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStateClick(st);
                    }}
                  >
                    <svg
                      width={stateProj.width}
                      height={stateProj.height}
                      viewBox={stateProj.viewBox}
                      className="overflow-visible transition-all duration-300"
                    >
                      {/* State Boundary Polygon */}
                      <polygon
                        points={stateProj.svgPointsStr}
                        fill={st.color}
                        fillOpacity={isStateSelected ? "0.35" : "0.18"}
                        stroke={strokeColor}
                        strokeWidth={isStateSelected ? "3.5" : "2"}
                        strokeDasharray={isStateSelected ? "none" : "6 3"}
                        style={{
                          filter: isStateSelected
                            ? `drop-shadow(0 0 20px ${strokeColor})`
                            : `drop-shadow(0 0 8px ${strokeColor}66)`
                        }}
                      />

                      {/* Vertex points */}
                      {stateProj.projectedPoints.map((vPt, vIdx) => (
                        <circle
                          key={vIdx}
                          cx={vPt.vx}
                          cy={vPt.vy}
                          r={isStateSelected ? "3.5" : "2.5"}
                          fill={strokeColor}
                        />
                      ))}

                      {/* State Name & Quick Agrarian Badge at State Center */}
                      {zoom >= 6.0 && (
                        <g transform="translate(0, 0)">
                          <rect
                            x="-55"
                            y="-14"
                            width="110"
                            height="28"
                            rx="8"
                            fill="rgba(15, 23, 42, 0.95)"
                            stroke={strokeColor}
                            strokeWidth={isStateSelected ? "2" : "1.2"}
                          />
                          <text
                            x="0"
                            y="-2"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="900"
                            fontFamily="sans-serif"
                          >
                            {st.name} State
                          </text>
                          <text
                            x="0"
                            y="8"
                            textAnchor="middle"
                            fill={strokeColor}
                            fontSize="7.5"
                            fontWeight="800"
                            fontFamily="sans-serif"
                          >
                            {st.farmersCount} Farmers
                          </text>
                        </g>
                      )}
                    </svg>

                    {/* Interactive State Intelligence Hover Card */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-2xl border border-white/20 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none min-w-[240px]">
                      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                          <span className="text-xs font-black uppercase text-white tracking-wide">{st.name} State</span>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                          {st.capital}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[9px] mb-2">
                        <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
                          <span className="text-slate-400 block font-medium">Farmers Count:</span>
                          <strong className="text-emerald-400 font-black text-xs">{st.farmersCount}</strong>
                        </div>
                        <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
                          <span className="text-slate-400 block font-medium">Agri Area:</span>
                          <strong className="text-cyan-400 font-black text-xs">{st.hectares}</strong>
                        </div>
                      </div>

                      <div className="space-y-1 text-[9px] pt-1">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Primary Crops:</span>
                          <span className="font-bold text-amber-400">{st.primaryCrops.join(', ')}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Vegetation Health (VHI):</span>
                          <span className="font-bold text-emerald-400">{(st.vhiScore * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Stubble Burn Risk:</span>
                          <span className={`font-black ${st.stubbleBurningRisk === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {st.stubbleBurningRisk}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Overlay>
              </React.Fragment>
            );
          })}

          {/* --- 3. DYNAMIC LOCAL CADASTRAL FARM PARCELS (PUNJAB & REGIONAL) --- */}
          {showCadastralParcels && punjabParcels.map((parcel) => {
            const isSelected = selectedFarmer?.id === parcel.farmerId;
            const strokeColor = parcel.color;

            const pxPerDegreeLng = (256 * Math.pow(2, zoom) / 360) * Math.cos(parcel.centerLat * Math.PI / 180);
            const pxPerDegreeLat = (256 * Math.pow(2, zoom) / 360);

            const pixelPoints = parcel.vertexOffsets.map(([dLat, dLng]) => {
              const x = dLng * pxPerDegreeLng;
              const y = -dLat * pxPerDegreeLat;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(' ');

            const maxPxX = Math.max(...parcel.vertexOffsets.map(([_, dLng]) => Math.abs(dLng * pxPerDegreeLng))) + 30;
            const maxPxY = Math.max(...parcel.vertexOffsets.map(([dLat, _]) => Math.abs(dLat * pxPerDegreeLat))) + 30;
            const svgSizeX = Math.max(120, maxPxX * 2);
            const svgSizeY = Math.max(120, maxPxY * 2);

            const matchingFarmer = MOCK_FARMERS.find(f => f.id === parcel.farmerId);

            return (
              <React.Fragment key={parcel.id}>
                <Overlay
                  anchor={[parcel.centerLat, parcel.centerLng]}
                  offset={[svgSizeX / 2, svgSizeY / 2]}
                >
                  <div
                    className="relative cursor-pointer group"
                    onClick={(e) => {
                      if (matchingFarmer) {
                        e.stopPropagation();
                        handleMarkerClick(matchingFarmer);
                      }
                    }}
                  >
                    <svg
                      width={svgSizeX}
                      height={svgSizeY}
                      viewBox={`${-svgSizeX / 2} ${-svgSizeY / 2} ${svgSizeX} ${svgSizeY}`}
                      className="overflow-visible transition-all duration-150 transform group-hover:scale-105"
                    >
                      <polygon
                        points={pixelPoints}
                        fill={parcel.color}
                        fillOpacity={isSelected ? "0.45" : "0.25"}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? "3" : "2"}
                        strokeDasharray={isSelected ? "none" : "5 2.5"}
                        style={{
                          filter: isSelected
                            ? `drop-shadow(0 0 16px ${strokeColor})`
                            : `drop-shadow(0 0 6px ${strokeColor}44)`
                        }}
                      />

                      {parcel.vertexOffsets.map(([dLat, dLng], vIdx) => {
                        const vx = dLng * pxPerDegreeLng;
                        const vy = -dLat * pxPerDegreeLat;
                        return (
                          <circle
                            key={vIdx}
                            cx={vx}
                            cy={vy}
                            r={isSelected ? "4" : "2.5"}
                            fill={strokeColor}
                          />
                        );
                      })}

                      {zoom >= 10 && (
                        <g transform="translate(0, 0)">
                          <rect
                            x="-40"
                            y="-12"
                            width="80"
                            height="24"
                            rx="6"
                            fill="rgba(15, 23, 42, 0.9)"
                            stroke={strokeColor}
                            strokeWidth="1.2"
                          />
                          <text
                            x="0"
                            y="-1"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="8"
                            fontWeight="900"
                            fontFamily="sans-serif"
                          >
                            {parcel.id}
                          </text>
                          <text
                            x="0"
                            y="8"
                            textAnchor="middle"
                            fill={strokeColor}
                            fontSize="7"
                            fontWeight="800"
                            fontFamily="sans-serif"
                          >
                            {parcel.acres} Acres
                          </text>
                        </g>
                      )}
                    </svg>
                  </div>
                </Overlay>
              </React.Fragment>
            );
          })}
        </Map>
      </div>

      {/* Radar Scan Pulse Effect */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <div className="w-[520px] h-[520px] border-2 border-cyan-500/40 rounded-full animate-ping" />
          <div className="absolute w-[360px] h-[360px] border border-cyan-500/60 rounded-full" />
          <div className="absolute w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_35px_#06b6d4]" />
        </div>
      )}

      {/* --- HUD RIGHT CONTROLS --- */}
      <div className="absolute top-20 right-6 z-40 flex flex-col items-end gap-3">
        <button
          onClick={() => focusSelectedLand()}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all transform hover:scale-105 active:scale-95 border border-emerald-300/50"
          title="Fly directly to selected land parcel"
        >
          <Target size={18} />
          <span>Fly To Selected Land</span>
        </button>

        <div className="bg-slate-900/80 backdrop-blur-xl flex flex-col rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <button
            onClick={() => setZoom(z => Math.min(z + 1, 18))}
            className="w-12 h-12 flex items-center justify-center text-slate-400 hover:bg-white/5 hover:text-emerald-400 transition-all border-b border-white/5"
            title="Zoom In"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 1, 4))}
            className="w-12 h-12 flex items-center justify-center text-slate-400 hover:bg-white/5 hover:text-emerald-400 transition-all"
            title="Zoom Out"
          >
            <Minimize2 size={16} />
          </button>
        </div>

        <button
          className={`bg-slate-900/80 backdrop-blur-xl w-12 h-12 flex items-center justify-center rounded-2xl border ${mapMode === 'satellite' ? 'border-emerald-500 text-emerald-400' : 'border-white/10 text-slate-400'} hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-2xl`}
          onClick={() => setMapMode(m => m === 'osm' ? 'satellite' : 'osm')}
          title={`Switch to ${mapMode === 'osm' ? 'Satellite' : 'OpenStreetMap'} View`}
        >
          <Layers size={18} />
        </button>

        <button
          className="bg-slate-900/80 backdrop-blur-xl w-12 h-12 flex items-center justify-center rounded-2xl border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all shadow-2xl"
          onClick={() => {
            setCenter([22.5937, 78.9629]);
            setZoom(5);
            setActiveRegionName('Entire India');
            setSelectedState(null);
          }}
          title="Recenter Map to Entire India National Boundary"
        >
          <Compass size={18} />
        </button>
      </div>

      {/* --- BOTTOM TELEMETRY HUD BAR --- */}
      <div className="absolute bottom-6 left-6 z-40 flex items-center gap-3">
        <div className="bg-slate-900/90 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4">
          <Globe size={16} className="text-cyan-400" />
          <span className="text-[10px] font-mono font-bold text-slate-300">
            SOVEREIGN MAP • {center[0].toFixed(4)}°N / {center[1].toFixed(4)}°E • Zoom: {zoom}
          </span>
        </div>

        {/* Selected State Badge */}
        {selectedState && (
          <div className="bg-slate-900/90 backdrop-blur-xl px-5 py-3 rounded-2xl border border-amber-500/40 shadow-2xl flex items-center gap-3 animate-in fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-black text-amber-400 uppercase tracking-wide">
              {selectedState.name} State Active
            </span>
          </div>
        )}
      </div>

      {/* --- FARMER API KEY CONFIGURATION MODAL --- */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
          <div className="bg-slate-900 text-white rounded-3xl border border-emerald-500/40 p-8 max-w-lg w-full shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">apifarmer.com API Setup</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Configure live telemetry endpoint credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold px-2 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyApiKey} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Target API Endpoint URL
                </label>
                <input
                  type="text"
                  readOnly
                  value="https://api.apifarmer.com/api/v0/stat"
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs font-mono text-cyan-400 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Farmer API Key (<code className="text-amber-400">api-key</code>)
                </label>
                <input
                  type="text"
                  placeholder="Enter your Farmer API Key..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-slate-950 border border-emerald-500/40 focus:border-emerald-400 rounded-2xl px-4 py-3 text-xs font-mono text-white outline-none shadow-inner"
                />
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-2 text-[10px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span>API Status:</span>
                  <span className="font-mono font-bold text-emerald-400">{apiStatusMessage}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>National Coverage:</span>
                  <span className="font-mono font-bold text-cyan-400">14.6 Crore Farmers (28 States)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApiModal(false)}
                  className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  <span>Connect & Sync</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subtle Map Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.45) 100%)' }} />
    </div>
  );
};

export default MapModule;
