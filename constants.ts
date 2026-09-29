import { FarmerData } from './types';

export const generateVhiData = (base: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((m, i) => ({
    month: m,
    value: Math.max(0.1, base + Math.sin(i * 0.5) * 0.3 + (Math.random() * 0.1))
  }));
};

export const MOCK_FARMERS: FarmerData[] = [
  // --- PUNJAB FARMERS & CADASTRAL SECTORS ---
  {
    id: "PB-LDH-101",
    name: "Gurpreet Singh",
    state: "Punjab",
    district: "Ludhiana (Central)",
    cropType: "Basmati Paddy & Wheat",
    themeColor: "#10b981", // Emerald Green
    acres: 12.5,
    location: { lat: 30.9010, lng: 75.8573 },
    score: 885,
    soilMoisture: 45.2,
    harvestConsistency: 95,
    neighborhoodBenchmark: 22.4,
    gli: 0.78,
    recommendation: 'APPROVED',
    narrative: "",
    vhiData: generateVhiData(0.55),
    boundaryOffsets: [
      [-0.003, -0.004],
      [0.003, -0.005],
      [0.004, 0.004],
      [-0.002, 0.005]
    ],
    riskVectors: [{ id: 'sb', name: 'Stubble Burning', status: 'CLEAR', confidence: 0.99, description: 'Zero thermal anomaly detected.' }]
  },
  {
    id: "PB-LDH-102",
    name: "Harbhajan Gill",
    state: "Punjab",
    district: "Ludhiana (North)",
    cropType: "Wheat Field",
    themeColor: "#ef4444", // Red Violation
    acres: 18.2,
    location: { lat: 30.9180, lng: 75.8320 },
    score: 410,
    soilMoisture: 22.4,
    harvestConsistency: 52,
    neighborhoodBenchmark: -14.2,
    gli: 0.32,
    recommendation: 'REJECTED',
    narrative: "",
    vhiData: generateVhiData(0.25),
    boundaryOffsets: [
      [-0.004, -0.003],
      [0.002, -0.005],
      [0.005, 0.002],
      [-0.001, 0.006]
    ],
    riskVectors: [{ id: 'sb', name: 'Stubble Burning', status: 'VIOLATION', confidence: 0.96, description: 'Active fire hazard detected.' }]
  },
  {
    id: "PB-ASR-201",
    name: "Manpreet Dhillon",
    state: "Punjab",
    district: "Amritsar",
    cropType: "Export Basmati",
    themeColor: "#06b6d4", // Electric Cyan
    acres: 15.0,
    location: { lat: 31.6340, lng: 74.8723 },
    score: 910,
    soilMoisture: 54.0,
    harvestConsistency: 97,
    neighborhoodBenchmark: 28.1,
    gli: 0.85,
    recommendation: 'APPROVED',
    narrative: "",
    vhiData: generateVhiData(0.62),
    boundaryOffsets: [
      [-0.005, -0.004],
      [0.004, -0.005],
      [0.005, 0.004],
      [-0.003, 0.005]
    ],
    riskVectors: [{ id: 'gc', name: 'Crop Signature', status: 'CLEAR', confidence: 0.98, description: 'Pristine Basmati canopy.' }]
  },
  {
    id: "PB-ASR-202",
    name: "Jagjit Sandhu",
    state: "Punjab",
    district: "Amritsar (East)",
    cropType: "Mustard & Maize",
    themeColor: "#eab308", // Gold Yellow
    acres: 9.8,
    location: { lat: 31.6520, lng: 74.8950 },
    score: 615,
    soilMoisture: 29.5,
    harvestConsistency: 71,
    neighborhoodBenchmark: -2.8,
    gli: 0.52,
    recommendation: 'REVIEW',
    narrative: "",
    vhiData: generateVhiData(0.38),
    boundaryOffsets: [
      [-0.003, -0.003],
      [0.002, -0.004],
      [0.004, 0.003],
      [-0.002, 0.004]
    ],
    riskVectors: [{ id: 'lu', name: 'Land Boundary', status: 'WARNING', confidence: 0.79, description: 'Storage shed warning.' }]
  },
  {
    id: "PB-JAL-301",
    name: "Jasvir Singh Bains",
    state: "Punjab",
    district: "Jalandhar",
    cropType: "Seed Potato & Maize",
    themeColor: "#8b5cf6", // Purple
    acres: 11.4,
    location: { lat: 31.3260, lng: 75.5762 },
    score: 860,
    soilMoisture: 48.0,
    harvestConsistency: 93,
    neighborhoodBenchmark: 19.8,
    gli: 0.76,
    recommendation: 'APPROVED',
    narrative: "",
    vhiData: generateVhiData(0.58),
    boundaryOffsets: [
      [-0.004, -0.004],
      [0.003, -0.004],
      [0.004, 0.004],
      [-0.002, 0.005]
    ],
    riskVectors: [{ id: 'gc', name: 'Potato Crop', status: 'CLEAR', confidence: 0.97, description: 'Certified seed plot.' }]
  },
  {
    id: "PB-PTL-401",
    name: "Amrik Singh Sidhu",
    state: "Punjab",
    district: "Patiala",
    cropType: "Wheat & Cotton",
    themeColor: "#10b981", // Emerald
    acres: 16.0,
    location: { lat: 30.3398, lng: 76.3869 },
    score: 890,
    soilMoisture: 50.5,
    harvestConsistency: 96,
    neighborhoodBenchmark: 25.0,
    gli: 0.81,
    recommendation: 'APPROVED',
    narrative: "",
    vhiData: generateVhiData(0.60),
    boundaryOffsets: [
      [-0.005, -0.005],
      [0.004, -0.005],
      [0.005, 0.005],
      [-0.003, 0.006]
    ],
    riskVectors: [{ id: 'sb', name: 'Stubble Burning', status: 'CLEAR', confidence: 0.99, description: 'Bio-compost practice.' }]
  },
  {
    id: "PB-BTI-501",
    name: "Gurbir Grewal",
    state: "Punjab",
    district: "Bathinda",
    cropType: "Bt Cotton",
    themeColor: "#f97316", // Orange
    acres: 21.0,
    location: { lat: 30.2110, lng: 74.9455 },
    score: 870,
    soilMoisture: 41.5,
    harvestConsistency: 91,
    neighborhoodBenchmark: 17.5,
    gli: 0.74,
    recommendation: 'APPROVED',
    narrative: "",
    vhiData: generateVhiData(0.53),
    boundaryOffsets: [
      [-0.006, -0.005],
      [0.005, -0.005],
      [0.006, 0.005],
      [-0.004, 0.006]
    ],
    riskVectors: [{ id: 'gc', name: 'Cotton Belt', status: 'CLEAR', confidence: 0.95, description: 'Pest-resistant crop.' }]
  },
  {
    id: "PB-SNG-601",
    name: "Sukhwinder Mann",
    state: "Punjab",
    district: "Sangrur",
    cropType: "Wheat & Sunflower",
    themeColor: "#ec4899", // Pink
    acres: 13.5,
    location: { lat: 30.2458, lng: 75.8420 },
    score: 925,
    soilMoisture: 56.0,
    harvestConsistency: 99,
    neighborhoodBenchmark: 32.0,
    gli: 0.89,
    recommendation: 'APPROVED',
    narrative: "",
    vhiData: generateVhiData(0.68),
    boundaryOffsets: [
      [-0.004, -0.004],
      [0.004, -0.004],
      [0.005, 0.004],
      [-0.003, 0.005]
    ],
    riskVectors: [{ id: 'sb', name: 'Zero Burn Certified', status: 'CLEAR', confidence: 1.0, description: 'Model farm.' }]
  },
  {
    id: "PB-MGA-701",
    name: "Taranjit Singh",
    state: "Punjab",
    district: "Moga",
    cropType: "Green Fodder & Wheat",
    themeColor: "#3b82f6", // Royal Blue
    acres: 14.2,
    location: { lat: 30.8165, lng: 75.1717 },
    score: 840,
    soilMoisture: 44.0,
    harvestConsistency: 90,
    neighborhoodBenchmark: 15.0,
    gli: 0.72,
    recommendation: 'APPROVED',
    narrative: "",
    vhiData: generateVhiData(0.52),
    boundaryOffsets: [
      [-0.003, -0.003],
      [0.003, -0.004],
      [0.004, 0.003],
      [-0.002, 0.004]
    ],
    riskVectors: [{ id: 'sb', name: 'Stubble Check', status: 'CLEAR', confidence: 0.96, description: 'Clear burn record.' }]
  }
];
