export type CropName = 'Wheat-Paddy' | 'Basmati' | 'Cotton' | 'Maize' | 'Potato' | 'Mustard' | 'Fodder';

export interface Month {
  m: string;
  temp: number;
  humidity: number;
  rain: number;
  moisture: number;
  ndvi: number;
  farming: boolean;
}

export interface Parcel {
  id: string;
  name: string;
  district: string;
  village: string;
  crop: CropName;
  detectedCrop: string;
  acres: number;
  loan: 'yes' | 'no';
  risk: number;
  violation: string;
  farming: boolean;
  fertility: number;
  humidity: number;
  altitude: number;
  soilMoisture: number;
  ndvi: number[];
  months: Month[];
  score: number;
}

export interface Profile {
  fertility: number;
  altitude: number;
  rainfall: number;
  moisture: number;
  temp: number;
  humidity: number;
}

type ProfileKey = keyof Profile;
type Range = [number, number, number, number];

export interface CropInfo {
  name: CropName;
  local: string;
  season: string;
  sowing: string;
  sowMonths: number[];
  water: 'Very high' | 'High' | 'Medium' | 'Low';
  note: string;
  ranges: Record<Exclude<ProfileKey, 'humidity'>, Range>;
  belt: string[];
}

export const CROPS: CropInfo[] = [
  {
    name: 'Wheat-Paddy',
    local: 'ਕਣਕ-ਝੋਨਾ · Kanak-Jhona',
    season: 'Rabi wheat + Kharif paddy',
    sowing: 'Wheat 25 Oct – 15 Nov; paddy transplant after 15 Jun',
    sowMonths: [6, 10, 11],
    water: 'Very high',
    note: 'Highest water draw of any rotation. Only advisable where soil moisture and rainfall are strong; Punjab groundwater is over-exploited in most blocks.',
    ranges: {
      fertility: [45, 65, 100, 101],
      rainfall: [450, 580, 800, 900],
      moisture: [28, 35, 50, 55],
      temp: [23, 24.5, 26.5, 28],
      altitude: [150, 180, 320, 450],
    },
    belt: ['Ludhiana', 'Sangrur', 'Patiala', 'Moga', 'Jalandhar'],
  },
  {
    name: 'Basmati',
    local: 'ਬਾਸਮਤੀ · Basmati',
    season: 'Kharif',
    sowing: 'Nursery Jun; transplant 1 – 20 Jul',
    sowMonths: [6, 7],
    water: 'High',
    note: 'Export premium over common paddy and a later transplant window, which eases peak summer water demand.',
    ranges: {
      fertility: [35, 50, 85, 101],
      rainfall: [420, 520, 750, 850],
      moisture: [26, 32, 45, 50],
      temp: [23.5, 25, 27, 28],
      altitude: [150, 180, 300, 420],
    },
    belt: ['Amritsar', 'Gurdaspur', 'Firozpur', 'Patiala', 'Sangrur'],
  },
  {
    name: 'Cotton',
    local: 'ਨਰਮਾ · Narma',
    season: 'Kharif',
    sowing: '15 Apr – 15 May',
    sowMonths: [4, 5],
    water: 'Medium',
    note: 'Suits the warmer, drier south-west belt. Watch for pink bollworm and whitefly; keep sowing inside the window.',
    ranges: {
      fertility: [25, 40, 80, 101],
      rainfall: [300, 400, 580, 700],
      moisture: [20, 26, 34, 40],
      temp: [24.5, 25.8, 28, 29],
      altitude: [150, 170, 260, 330],
    },
    belt: ['Bathinda', 'Firozpur', 'Sangrur', 'Moga'],
  },
  {
    name: 'Maize',
    local: 'ਮੱਕੀ · Makki',
    season: 'Kharif (spring maize Feb)',
    sowing: 'Kharif 25 May – 30 Jun; spring 20 Jan – 15 Feb',
    sowMonths: [1, 2, 5, 6],
    water: 'Medium',
    note: 'Main crop-diversification option away from paddy. Needs good drainage; responds well to fertile soil.',
    ranges: {
      fertility: [35, 55, 90, 101],
      rainfall: [380, 480, 700, 820],
      moisture: [24, 30, 40, 46],
      temp: [23, 24.5, 27, 28.5],
      altitude: [150, 200, 450, 500],
    },
    belt: ['Hoshiarpur', 'Gurdaspur', 'Jalandhar', 'Ludhiana'],
  },
  {
    name: 'Potato',
    local: 'ਆਲੂ · Aloo',
    season: 'Autumn / Rabi',
    sowing: '25 Sep – 25 Oct',
    sowMonths: [9, 10],
    water: 'Medium',
    note: 'High-value but input-heavy. Needs fertile, loose soil and cold storage access near harvest (Jan – Feb).',
    ranges: {
      fertility: [45, 65, 100, 101],
      rainfall: [350, 450, 650, 780],
      moisture: [26, 31, 40, 45],
      temp: [22, 23.5, 25.8, 27.5],
      altitude: [150, 200, 420, 500],
    },
    belt: ['Jalandhar', 'Hoshiarpur', 'Moga', 'Ludhiana'],
  },
  {
    name: 'Mustard',
    local: 'ਸਰ੍ਹੋਂ · Sarhon',
    season: 'Rabi',
    sowing: '1 – 31 Oct',
    sowMonths: [10],
    water: 'Low',
    note: 'Low water and low input. A safe pick for weaker or drier soil, and it tolerates moderate fertility.',
    ranges: {
      fertility: [15, 30, 75, 101],
      rainfall: [250, 350, 550, 700],
      moisture: [18, 24, 33, 40],
      temp: [22, 23.5, 26, 27.5],
      altitude: [150, 170, 350, 450],
    },
    belt: ['Bathinda', 'Firozpur', 'Sangrur', 'Patiala'],
  },
  {
    name: 'Fodder',
    local: 'ਚਾਰਾ · Chara (berseem / jowar)',
    season: 'Year-round',
    sowing: 'Berseem Oct; summer jowar / maize fodder Mar – Jul',
    sowMonths: [3, 4, 5, 6, 7, 10],
    water: 'Medium',
    note: 'Most tolerant of poor soil. Best where the household or village runs dairy, since it sells locally.',
    ranges: {
      fertility: [10, 25, 90, 101],
      rainfall: [300, 400, 750, 850],
      moisture: [20, 26, 42, 48],
      temp: [22, 23.5, 27, 28.5],
      altitude: [150, 170, 450, 500],
    },
    belt: ['Ludhiana', 'Moga', 'Jalandhar', 'Patiala', 'Amritsar', 'Gurdaspur'],
  },
];

