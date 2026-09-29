import React, { useState, useEffect, useMemo } from 'react';
import { Map, Overlay } from 'pigeon-maps';
import { MOCK_FARMERS, generateVhiData } from '../constants';
import { FarmerData } from '../types';
import {
  Maximize2,
  Minimize2,
  Compass,
  AlertTriangle,
  Layers,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Crop,
  Globe,
  CheckCircle2,
  Target,
  Navigation,
  Sparkles
} from 'lucide-react';

// Map tile providers (Free, no API key required)
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

// Preset Punjab Agricultural Hubs
const PUNJAB_DISTRICTS = [
  { name: 'All Punjab', coords: [30.9010, 75.8573] as [number, number], zoom: 9 },
  { name: 'Ludhiana', coords: [30.9010, 75.8573] as [number, number], zoom: 12 },
  { name: 'Amritsar', coords: [31.6340, 74.8723] as [number, number], zoom: 12 },
  { name: 'Jalandhar', coords: [31.3260, 75.5762] as [number, number], zoom: 12 },
  { name: 'Patiala', coords: [30.3398, 76.3869] as [number, number], zoom: 12 },
  { name: 'Bathinda', coords: [30.2110, 74.9455] as [number, number], zoom: 12 },
  { name: 'Sangrur', coords: [30.2458, 75.8420] as [number, number], zoom: 12 },
];

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
  // Geographic offsets for 4 vertices: [dLat, dLng][]
  vertexOffsets: [number, number][];
  recommendation?: 'APPROVED' | 'REVIEW' | 'REJECTED';
}

