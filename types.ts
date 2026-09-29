
export interface RiskVector {
  id: string;
  name: string;
  status: 'CLEAR' | 'WARNING' | 'VIOLATION';
  confidence: number;
  description: string;
}

export interface FarmerData {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  score: number;
  vhiData: { month: string; value: number }[];
  soilMoisture: number;
  harvestConsistency: number;
  neighborhoodBenchmark: number;
  gli: number;
  narrative: string;
  recommendation: 'APPROVED' | 'REVIEW' | 'REJECTED';
  riskVectors: RiskVector[];
  acres?: number;
  cropType?: string;
  district?: string;
  state?: string;
  themeColor?: string;
  boundaryOffsets?: [number, number][]; // Relative lat/lng offsets forming polygon
}

export interface AnalysisResult {
  land_type: string;
  confidence: number;
  analysis: string;
  violations_found: string[];
  fraud_score: number;
}
