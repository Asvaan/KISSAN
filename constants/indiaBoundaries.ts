export interface StateBoundary {
  id: string;
  name: string;
  code: string;
  capital: string;
  center: [number, number];
  defaultZoom: number;
  color: string;
  polygon: [number, number][]; // [lat, lng]
  farmersCount: string;
  hectares: string;
  primaryCrops: string[];
  vhiScore: number;
  soilMoisture: number;
  stubbleBurningRisk: 'HIGH' | 'MODERATE' | 'LOW' | 'NEGLIGIBLE';
}

export interface RegionPreset {
  name: string;
  coords: [number, number];
  zoom: number;
  description: string;
}

// Map region presets for navigating across India
export const INDIA_REGION_PRESETS: RegionPreset[] = [
  { name: 'Entire India', coords: [22.5937, 78.9629], zoom: 5, description: 'National Geographic Boundary' },
  { name: 'North India', coords: [30.2000, 76.8000], zoom: 7, description: 'Granary Belt (Punjab, Haryana, UP, HP)' },
  { name: 'South India', coords: [13.0000, 77.5000], zoom: 6.5, description: 'Deccan & Coastal Belt (TN, KA, AP, KL, TS)' },
  { name: 'West India', coords: [21.5000, 73.0000], zoom: 6.5, description: 'Arid & Cotton Belt (GJ, RJ, MH)' },
  { name: 'East & NE India', coords: [24.5000, 88.5000], zoom: 6.5, description: 'Deltaic Rice & Plantation Belt (WB, OR, BR, AS)' },
  { name: 'Central India', coords: [22.5000, 78.5000], zoom: 6.5, description: 'Soybean & Pulse Plateau (MP, CG)' },
];

// Outer Geographic Perimeter Polygon of India (Detailed Multi-point border)
export const INDIA_NATIONAL_BORDER: [number, number][] = [
  [35.5000, 77.0000], // Siachen / Ladakh North
  [34.5000, 78.8000], // Pangong / Aksai Chin Border
  [32.8000, 79.2000], // Demchok
  [31.2000, 78.9000], // Spiti HP Border
  [30.5000, 80.5000], // Uttarakhand Lipulekh
  [28.9000, 80.1000], // Banbasa UP Border
  [27.4000, 83.5000], // Lumbini UP/Nepal Border
  [26.5000, 88.2000], // Siliguri Corridor WB
  [27.5000, 88.8000], // Sikkim Chumbi Border
  [27.8000, 91.8000], // Tawang Arunachal Border
  [28.6000, 96.5000], // Kibithu Eastmost Point
  [27.0000, 95.2000], // Nagaland Patkai Border
  [24.5000, 93.3000], // Manipur border
  [23.0000, 93.2000], // Mizoram border
  [23.8000, 91.2000], // Tripura border
  [25.2000, 91.8000], // Meghalaya border
  [26.1000, 89.8000], // Assam Dhubri
  [24.2000, 88.3000], // Murshidabad WB
  [21.6000, 88.1000], // Sundarbans Coast WB
  [19.8000, 86.0000], // Puri Coast Odisha
  [17.0000, 82.5000], // Visakhapatnam Coast AP
  [13.1000, 80.3000], // Chennai Coast TN
  [8.0800, 77.5500],  // Kanyakumari Southern Tip
  [9.9000, 76.2000],  // Kochi Coast Kerala
  [15.4000, 73.8000], // Goa Coast
  [18.9000, 72.8000], // Mumbai Coast Maharashtra
  [21.2000, 72.8000], // Surat Coast Gujarat
  [22.4000, 68.9000], // Dwarka Gujarat West Tip
  [23.7000, 68.2000], // Rann of Kutch West Border
  [24.5000, 71.0000], // Barmer RJ Border
  [27.0000, 70.0000], // Jaisalmer RJ Border
  [29.8000, 73.8000], // Ganganagar Border
  [30.8000, 74.5000], // Fazilka Punjab Border
  [31.6000, 74.5000], // Wagah Amritsar Border
  [32.4000, 74.8000], // Jammu Border
  [34.1000, 74.0000], // LOC Kashmir
  [35.5000, 77.0000]  // Close Loop to Ladakh
];

