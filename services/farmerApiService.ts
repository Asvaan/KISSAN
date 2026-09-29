export interface FarmerApiStatResponse {
  status: string;
  timestamp: string;
  totalFarmers: number;
  totalHectares: number;
  activeStates: number;
  cropDistribution: {
    ricePaddy: number; // percentage
    wheat: number;
    pulses: number;
    cotton: number;
    sugarcane: number;
    coarseGrains: number;
  };
  nationalAvgYieldIndex: number;
  nationalSoilMoisture: number;
  satelliteAuditCoverage: number;
  stateStats?: Record<string, {
    farmersCount: number;
    hectares: number;
    vhiIndex: number;
    riskAlerts: number;
  }>;
}

const DEFAULT_API_URL = (import.meta as any).env?.VITE_FARMER_API_URL || 'https://api.apifarmer.com/api/v0/stat';
const DEFAULT_API_KEY = (import.meta as any).env?.VITE_FARMER_API_KEY || 'demo_kisan_api_key_2026';

export async function fetchFarmerApiStats(apiKey?: string): Promise<{
  data: FarmerApiStatResponse;
  isMock: boolean;
  error?: string;
}> {
  const keyToUse = apiKey || DEFAULT_API_KEY;
  const endpoint = `${DEFAULT_API_URL}?api-key=${encodeURIComponent(keyToUse)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      return {
        data: json,
        isMock: false
      };
    } else {
      throw new Error(`API returned HTTP ${response.status}`);
    }
  } catch (err: any) {
    // Fallback to high-precision synthetic telemetry for India agricultural stats
    return {
      data: {
        status: "ACTIVE_SIMULATED",
        timestamp: new Date().toISOString(),
        totalFarmers: 146280000, // 14.6 Crore Indian Farmers
        totalHectares: 156400000, // 15.6 Crore Hectares
        activeStates: 28,
        cropDistribution: {
          ricePaddy: 38.5,
          wheat: 29.2,
          pulses: 14.1,
          cotton: 8.4,
          sugarcane: 5.6,
          coarseGrains: 4.2
        },
        nationalAvgYieldIndex: 84.6,
        nationalSoilMoisture: 42.8,
        satelliteAuditCoverage: 91.4,
        stateStats: {
          "Punjab": { farmersCount: 1090000, hectares: 4200000, vhiIndex: 0.76, riskAlerts: 14 },
          "Haryana": { farmersCount: 1620000, hectares: 3500000, vhiIndex: 0.74, riskAlerts: 8 },
          "Uttar Pradesh": { farmersCount: 23800000, hectares: 16500000, vhiIndex: 0.68, riskAlerts: 42 },
          "Rajasthan": { farmersCount: 7800000, hectares: 21000000, vhiIndex: 0.52, riskAlerts: 19 },
          "Maharashtra": { farmersCount: 15200000, hectares: 19800000, vhiIndex: 0.61, riskAlerts: 27 },
          "Madhya Pradesh": { farmersCount: 10000000, hectares: 15300000, vhiIndex: 0.65, riskAlerts: 18 },
          "Gujarat": { farmersCount: 5400000, hectares: 9800000, vhiIndex: 0.59, riskAlerts: 11 },
          "West Bengal": { farmersCount: 7200000, hectares: 5400000, vhiIndex: 0.72, riskAlerts: 9 },
          "Bihar": { farmersCount: 16100000, hectares: 5200000, vhiIndex: 0.67, riskAlerts: 31 },
          "Tamil Nadu": { farmersCount: 7900000, hectares: 4800000, vhiIndex: 0.69, riskAlerts: 5 },
          "Karnataka": { farmersCount: 7800000, hectares: 11800000, vhiIndex: 0.63, riskAlerts: 15 },
          "Andhra Pradesh": { farmersCount: 8500000, hectares: 6000000, vhiIndex: 0.71, riskAlerts: 12 },
          "Telangana": { farmersCount: 5900000, hectares: 4900000, vhiIndex: 0.66, riskAlerts: 10 },
          "Kerala": { farmersCount: 1400000, hectares: 2000000, vhiIndex: 0.78, riskAlerts: 3 },
          "Assam": { farmersCount: 2700000, hectares: 2800000, vhiIndex: 0.75, riskAlerts: 6 }
        }
      },
      isMock: true,
      error: err?.message || 'API connection fallback'
    };
  }
}