export const CROP_BY_NAME = new Map(CROPS.map((c) => [c.name, c]));

const PROFILE_KEYS: ProfileKey[] = ['fertility', 'altitude', 'rainfall', 'moisture', 'temp', 'humidity'];

const AGRO_WEIGHTS: Record<Exclude<ProfileKey, 'humidity'>, number> = {
  fertility: 0.25,
  moisture: 0.3,
  rainfall: 0.25,
  temp: 0.1,
  altitude: 0.1,
};

const NEIGHBOURS = 12;

export function profileOf(p: Parcel): Profile {
  const rain = p.months.reduce((s, m) => s + m.rain, 0);
  const temp = p.months.reduce((s, m) => s + m.temp, 0) / p.months.length;
  return {
    fertility: p.fertility,
    altitude: p.altitude,
    rainfall: rain,
    moisture: p.soilMoisture,
    temp,
    humidity: p.humidity,
  };
}

function mean(xs: number[]): number {
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

function sd(xs: number[]): number {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2))) || 1;
}

function trapezoid(x: number, [lo, a, b, hi]: Range): number {
  if (x >= a && x <= b) return 1;
  if (x <= lo || x >= hi) return 0.05;
  return x < a ? 0.05 + 0.95 * ((x - lo) / (a - lo)) : 0.05 + 0.95 * ((hi - x) / (hi - b));
}

export interface CropScore {
  crop: CropInfo;
  score: number;
  agro: number;
  fit: number;
  outcome: number;
  regional: boolean;
  sowNow: boolean;
  limits: string[];
  strengths: string[];
  peers: { count: number; ndvi: number; risk: number; loanRate: number };
}

export interface Advice {
  profile: Profile;
  district?: string;
  ranked: CropScore[];
}

interface Grower {
  parcel: Parcel;
  profile: Profile;
  ndviMean: number;
}

const LABELS: Record<Exclude<ProfileKey, 'humidity'>, string> = {
  fertility: 'soil fertility',
  moisture: 'soil moisture',
  rainfall: 'rainfall',
  temp: 'temperature',
  altitude: 'altitude',
};

export class Registry {
  readonly parcels: Parcel[];
  readonly byId: Map<string, Parcel>;
  readonly districts: string[];
  readonly villages: string[];
  private readonly growers: Grower[];
  private readonly spread: Record<ProfileKey, number>;
  private readonly centroids: Map<CropName, Profile>;
  private readonly stateProfile: Profile;
  private readonly districtProfiles: Map<string, Profile>;

  constructor(parcels: Parcel[]) {
    this.parcels = parcels;
    this.byId = new Map(parcels.map((p) => [p.id.toUpperCase(), p]));
    this.districts = [...new Set(parcels.map((p) => p.district))].sort();
    this.villages = [...new Set(parcels.map((p) => p.village))].sort();

    this.growers = parcels
      .filter((p) => p.violation === 'none' && p.farming && p.loan === 'yes')
      .map((p) => ({ parcel: p, profile: profileOf(p), ndviMean: mean(p.ndvi) }));

    const profiles = this.growers.map((g) => g.profile);
    this.spread = Object.fromEntries(
      PROFILE_KEYS.map((k) => [k, sd(profiles.map((p) => p[k]))]),
    ) as Record<ProfileKey, number>;

    this.stateProfile = averageProfile(profiles);
    this.districtProfiles = new Map(
      this.districts.map((d) => [
        d,
        averageProfile(this.growers.filter((g) => g.parcel.district === d).map((g) => g.profile)),
      ]),
    );
    this.centroids = new Map(
      CROPS.map((c) => [
        c.name,
        averageProfile(this.growers.filter((g) => g.parcel.crop === c.name).map((g) => g.profile)),
      ]),
    );
  }