// Major Indian States Boundaries & Regional Agrarian Datasets
export const INDIAN_STATES_BOUNDARIES: StateBoundary[] = [
  {
    id: 'IN-PB',
    name: 'Punjab',
    code: 'PB',
    capital: 'Chandigarh',
    center: [30.9010, 75.8573],
    defaultZoom: 8.8,
    color: '#10b981', // Emerald Green
    polygon: [
      [32.5000, 75.9000], // Pathankot North
      [31.8000, 76.4000], // Hoshiarpur East
      [30.8000, 76.8000], // Ropar / Mohali
      [29.9000, 76.2000], // Patiala South
      [29.8000, 75.0000], // Mansa / Bathinda South
      [30.1000, 73.9000], // Fazilka West
      [31.3000, 74.5000], // Firozpur / Amritsar West
      [32.3000, 74.8000], // Gurdaspur NW
      [32.5000, 75.9000]
    ],
    farmersCount: '10.9 Lakh',
    hectares: '42.0 Lakh Ha',
    primaryCrops: ['Basmati Rice', 'Wheat', 'Cotton', 'Maize'],
    vhiScore: 0.76,
    soilMoisture: 45.2,
    stubbleBurningRisk: 'HIGH'
  },
  {
    id: 'IN-HR',
    name: 'Haryana',
    code: 'HR',
    capital: 'Chandigarh',
    center: [29.0588, 76.0856],
    defaultZoom: 8.5,
    color: '#06b6d4', // Cyan
    polygon: [
      [30.9000, 77.1000], // Panchkula / Yamunanagar
      [29.8000, 77.2000], // Karnal East
      [28.7000, 77.4000], // Faridabad / Palwal
      [27.9000, 77.1000], // Nuh South
      [28.1000, 75.9000], // Mahendragarh West
      [29.1000, 74.6000], // Sirsa West
      [30.0000, 75.1000], // Fatehabad North
      [30.5000, 76.8000], // Ambala North
      [30.9000, 77.1000]
    ],
    farmersCount: '16.2 Lakh',
    hectares: '35.0 Lakh Ha',
    primaryCrops: ['Wheat', 'Paddy', 'Mustard', 'Sugarcane'],
    vhiScore: 0.74,
    soilMoisture: 42.0,
    stubbleBurningRisk: 'MODERATE'
  },
  {
    id: 'IN-UP',
    name: 'Uttar Pradesh',
    code: 'UP',
    capital: 'Lucknow',
    center: [26.8467, 80.9462],
    defaultZoom: 7.2,
    color: '#f59e0b', // Amber
    polygon: [
      [30.4000, 77.6000], // Saharanpur North
      [29.5000, 78.2000], // Bijnor
      [28.5000, 80.2000], // Pilibhit
      [27.4000, 83.5000], // Gorakhpur / Maharajganj
      [26.5000, 84.4000], // Deoria East
      [25.1000, 83.2000], // Sonbhadra SE
      [24.5000, 82.8000], // Mirzapur
      [24.8000, 78.4000], // Lalitpur South
      [26.8000, 77.5000], // Agra West
      [28.8000, 77.3000], // Noida / Meerut
      [30.4000, 77.6000]
    ],
    farmersCount: '2.38 Crore',
    hectares: '1.65 Crore Ha',
    primaryCrops: ['Sugarcane', 'Wheat', 'Rice', 'Potato', 'Pulses'],
    vhiScore: 0.68,
    soilMoisture: 38.5,
    stubbleBurningRisk: 'MODERATE'
  },
  {
    id: 'IN-RJ',
    name: 'Rajasthan',
    code: 'RJ',
    capital: 'Jaipur',
    center: [27.0238, 74.2179],
    defaultZoom: 7.0,
    color: '#eab308', // Gold Yellow
    polygon: [
      [29.9000, 73.9000], // Ganganagar North
      [28.8000, 76.2000], // Alwar East
      [26.8000, 77.8000], // Dholpur East
      [24.5000, 76.8000], // Jhalawar SE
      [23.2000, 74.5000], // Banswara South
      [24.5000, 72.8000], // Sirohi / Mount Abu
      [24.5000, 71.0000], // Barmer West
      [27.0000, 70.0000], // Jaisalmer West Tip
      [29.0000, 72.5000], // Bikaner NW
      [29.9000, 73.9000]
    ],
    farmersCount: '78.0 Lakh',
    hectares: '2.10 Crore Ha',
    primaryCrops: ['Bajra (Pearl Millet)', 'Mustard', 'Guar', 'Pulses', 'Wheat'],
    vhiScore: 0.52,
    soilMoisture: 24.8,
    stubbleBurningRisk: 'LOW'
  },
  {
    id: 'IN-GJ',
    name: 'Gujarat',
    code: 'GJ',
    capital: 'Gandhinagar',
    center: [22.2587, 71.1924],
    defaultZoom: 7.2,
    color: '#8b5cf6', // Violet
    polygon: [
      [24.7000, 71.2000], // Banaskantha North
      [24.4000, 73.8000], // Sabarkantha East
      [22.8000, 74.2000], // Dahod East
      [20.3000, 72.9000], // Valsad South
      [21.0000, 72.5000], // Surat Coast
      [22.4000, 68.9000], // Dwarka West Tip
      [23.7000, 68.2000], // Kutch West
      [24.5000, 69.8000], // Rann North
      [24.7000, 71.2000]
    ],
    farmersCount: '54.0 Lakh',
    hectares: '98.0 Lakh Ha',
    primaryCrops: ['Cotton', 'Groundnut', 'Castor', 'Wheat', 'Cumin'],
    vhiScore: 0.59,
    soilMoisture: 31.0,
    stubbleBurningRisk: 'NEGLIGIBLE'
  },
  {
    id: 'IN-MP',
    name: 'Madhya Pradesh',
    code: 'MP',
    capital: 'Bhopal',
    center: [22.9734, 78.6569],
    defaultZoom: 7.0,
    color: '#3b82f6', // Bright Blue
    polygon: [
      [26.8000, 78.2000], // Morena North
      [24.8000, 81.9000], // Rewa East
      [23.0000, 82.5000], // Singrauli SE
      [21.6000, 80.5000], // Balaghat South
      [21.4000, 76.5000], // Burhanpur South
      [22.0000, 74.2000], // Jhabua West
      [24.5000, 75.0000], // Mandsaur NW
      [26.2000, 76.8000], // Sheopur NW
      [26.8000, 78.2000]
    ],
    farmersCount: '1.00 Crore',
    hectares: '1.53 Crore Ha',
    primaryCrops: ['Soybean', 'Wheat', 'Gram (Chickpea)', 'Mustard'],
    vhiScore: 0.65,
    soilMoisture: 35.6,
    stubbleBurningRisk: 'LOW'
  },
  {
    id: 'IN-MH',
    name: 'Maharashtra',
    code: 'MH',
    capital: 'Mumbai',
    center: [19.7515, 75.7139],
    defaultZoom: 7.0,
    color: '#ec4899', // Pink
    polygon: [
      [22.0000, 73.8000], // Nandurbar NW
      [21.4000, 76.8000], // Amravati North
      [21.5000, 80.3000], // Gondia East
      [18.8000, 80.2000], // Gadchiroli SE
      [17.3000, 77.2000], // Nanded South
      [15.8000, 74.0000], // Sindhudurg South Coast
      [18.9000, 72.8000], // Mumbai Coast
      [20.2000, 72.7000], // Palghar North Coast
      [22.0000, 73.8000]
    ],
    farmersCount: '1.52 Crore',
    hectares: '1.98 Crore Ha',
    primaryCrops: ['Sugarcane', 'Cotton', 'Soybean', 'Onion', 'Tur (Arhar)'],
    vhiScore: 0.61,
    soilMoisture: 33.4,
    stubbleBurningRisk: 'NEGLIGIBLE'
  },
  {
    id: 'IN-KA',
    name: 'Karnataka',
    code: 'KA',
    capital: 'Bengaluru',
    center: [15.3173, 75.7139],
    defaultZoom: 7.2,
    color: '#14b8a6', // Teal
    polygon: [
      [18.4000, 77.2000], // Bidar North
      [16.8000, 77.4000], // Raichur East
      [13.8000, 78.4000], // Kolar East
      [11.6000, 76.8000], // Chamarajanagar South
      [12.8000, 74.8000], // Mangaluru Coast West
      [14.8000, 74.1000], // Karwar Coast West
      [15.8000, 74.2000], // Belagavi NW
      [17.5000, 76.0000], // Kalaburagi NW
      [18.4000, 77.2000]
    ],
    farmersCount: '78.0 Lakh',
    hectares: '1.18 Crore Ha',
    primaryCrops: ['Coffee', 'Ragi (Finger Millet)', 'Maize', 'Sugarcane', 'Cotton'],
    vhiScore: 0.63,
    soilMoisture: 36.8,
    stubbleBurningRisk: 'NEGLIGIBLE'
  },
  {
    id: 'IN-TN',
    name: 'Tamil Nadu',
    code: 'TN',
    capital: 'Chennai',
    center: [11.1271, 78.6569],
    defaultZoom: 7.4,
    color: '#f97316', // Orange
    polygon: [
      [13.5000, 79.8000], // Thiruvallur North
      [13.1000, 80.3000], // Chennai Coast
      [10.8000, 79.8000], // Thanjavur / Nagapattinam Delta
      [8.0800, 77.5500],  // Kanyakumari South Tip
      [8.7000, 76.7000],  // Tenkasi West
      [11.5000, 76.4000], // Nilgiris West
      [12.8000, 78.5000], // Krishnagiri NW
      [13.5000, 79.8000]
    ],
    farmersCount: '79.0 Lakh',
    hectares: '48.0 Lakh Ha',
    primaryCrops: ['Paddy Rice', 'Banana', 'Sugarcane', 'Coconut', 'Groundnut'],
    vhiScore: 0.69,
    soilMoisture: 41.5,
    stubbleBurningRisk: 'NEGLIGIBLE'
  },
  {
    id: 'IN-AP',
    name: 'Andhra Pradesh',
    code: 'AP',
    capital: 'Amaravati',
    center: [15.9129, 79.7400],
    defaultZoom: 7.2,
    color: '#6366f1', // Indigo
    polygon: [
      [19.1000, 84.7000], // Srikakulam NE
      [17.8000, 83.3000], // Visakhapatnam Coast
      [15.8000, 80.8000], // Krishna Delta Coast
      [13.5000, 80.2000], // Nellore South Coast
      [12.8000, 78.5000], // Chittoor SW
      [14.8000, 76.8000], // Anantapur West
      [16.0000, 78.8000], // Kurnool NW
      [18.2000, 82.8000], // East Godavari North
      [19.1000, 84.7000]
    ],
    farmersCount: '85.0 Lakh',
    hectares: '60.0 Lakh Ha',
    primaryCrops: ['Paddy Rice', 'Chilli', 'Cotton', 'Tobacco', 'Groundnut'],
    vhiScore: 0.71,
    soilMoisture: 44.0,
    stubbleBurningRisk: 'NEGLIGIBLE'
  },
  {
    id: 'IN-WB',
    name: 'West Bengal',
    code: 'WB',
    capital: 'Kolkata',
    center: [22.9868, 87.8550],
    defaultZoom: 7.5,
    color: '#10b981', // Emerald
    polygon: [
      [27.1000, 88.3000], // Darjeeling North
      [26.5000, 89.8000], // Jalpaiguri / Cooch Behar
      [24.8000, 88.0000], // Malda
      [22.5000, 89.0000], // Sundarbans Coast SE
      [21.6000, 88.1000], // Digha Coast South
      [22.2000, 86.8000], // Jhargram SW
      [23.8000, 86.9000], // Purulia West
      [25.0000, 87.8000], // Murshidabad NW
      [27.1000, 88.3000]
    ],
    farmersCount: '72.0 Lakh',
    hectares: '54.0 Lakh Ha',
    primaryCrops: ['Aman & Boro Rice', 'Jute', 'Tea', 'Potato', 'Vegetables'],
    vhiScore: 0.72,
    soilMoisture: 52.0,
    stubbleBurningRisk: 'NEGLIGIBLE'
  },
  {
    id: 'IN-AS',
    name: 'Assam',
    code: 'AS',
    capital: 'Dispur',
    center: [26.2006, 92.9376],
    defaultZoom: 7.5,
    color: '#0284c7', // Sky Blue
    polygon: [
      [27.9000, 95.8000], // Tinsukia / Lakhimpur NE
      [26.8000, 95.0000], // Dibrugarh
      [25.5000, 92.8000], // Cachar South
      [26.0000, 89.8000], // Dhubri West
      [26.8000, 91.5000], // Barpeta / Kamrup North
      [27.9000, 95.8000]
    ],
    farmersCount: '27.0 Lakh',
    hectares: '28.0 Lakh Ha',
    primaryCrops: ['Assam Tea', 'Rice Paddy', 'Mustard', 'Jute'],
    vhiScore: 0.75,
    soilMoisture: 56.4,
    stubbleBurningRisk: 'NEGLIGIBLE'
  }
];