const MapModule: React.FC<MapModuleProps> = ({ selectedFarmer, setSelectedFarmer, externalSearchTerm }) => {
  // Map state centered on Punjab
  const [center, setCenter] = useState<[number, number]>([30.9010, 75.8573]);
  const [zoom, setZoom] = useState(10);
  const [isScanning, setIsScanning] = useState(false);
  const [mapMode, setMapMode] = useState<'osm' | 'satellite'>('satellite');
  const [activeDistrictFilter, setActiveDistrictFilter] = useState<string>('All Punjab');

  useEffect(() => {
    if (selectedFarmer) {
      setCenter([selectedFarmer.location.lat, selectedFarmer.location.lng]);
      setZoom(14);
    }
  }, [selectedFarmer]);

  // Generate dense network of dynamic field parcels across Punjab
  const punjabParcels = useMemo(() => {
    const parcels: DynamicParcel[] = [];
    const colors = ['#10b981', '#06b6d4', '#eab308', '#8b5cf6', '#f97316', '#ec4899', '#3b82f6'];

    // Add main mock farmers
    MOCK_FARMERS.forEach((farmer, idx) => {
      const baseLat = farmer.location.lat;
      const baseLng = farmer.location.lng;

      // Primary farmer parcel
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

      // Generate 6 adjacent demarcated fields to form a continuous Punjab farm parcel network
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

  const handleMapClick = ({ latLng }: { latLng: [number, number] }) => {
    const [lat, lng] = latLng;

    const tempFarmer: FarmerData = {
      id: `PB-SCAN-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: `Punjab Sector (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
      district: "Manual Audit Sector",
      state: "Punjab",
      cropType: "Wheat / Paddy Rotation",
      acres: parseFloat((Math.random() * 8 + 4).toFixed(1)),
      location: { lat, lng },
      score: Math.floor(Math.random() * 400 + 500),
      soilMoisture: parseFloat((Math.random() * 30 + 20).toFixed(1)),
      harvestConsistency: Math.floor(Math.random() * 20 + 75),
      neighborhoodBenchmark: parseFloat((Math.random() * 10 - 5).toFixed(1)),
      gli: parseFloat((Math.random() * 0.4 + 0.35).toFixed(2)),
      recommendation: 'REVIEW',
      narrative: "",
      vhiData: generateVhiData(0.4),
      riskVectors: [
        { id: 'sb', name: 'Cadastral Audit', status: 'CLEAR', confidence: 0.91, description: 'User-initiated satellite land demarcation.' }
      ]
    };

    setSelectedFarmer(tempFarmer);
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1200);
  };

  return (
    <div className="relative h-full w-full bg-slate-950 overflow-hidden select-none">
      {/* Sleek Non-Overlapping Top Control Bar */}
      <div className="absolute top-5 left-6 right-6 z-40 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left Control Group */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Cadastral Grid Status Badge */}
          <div className="bg-slate-900/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-emerald-500/30 shadow-2xl flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_12px_#10b981]" />
            <span className="text-[10px] font-black text-white uppercase tracking-wider">Punjab Sector</span>
          </div>

          {/* Sleek Land Parcel Dropdown Selector */}
          <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl px-3 py-1.5 flex items-center gap-2">
            <Sparkles size={13} className="text-emerald-400" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Land Parcel:</span>
            <select
              value={selectedFarmer?.id || ''}
              onChange={(e) => {
                const found = MOCK_FARMERS.find(f => f.id === e.target.value);
                if (found) focusSelectedLand(found);
              }}
              className="bg-transparent text-white text-[11px] font-bold outline-none cursor-pointer pr-2"
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">Select Land Parcel...</option>
              {MOCK_FARMERS.map((farmer) => (
                <option key={farmer.id} value={farmer.id} className="bg-slate-900 text-white">
                  {farmer.id} — {farmer.name} ({farmer.district?.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right District Filter Bar */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto overflow-x-auto max-w-[480px]">
          {PUNJAB_DISTRICTS.map((dist, i) => (
            <button
              key={i}
              onClick={() => {
                setCenter(dist.coords);
                setZoom(dist.zoom);
                setActiveDistrictFilter(dist.name);
              }}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeDistrictFilter === dist.name
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-emerald-400'
              }`}
            >
              {dist.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map Engine */}
      <div className="absolute inset-0 z-0">
        <Map
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center);
            setZoom(zoom);
          }}
          onClick={handleMapClick}
          provider={mapMode === 'satellite' ? satelliteMapTiler : osmMapTiler}
          dprs={[1, 2]}
          animate={true}
        >
          {/* Render Dynamic Zoom-Responsive Land Parcels */}
          {punjabParcels.map((parcel) => {
            const isSelected = selectedFarmer?.id === parcel.farmerId;
            const strokeColor = parcel.color;

            // Compute Mercator Pixel Conversion Factors for current zoom and latitude
            const pxPerDegreeLng = (256 * Math.pow(2, zoom) / 360) * Math.cos(parcel.centerLat * Math.PI / 180);
            const pxPerDegreeLat = (256 * Math.pow(2, zoom) / 360);

            // Convert geographic lat/lng offsets to dynamic pixel coordinates relative to center
            const pixelPoints = parcel.vertexOffsets.map(([dLat, dLng]) => {
              const x = dLng * pxPerDegreeLng;
              const y = -dLat * pxPerDegreeLat;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(' ');

            // Calculate bounding width & height for SVG container
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
                    {/* Dynamically Scaled SVG Land Parcel Polygon */}
                    <svg
                      width={svgSizeX}
                      height={svgSizeY}
                      viewBox={`${-svgSizeX / 2} ${-svgSizeY / 2} ${svgSizeX} ${svgSizeY}`}
                      className="overflow-visible transition-all duration-150 transform group-hover:scale-105"
                    >
                      {/* Polygon shape that scales dynamically with map zoom */}
                      <polygon
                        points={pixelPoints}
                        fill={parcel.color}
                        fillOpacity={isSelected ? "0.38" : "0.22"}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? "3" : "2"}
                        strokeDasharray={isSelected ? "none" : "5 2.5"}
                        style={{
                          filter: isSelected
                            ? `drop-shadow(0 0 16px ${strokeColor})`
                            : `drop-shadow(0 0 6px ${strokeColor}44)`
                        }}
                      />

                      {/* Render Vertex corner dots dynamically */}
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

                      {/* Center Badge Pill */}
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

                    {/* Interactive Hover Card */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-900/95 backdrop-blur-xl text-white px-4 py-3 rounded-2xl border border-white/15 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none min-w-[170px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase text-slate-200">{parcel.name}</span>
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {parcel.district}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium">{parcel.crop} • {parcel.acres} Acres</p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[8px]">
                        <span className="text-slate-400">Lat: <strong className="text-white">{parcel.centerLat.toFixed(3)}</strong></span>
                        <span className="text-slate-400">Lng: <strong className="text-white">{parcel.centerLng.toFixed(3)}</strong></span>
                      </div>
                    </div>
                  </div>
                </Overlay>
              </React.Fragment>
            );
          })}
        </Map>
      </div>

      {/* Radar Scan Animation */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <div className="w-[480px] h-[480px] border-2 border-emerald-500/40 rounded-full animate-ping" />
          <div className="absolute w-[340px] h-[340px] border border-emerald-500/60 rounded-full" />
          <div className="absolute w-3.5 h-3.5 bg-emerald-400 rounded-full shadow-[0_0_35px_#10b981]" />
        </div>
      )}

      {/* HUD Right Controls */}
      <div className="absolute top-20 right-6 z-40 flex flex-col items-end gap-3">
        {/* Direct Action: Fly to Selected Land Piece */}
        <button
          onClick={() => focusSelectedLand()}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all transform hover:scale-105 active:scale-95 border border-emerald-300/50"
          title="Fly directly to selected land parcel"
        >
          <Target size={18} />
          <span>Fly To Selected Land</span>
        </button>

        <div className="bg-slate-900/80 backdrop-blur-xl flex flex-col rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <button onClick={() => setZoom(z => Math.min(z + 1, 18))} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:bg-white/5 hover:text-emerald-400 transition-all border-b border-white/5" title="Zoom In">
            <Maximize2 size={16} />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 1, 7))} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:bg-white/5 hover:text-emerald-400 transition-all" title="Zoom Out">
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
          className="bg-slate-900/80 backdrop-blur-xl w-12 h-12 flex items-center justify-center rounded-2xl border border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-2xl"
          onClick={() => { setCenter([30.9010, 75.8573]); setZoom(10); setActiveDistrictFilter('All Punjab'); }}
          title="Recenter to Punjab Central Sector"
        >
          <Compass size={18} />
        </button>
      </div>

      {/* Bottom Coordinates HUD */}
      <div className="absolute bottom-8 left-8 z-40 flex items-center gap-3">
        <div className="bg-slate-900/90 backdrop-blur-xl px-5 py-3 rounded-xl border border-white/10 shadow-2xl flex items-center gap-4">
          <Crop size={16} className="text-emerald-400" />
          <span className="text-[9px] font-mono font-bold text-slate-300">
            PUNJAB SECTOR • {center[0].toFixed(4)}°N / {center[1].toFixed(4)}°E • Zoom: {zoom}
          </span>
        </div>
      </div>

      {/* Instruction prompt */}
      {!selectedFarmer && (
        <div className="absolute inset-x-0 bottom-8 flex justify-center z-40 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-xl px-8 py-4 rounded-2xl border border-emerald-500/30 shadow-2xl flex items-center gap-4 animate-bounce">
            <MapPin size={18} className="text-emerald-400" />
            <span className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">Scroll & zoom Punjab map to view dynamic land parcel scale</span>
          </div>
        </div>
      )}

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.45) 100%)' }} />
    </div>
  );
};

export default MapModule;