  baseline(district?: string, village?: string): Profile {
    if (district && village) {
      const local = this.growers.filter((g) => g.parcel.district === district && g.parcel.village === village);
      if (local.length) return averageProfile(local.map((g) => g.profile));
    }
    return { ...((district && this.districtProfiles.get(district)) || this.stateProfile) };
  }

  private distance(a: Profile, b: Profile): number {
    const sum = PROFILE_KEYS.reduce((s, k) => s + ((a[k] - b[k]) / this.spread[k]) ** 2, 0);
    return Math.sqrt(sum / PROFILE_KEYS.length);
  }

  advise(profile: Profile, district?: string, month = new Date().getMonth() + 1): Advice {
    const raw = CROPS.map((crop) => {
      const agroParts = (Object.keys(AGRO_WEIGHTS) as (keyof typeof AGRO_WEIGHTS)[]).map((k) => ({
        key: k,
        value: trapezoid(profile[k], crop.ranges[k]),
      }));
      const agro = agroParts.reduce((s, p) => s + p.value * AGRO_WEIGHTS[p.key], 0);

      const centroid = this.centroids.get(crop.name)!;
      const fit = Math.exp(-(this.distance(profile, centroid) ** 2) / 2);

      const peers = this.growers
        .filter((g) => g.parcel.crop === crop.name)
        .map((g) => ({
          g,
          d: this.distance(profile, g.profile) + (district && g.parcel.district !== district ? 0.35 : 0),
        }))
        .sort((x, y) => x.d - y.d)
        .slice(0, NEIGHBOURS);
      const weights = peers.map((p) => Math.exp(-p.d));
      const total = weights.reduce((s, w) => s + w, 0) || 1;
      const wavg = (f: (g: Grower) => number) => peers.reduce((s, p, i) => s + weights[i] * f(p.g), 0) / total;
      const peerStats = {
        count: peers.length,
        ndvi: wavg((g) => g.ndviMean),
        risk: wavg((g) => g.parcel.risk),
        loanRate: wavg((g) => (g.parcel.loan === 'yes' ? 1 : 0)),
      };

      const limits = agroParts
        .filter((p) => p.value < 0.6)
        .sort((a, b) => a.value - b.value)
        .map((p) => describeLimit(p.key, profile[p.key], crop.ranges[p.key]));
      const strengths = agroParts
        .filter((p) => p.value >= 0.99 && AGRO_WEIGHTS[p.key] >= 0.25)
        .map((p) => `${LABELS[p.key]} in the ideal band`);

      return {
        crop,
        agro,
        fit,
        peerStats,
        limits,
        strengths,
        regional: !!district && crop.belt.includes(district),
        sowNow: crop.sowMonths.includes(month),
      };
    });

    const outcomeRaw = raw.map((r) => r.peerStats.ndvi * 100 - r.peerStats.risk);
    const lo = Math.min(...outcomeRaw);
    const hi = Math.max(...outcomeRaw);

    const ranked: CropScore[] = raw
      .map((r, i) => {
        const outcome = hi > lo ? (outcomeRaw[i] - lo) / (hi - lo) : 0.5;
        const score = 0.5 * r.agro + 0.25 * r.fit + 0.1 * outcome + (r.regional ? 0.15 : 0);
        return {
          crop: r.crop,
          score: Math.round(Math.min(1, score) * 100),
          agro: r.agro,
          fit: r.fit,
          outcome,
          regional: r.regional,
          sowNow: r.sowNow,
          limits: r.limits,
          strengths: r.strengths,
          peers: r.peerStats,
        };
      })
      .sort((a, b) => b.score - a.score);

    return { profile, district, ranked };
  }

  adviseParcel(p: Parcel, month?: number): Advice {
    return this.advise(profileOf(p), p.district, month);
  }

  findByName(query: string): Parcel[] {
    const q = query.toLowerCase();
    return this.parcels.filter((p) => p.name.toLowerCase() === q);
  }

  bestInDistrict(district: string, village?: string, month?: number): Advice {
    return this.advise(this.baseline(district, village), district, month);
  }
}

function averageProfile(profiles: Profile[]): Profile {
  return Object.fromEntries(PROFILE_KEYS.map((k) => [k, mean(profiles.map((p) => p[k]))])) as unknown as Profile;
}

function describeLimit(key: keyof typeof AGRO_WEIGHTS, value: number, [, a, b]: Range): string {
  const unit = key === 'rainfall' ? ' mm' : key === 'temp' ? ' °C' : key === 'altitude' ? ' m' : key === 'moisture' ? '%' : '';
  const shown = key === 'temp' ? value.toFixed(1) : Math.round(value);
  return value < a
    ? `${LABELS[key]} is low (${shown}${unit}; wants ${a}+${unit})`
    : `${LABELS[key]} is high (${shown}${unit}; best under ${b}${unit})`;
}

export async function loadRegistry(url = '/data/punjab_parcels.json'): Promise<Registry> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url}`);
  return new Registry((await res.json()) as Parcel[]);
}
