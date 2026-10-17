import { CROPS, CROP_BY_NAME, MONTH_NAMES, monthsUntilSowing, profileOf } from './engine.ts';
import type { Advice, CropInfo, CropName, CropScore, Parcel, Profile, Registry } from './engine.ts';
import {
  acresText,
  avoidLine,
  breakdown,
  capitalise,
  compareTable,
  cropCard,
  cropCards,
  esc,
  fertilityWord,
  firstName,
  moistureWord,
  pick,
  profileChips,
  statTiles,
} from './render.ts';

export interface Chip {
  label: string;
  send: string;
}

export interface MenuItem {
  id: 'farmer' | 'place' | 'soil' | 'sow' | 'crop' | 'land';
  label: string;
  hint: string;
}

export interface BotTurn {
  bubbles: string[];
  chips: Chip[];
  menu?: boolean;
  feedback?: boolean;
}

export const MENU: MenuItem[] = [
  { id: 'farmer', label: 'Advise a farmer', hint: 'By farmer ID or name' },
  { id: 'place', label: 'Best crops for my district', hint: 'Pick from 10 districts' },
  { id: 'soil', label: 'Check my soil', hint: '3 quick questions' },
  { id: 'sow', label: 'What to sow this month', hint: 'Open sowing windows' },
  { id: 'crop', label: 'Ask about a crop', hint: 'Water, season and fit' },
  { id: 'land', label: 'Land holdings', hint: 'Acres per farmer and district' },
];

type Flow =
  | { name: 'farmer' }
  | { name: 'place'; purpose: 'best' | 'sow' | 'crop' | 'land'; crop?: CropName; village?: string }
  | { name: 'soil'; step: 'fertility' | 'moisture' | 'district'; fertility?: number; moisture?: number }
  | { name: 'crop' };

interface Context {
  parcel?: Parcel;
  district?: string;
  village?: string;
  advice?: Advice;
  label?: string;
}

const MENU_CHIP: Chip = { label: 'Main menu', send: '#menu' };

const VIOLATIONS: Record<string, string> = {
  ghost_cropping: 'ghost cropping (the declared crop is not seen from orbit)',
  illegal_mining: 'illegal mining (excavated bare ground)',
  illegal_cropping: 'an unpermitted crop',
  double_farming: 'overlapping harvest claims',
  drug_cultivation: 'suspected drug cultivation (off-season closed canopy)',
  illegal_construction: 'illegal construction (built-up structure on agricultural land)',
};

const DISTRICT_ALIASES: Record<string, string> = {
  bhatinda: 'Bathinda',
  ferozepur: 'Firozpur',
  ferozpur: 'Firozpur',
  firozepur: 'Firozpur',
  jallandhar: 'Jalandhar',
  jalandar: 'Jalandhar',
  ludhiyana: 'Ludhiana',
  hoshiyarpur: 'Hoshiarpur',
  sangroor: 'Sangrur',
};

const CROP_KEYWORDS: [string, CropName, boolean][] = [
  ['basmati', 'Basmati', true],
  ['wheat', 'Wheat-Paddy', true],
  ['kanak', 'Wheat-Paddy', true],
  ['paddy', 'Wheat-Paddy', false],
  ['rice', 'Wheat-Paddy', false],
  ['dhan', 'Wheat-Paddy', false],
  ['jhona', 'Wheat-Paddy', false],
  ['cotton', 'Cotton', true],
  ['narma', 'Cotton', true],
  ['kapas', 'Cotton', true],
  ['maize', 'Maize', true],
  ['makki', 'Maize', true],
  ['corn', 'Maize', true],
  ['potato', 'Potato', true],
  ['aloo', 'Potato', true],
  ['alu', 'Potato', true],
  ['mustard', 'Mustard', true],
  ['sarson', 'Mustard', true],
  ['sarhon', 'Mustard', true],
  ['raya', 'Mustard', true],
  ['fodder', 'Fodder', true],
  ['chara', 'Fodder', true],
  ['berseem', 'Fodder', true],
  ['jowar', 'Fodder', true],
];

const NUMBER_FIELDS: [RegExp, keyof Profile][] = [
  [/fert\w*|soil\s*(?:health|score)/, 'fertility'],
  [/rain\w*/, 'rainfall'],
  [/moist\w*|soil\s*water/, 'moisture'],
  [/temp\w*/, 'temp'],
  [/alt\w*|elev\w*|height/, 'altitude'],
  [/humid\w*/, 'humidity'],
];

const FERTILITY_LEVELS: [RegExp, number][] = [
  [/very fertile|very good|excellent|\brich\b|black soil/, 85],
  [/fertile|\bgood\b|healthy/, 70],
  [/average|medium|normal|\bok(ay)?\b|moderate/, 55],
  [/weak|poor|\blow\b|sandy|\bbad\b|saline/, 35],
];

const MOISTURE_LEVELS: [RegExp, number][] = [
  [/waterlog|very wet|flood|marsh/, 45],
  [/irrigat|canal|tube ?well|\bwet\b|plenty/, 38],
  [/moderate|medium|average|normal|\bsome\b/, 32],
  [/\bdry\b|\blow\b|\bless\b|rain[- ]?fed|scarce|little/, 25],
];

const WATER_RANK: Record<CropInfo['water'], number> = { Low: 0, Medium: 1, High: 2, 'Very high': 3 };

const NOT_SURE = /not sure|don'?t know|no idea|\bskip\b|\bany\b|^no$/;

function levenshtein(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

function fuzzyEquals(word: string, key: string): boolean {
  if (word === key) return true;
  if (key.length < 5 || word.length < 5 || word[0] !== key[0] || Math.abs(word.length - key.length) > 2) return false;
  return levenshtein(word, key) <= (key.length >= 8 ? 2 : 1);
}

function tokenize(lower: string): string[] {
  return lower.split(/[^a-z0-9]+/).filter(Boolean);
}

function chip(label: string, send = label): Chip {
  return { label, send };
}

export class Conversation {
  private flow: Flow | null = null;
  private ctx: Context = {};
  private readonly names: [string, Parcel[]][];
  private readonly reg: Registry;
  private readonly now: () => Date;

  constructor(reg: Registry, now: () => Date = () => new Date()) {
    this.reg = reg;
    this.now = now;
    const byName = new Map<string, Parcel[]>();
    for (const p of reg.parcels) {
      const key = p.name.toLowerCase();
      byName.set(key, [...(byName.get(key) ?? []), p]);
    }
    this.names = [...byName.entries()].sort((a, b) => b[0].length - a[0].length);
  }

  greet(): BotTurn {
    const h = this.now().getHours();
    const part = h < 5 ? 'Working late?' : h < 12 ? 'Good morning.' : h < 17 ? 'Good afternoon.' : 'Good evening.';
    return {
      bubbles: [
        `<p class="kc-title">Sat Sri Akal! ${part}</p><p>I'm <b>Kisaan Mitra</b>, your crop advisor. I read every field's NDVI, soil and weather in the registry and tell you what will grow best.</p>`,
        '<p>What would you like to do today?</p>',
      ],
      chips: [],
      menu: true,
    };
  }

  respond(raw: string): BotTurn {
    const text = raw.trim();
    const lower = text.toLowerCase();
    if (text.startsWith('#')) return this.command(text.slice(1));
    const small = this.smallTalk(lower);
    if (small) return small;
    if (this.flow) {
      const turn = this.continueFlow(text, lower);
      if (turn) return turn;
    }
    return this.understand(text, lower) ?? this.fallback();
  }

  private month(): number {
    return this.now().getMonth() + 1;
  }

  private command(name: string): BotTurn {
    switch (name) {
      case 'farmer':
        return this.startFarmer();
      case 'place':
        return this.startPlace('best');
      case 'sow':
        return this.startPlace('sow');
      case 'soil':
        return this.startSoil();
      case 'crop':
        return this.startCrop();
      case 'land':
        return this.startPlace('land');
      case 'good':
        return { bubbles: [`<p>${pick(['Glad that helped!', 'Great, happy farming!', 'Wonderful. Anything else I can check?'])}</p>`], chips: [chip('Another farmer', '#farmer'), MENU_CHIP] };
      case 'bad':
        return {
          bubbles: ['<p>Sorry about that. If you share the exact soil readings, my advice gets a lot sharper.</p>'],
          chips: [chip('Check my soil', '#soil'), MENU_CHIP],
        };
      default:
        this.flow = null;
        return { bubbles: [`<p>${pick(['What would you like to do?', "Sure, here's the menu.", 'Here is what I can help with:'])}</p>`], chips: [], menu: true };
    }
  }

  private smallTalk(lower: string): BotTurn | null {
    if (/^(menu|main menu|start|start over|restart|back|options|home)[\s!.]*$/.test(lower)) return this.command('menu');
    if (/^(hi+|hello|hey|hii+|sat sri akal|namaste|namaskar|good (morning|afternoon|evening))[\s!.?]*$/.test(lower)) {
      this.flow = null;
      return {
        bubbles: [`<p>${pick(['Sat Sri Akal! How can I help?', 'Hello! Good to see you.', 'Namaste! I am here to help.'])} What would you like to check?</p>`],
        chips: [],
        menu: true,
      };
    }
    if (/\b(thanks|thank you|thx|shukriya|dhanyavaad|dhanvaad)\b/.test(lower)) {
      return { bubbles: [`<p>${pick(['Happy to help! Anything else?', 'Anytime! Want to check another field?', "You're welcome. Good luck with the season!"])}</p>`], chips: [chip('Another farmer', '#farmer'), chip('Check my soil', '#soil'), MENU_CHIP] };
    }
    if (/\b(bye|goodbye|see you|alvida)\b/.test(lower)) {
      return { bubbles: ['<p>Goodbye! Wishing you a good harvest. Tap me any time you need advice.</p>'], chips: [MENU_CHIP] };
    }
    if (/who are you|what are you|your name|what can you do|^help[\s!?.]*$/.test(lower)) {
      return {
        bubbles: [
          "<p>I'm <b>Kisaan Mitra</b>. I look at a field's NDVI, soil fertility, moisture, rainfall and temperature, compare it with approved farms in the registry, and suggest the crop that will do best.</p>",
          '<p>You can type a farmer ID, a district, or your own soil numbers. Or pick from the menu:</p>',
        ],
        chips: [],
        menu: true,
      };
    }
    if (!this.flow && /^(ok|okay|hmm+|fine|cool|great|nice|good|alright)[\s!.]*$/.test(lower)) {
      return { bubbles: [`<p>${pick(['Great! What next?', 'Alright. Anything else you want to check?'])}</p>`], chips: [], menu: true };
    }
    return null;
  }

  private continueFlow(text: string, lower: string): BotTurn | null {
    const flow = this.flow!;
    const tokens = tokenize(lower);

    if (flow.name === 'farmer') {
      const found = this.findParcels(text, lower);
      if (found.length === 1) {
        this.flow = null;
        return this.farmerTurn(found[0]);
      }
      if (found.length > 1) return this.disambiguate(found);
      const id = text.match(/\bPB-[A-Z]{3}-\d{4}\b/i);
      if (id) return this.notFound(id[0].toUpperCase());
      const partial = this.partialNameMatches(tokens);
      if (partial.length === 1) {
        this.flow = null;
        return this.farmerTurn(partial[0]);
      }
      if (partial.length > 1) return this.nameMatches(text, partial);
      return this.tryUnderstand(text, lower) ?? this.notFound(text);
    }

    if (tokens.length > 4 && /best|grow|sow|plant|why|compare|\bvs\b|good|crop|farmer/.test(lower)) {
      this.flow = null;
      return this.understand(text, lower);
    }

    if (flow.name === 'place') {
      const found = this.findParcels(text, lower);
      if (flow.purpose === 'land' && found.length === 1) {
        this.flow = null;
        return this.landTurn(found[0]);
      }
      if (flow.purpose === 'land' && /\b(all|punjab|state|everything|overall)\b/.test(lower)) {
        this.flow = null;
        return this.districtLandTurn(undefined, this.acreFilter(lower));
      }
      if (flow.purpose === 'crop' && flow.crop && found.length === 1) {
        this.flow = null;
        const p = found[0];
        return this.cropCheckTurn(flow.crop, this.reg.adviseParcel(p, this.month()), `${firstName(p.name)} ji's field`, { parcel: p, district: p.district, village: p.village });
      }
      if (flow.purpose === 'crop' && flow.crop && /\bjust\b|about it|tell me|info/.test(lower)) {
        const crop = flow.crop;
        this.flow = null;
        return this.cropInfoTurn(CROP_BY_NAME.get(crop)!);
      }
      const district = this.findDistrict(lower, tokens);
      if (district) {
        const village = this.findVillage(tokens) ?? flow.village;
        this.flow = null;
        if (flow.purpose === 'sow') return this.sowTurn(district, village);
        if (flow.purpose === 'land') return this.districtLandTurn(district, this.acreFilter(lower));
        if (flow.purpose === 'crop' && flow.crop) {
          const advice = this.reg.bestInDistrict(district, village, this.month());
          return this.cropCheckTurn(flow.crop, advice, village ? `${village}, ${district}` : district, { district, village });
        }
        return this.districtTurn(district, village);
      }
      return (
        this.tryUnderstand(text, lower) ?? {
          bubbles: ["<p>I didn't catch the district. Pick one below or type its name.</p>"],
          chips: [...this.districtChips(), MENU_CHIP],
        }
      );
    }

    if (flow.name === 'soil') {
      if (flow.step === 'fertility') {
        const level = this.parseLevel(lower, FERTILITY_LEVELS, 0, 100);
        if (level.ok) {
          this.flow = { ...flow, step: 'moisture', fertility: level.value };
          return this.soilQuestion('moisture');
        }
      } else if (flow.step === 'moisture') {
        const level = this.parseLevel(lower, MOISTURE_LEVELS, 5, 60);
        if (level.ok) {
          this.flow = { ...flow, step: 'district', moisture: level.value };
          return this.soilQuestion('district');
        }
      } else {
        const district = this.findDistrict(lower, tokens);
        if (district || NOT_SURE.test(lower)) {
          this.flow = null;
          return this.soilResult(flow.fertility, flow.moisture, district);
        }
      }
      return (
        this.breakOut(text, lower) ?? {
          bubbles: ["<p>Sorry, I didn't get that. Tap one of the options, or type a number.</p>"],
          chips: this.soilChips(flow.step),
        }
      );
    }

    const crop = this.findCrops(lower, tokens)[0];
    if (crop) {
      this.flow = { name: 'place', purpose: 'crop', crop };
      return {
        bubbles: [`<p>${pick([`Where would you grow ${crop}?`, `Good pick. Where should I check ${crop}?`])} Choose a district or type a farmer ID.</p>`],
        chips: [
          ...(this.ctx.parcel ? [chip(`${firstName(this.ctx.parcel.name)}'s field`, this.ctx.parcel.id)] : []),
          ...this.districtChips(),
          chip(`Just tell me about ${crop}`, 'just tell me about it'),
        ],
      };
    }
    return this.tryUnderstand(text, lower) ?? { bubbles: ['<p>Which crop? Pick one below.</p>'], chips: this.cropChips() };
  }

  private nameMatches(text: string, partial: Parcel[]): BotTurn {
    this.flow = { name: 'farmer' };
    return {
      bubbles: [
        partial.length <= 8
          ? `<p>I found ${partial.length} farmers matching "${esc(text)}". Which one?</p>`
          : `<p>${partial.length} farmers match "${esc(text)}". Could you give me the full name or the ID? Here are a few:</p>`,
      ],
      chips: [...partial.slice(0, 8).map((p) => chip(`${p.name} · ${acresText(p.acres)} · ${p.district}`, p.id)), MENU_CHIP],
    };
  }

  private tryUnderstand(text: string, lower: string): BotTurn | null {
    const saved = this.flow;
    this.flow = null;
    const turn = this.understand(text, lower);
    if (!turn) this.flow = saved;
    return turn;
  }

  private breakOut(text: string, lower: string): BotTurn | null {
    const tokens = tokenize(lower);
    const definite =
      /\bPB-[A-Z]{3}-\d{4}\b/i.test(text) ||
      this.findParcels(text, lower).length > 0 ||
      (this.findDistrict(lower, tokens) && this.findCrops(lower, tokens).length > 0) ||
      NUMBER_FIELDS.some(([re]) => new RegExp(`(?:${re.source})\\s*(?:is|of|=|:|at)?\\s*\\d`).test(lower));
    if (!definite) return null;
    this.flow = null;
    return this.understand(text, lower);
  }

  private understand(text: string, lower: string): BotTurn | null {
    const tokens = tokenize(lower);
    const crops = this.findCrops(lower, tokens);
    const idMatch = text.match(/\bPB-[A-Z]{3}-\d{4}\b/i);
    const parcels = this.findParcels(text, lower);
    if (idMatch && !parcels.length) return this.notFound(idMatch[0].toUpperCase());
    if (parcels.length > 1) return this.disambiguate(parcels);
    const parcel = parcels[0];
    const district = this.findDistrict(lower, tokens);
    const village = this.findVillage(tokens);

    const wantsWhy = /\bwhy\b|explain|reason|how come/.test(lower);
    const wantsCompare =
      (crops.length >= 2 && /compare|\bvs\b|versus|better|\bor\b|which/.test(lower)) ||
      (crops.length === 1 && /compare|better than|\bvs\b|versus/.test(lower));
    const wantsWhen = crops.length > 0 && /\bwhen\b|sowing|sow date|best time|what time/.test(lower);
    const wantsNow = /this month|this season|right now|\bnow\b|\btoday\b/.test(lower);
    const wantsLand =
      /\bacres?\b|\bkill?e\b|\bbigha\b|smallholder|small farm|marginal|holding size|land (size|holding|area|record|detail)|size of|how (much|big|large)\b.*\b(land|farm|field|holding)|\bland\b.*\b(does|do|has|have|own)|\bown\b.*\bland/.test(lower) &&
      !/\b(grow|sow|plant|crop|fertil|moist)/.test(lower);
    const wantsConstruction =
      /\billegal construct|built-?up|farmhouse|unauthori[sz]ed (build|construct)|encroach/.test(lower);
    const month = this.month();

    if (parcel) {
      const advice = this.reg.adviseParcel(parcel, month);
      const place = { parcel, district: parcel.district, village: parcel.village };
      const label = `${firstName(parcel.name)} ji's field`;
      if (wantsLand && !crops.length) return this.landTurn(parcel);
      if (wantsCompare) return this.compareTurn(crops, advice, label, place);
      if (crops.length) return this.cropCheckTurn(crops[0], advice, label, place);
      return this.farmerTurn(parcel);
    }

    if (/another|different|other|next/.test(lower) && /farmer|field|holding/.test(lower)) return this.startFarmer();

    const given: (keyof Profile)[] = [];
    const profile = this.reg.baseline(district, village);
    for (const [re, key] of NUMBER_FIELDS) {
      const m = lower.match(new RegExp(`(?:${re.source})\\s*(?:is|of|=|:|at)?\\s*(-?\\d+(?:\\.\\d+)?)`));
      if (m) {
        profile[key] = parseFloat(m[1]);
        given.push(key);
      }
    }
    if (given.length) {
      if (crops.length) {
        return this.cropCheckTurn(crops[0], this.reg.advise(profile, district, month), 'your field', { district, village });
      }
      return this.profileTurn(profile, given, district);
    }

    if (wantsConstruction) return this.violationTurn('illegal_construction', district);
    if (district && wantsLand) return this.districtLandTurn(district, this.acreFilter(lower));

    if (district) {
      const where = village ? `${village}, ${district}` : district;
      const advice = this.reg.bestInDistrict(district, village, month);
      const place = { district, village };
      if (wantsCompare) return this.compareTurn(crops, advice, where, place);
      if (wantsWhen) {
        this.setContext({ ...place, advice, label: where });
        return this.sowingTurn(crops[0]);
      }
      if (crops.length) return this.cropCheckTurn(crops[0], advice, where, place);
      return wantsNow ? this.sowTurn(district, village) : this.districtTurn(district, village);
    }

    if (village) {
      this.flow = { name: 'place', purpose: wantsNow ? 'sow' : 'best', village };
      return {
        bubbles: [`<p>There's a <b>${esc(village)}</b> in every district I cover. Which district is yours?</p>`],
        chips: this.districtChips(),
      };
    }

    if (wantsLand) {
      return this.ctx.parcel && !/\b(farms|holdings|all|punjab|district|state)\b/.test(lower)
        ? this.landTurn(this.ctx.parcel)
        : this.districtLandTurn(undefined, this.acreFilter(lower));
    }
    if (wantsWhy) return this.explainTurn(crops[0]);
    if (wantsCompare) return this.compareTurn(crops);
    if (wantsWhen) return this.sowingTurn(crops[0]);
    if (crops.length) {
      if (this.ctx.advice && /good|okay|\bok\b|fine|suit|grow|what about|how about|instead|better|\bshould\b/.test(lower)) {
        return this.cropCheckTurn(crops[0], this.ctx.advice, this.ctx.label ?? 'this field', this.ctx);
      }
      return this.cropInfoTurn(CROP_BY_NAME.get(crops[0])!);
    }
    if (wantsNow) return this.ctx.district ? this.sowTurn(this.ctx.district, this.ctx.village) : this.startPlace('sow');
    if (/what crop|which crop|best crop|suggest|recommend|what (should|can|to)\b.*\b(grow|plant|sow)/.test(lower)) {
      if (this.ctx.advice) return this.recapTurn(this.ctx.advice, this.ctx.label ?? 'this field');
      return this.startPlace('best');
    }
    if (tokens.length <= 3) {
      const partial = this.partialNameMatches(tokens);
      if (partial.length === 1) return this.farmerTurn(partial[0]);
      if (partial.length > 1) return this.nameMatches(text, partial);
    }
    return null;
  }

  private recapTurn(advice: Advice, label: string): BotTurn {
    const top = advice.ranked[0];
    return {
      bubbles: [
        `<p>${pick([`For ${esc(label)}, I'd go with <b>${esc(top.crop.name)}</b> (${top.score}/100).`, `My top pick for ${esc(label)} is still <b>${esc(top.crop.name)}</b>, at ${top.score}/100.`])}</p>`,
        cropCards(advice.ranked),
      ],
      chips: [chip(`Why ${top.crop.name}?`), chip(`When to sow ${top.crop.name}?`), chip('Another farmer', '#farmer'), MENU_CHIP],
      feedback: true,
    };
  }

  private fallback(): BotTurn {
    return {
      bubbles: [
        `<p>${pick(["Hmm, I didn't quite catch that.", "Sorry, I couldn't match that to a farmer, district or soil reading."])} You can type a farmer ID, a district or your soil numbers, or pick an option:</p>`,
      ],
      chips: [],
      menu: true,
    };
  }

  private setContext(next: Context): void {
    this.ctx = { ...next };
  }

  private startFarmer(): BotTurn {
    this.flow = { name: 'farmer' };
    return {
      bubbles: [
        `<p>${pick(["Sure! Type the farmer's ID (like PB-LDH-0001) or their full name.", 'Happy to help. Which farmer? Give me an ID like PB-LDH-0001 or a full name.'])}</p><p class="kc-sub">Or try one of these:</p>`,
      ],
      chips: [...this.sampleFarmers(), MENU_CHIP],
    };
  }

  private startPlace(purpose: 'best' | 'sow' | 'land'): BotTurn {
    this.flow = { name: 'place', purpose };
    if (purpose === 'land') {
      return {
        bubbles: ["<p>Whose land should I look up? Pick a district for its holdings, or type a farmer's ID or name.</p>"],
        chips: [chip('All of Punjab'), ...this.districtChips()],
      };
    }
    const text =
      purpose === 'sow'
        ? `Which district? I'll check what can be sown there this ${MONTH_NAMES[this.month() - 1]}.`
        : pick(['Which district is the farm in?', 'Sure. Which district should I look at?']);
    return { bubbles: [`<p>${text}</p>`], chips: this.districtChips() };
  }

  private acreFilter(lower: string): { min?: number; max?: number } | undefined {
    const over = lower.match(/(?:over|above|more than|bigger than|larger than|at least|>)\s*(\d+(?:\.\d+)?)\s*acres?/);
    const under = lower.match(/(?:under|below|less than|smaller than|up to|<)\s*(\d+(?:\.\d+)?)\s*acres?/);
    if (!over && !under) return /smallholder|small farm|marginal/.test(lower) ? { max: 5 } : undefined;
    return { min: over ? parseFloat(over[1]) : undefined, max: under ? parseFloat(under[1]) : undefined };
  }

  private violationTurn(code: string, district?: string): BotTurn {
    const farms = this.reg.parcels
      .filter((p) => p.violation === code && (!district || p.district === district))
      .sort((a, b) => b.risk - a.risk);
    const where = district ?? 'Punjab';
    const label = VIOLATIONS[code] ?? code;
    if (!farms.length) {
      return {
        bubbles: [`<p>No holdings in ${esc(where)} are currently flagged for ${esc(label)}.</p>`],
        chips: [chip('Advise a farmer', '#farmer'), MENU_CHIP],
      };
    }
    const list = farms
      .slice(0, 8)
      .map(
        (p) =>
          `<li><b>${esc(p.name)}</b> · ${p.id} · ${acresText(p.acres)} · ${esc(p.village)}${district ? '' : `, ${esc(p.district)}`} · risk ${p.risk} · ${esc(p.detectedCrop)}</li>`,
      )
      .join('');
    return {
      bubbles: [
        `<p>The satellite desk has <b>${farms.length}</b> holding${farms.length > 1 ? 's' : ''} in ${esc(where)} flagged for ${esc(label)}. Assign an officer from Field audit, Compliance, or the land record to verify on site.</p>`,
        `<ul class="kc-list">${list}</ul>${farms.length > 8 ? `<p class="kc-sub">${farms.length - 8} more cases on the Field audit queue.</p>` : ''}`,
      ],
      chips: [...farms.slice(0, 3).map((p) => chip(`${p.name} · ${p.id}`, p.id)), MENU_CHIP],
    };
  }

  private landTurn(p: Parcel): BotTurn {
    const stats = this.reg.landStats(p.district);
    const pct = this.reg.landPercentile(p);
    const name = firstName(p.name);
    this.setContext({ parcel: p, district: p.district, village: p.village, advice: this.reg.adviseParcel(p, this.month()), label: `${name} ji's field` });
    const size = pct >= 75 ? 'one of the larger holdings' : pct <= 25 ? 'one of the smaller holdings' : 'a mid-sized holding';
    const avg = Math.round(stats.mean * 10) / 10;
    return {
      bubbles: [
        `<p><b>${esc(p.name)}</b> (${p.id}) holds <b>${acresText(p.acres)}</b> of land in ${esc(p.village)}, ${esc(p.district)}.</p>${statTiles([
          ['Holding', acresText(p.acres)],
          [`${p.district} average`, acresText(avg)],
          ['Larger than', `${pct}% of farms`],
        ])}`,
        `<p>That's ${size} in ${esc(p.district)}, where ${stats.count} registered farms cover ${Math.round(stats.total).toLocaleString('en-IN')} acres.${p.acres < 5 ? ' It counts as a smallholding (under 5 acres).' : ''}</p>`,
      ],
      chips: [chip(`What should ${name} grow?`, p.id), chip(`Land holdings in ${p.district}`), chip('Another farmer', '#farmer'), MENU_CHIP],
    };
  }

  private districtLandTurn(district?: string, filter?: { min?: number; max?: number }): BotTurn {
    const where = district ?? 'Punjab';
    if (district) {
      this.setContext({ district, advice: this.reg.bestInDistrict(district, undefined, this.month()), label: `a typical field in ${district}` });
    }
    const farms = district ? this.reg.parcels.filter((p) => p.district === district) : this.reg.parcels;
    const landChip = (p: Parcel) => chip(`${p.name} · ${acresText(p.acres)}`, `How much land does ${p.id} have?`);

    if (filter) {
      const hits = farms
        .filter((p) => (filter.min === undefined || p.acres > filter.min) && (filter.max === undefined || p.acres < filter.max))
        .sort((a, b) => b.acres - a.acres);
      const range =
        filter.min !== undefined && filter.max !== undefined
          ? `between ${filter.min} and ${filter.max} acres`
          : filter.min !== undefined
            ? `over ${filter.min} acres`
            : `under ${filter.max} acres`;
      if (!hits.length) {
        return { bubbles: [`<p>No registered farms ${range} in ${esc(where)}.</p>`], chips: [chip(`Land holdings in ${where}`), MENU_CHIP] };
      }
      const list = hits
        .slice(0, 8)
        .map((p) => `<li><b>${esc(p.name)}</b> · ${p.id} · ${acresText(p.acres)} · ${esc(p.village)}${district ? '' : `, ${esc(p.district)}`}</li>`)
        .join('');
      return {
        bubbles: [
          `<p>I found <b>${hits.length}</b> farm${hits.length > 1 ? 's' : ''} ${range} in ${esc(where)}${hits.length > 8 ? ', largest first' : ''}:</p><ul class="kc-list">${list}</ul>`,
        ],
        chips: [...hits.slice(0, 3).map(landChip), chip(`Land holdings in ${where}`), MENU_CHIP],
      };
    }

    const stats = this.reg.landStats(district);
    const r1 = (v: number) => Math.round(v * 10) / 10;
    return {
      bubbles: [
        `<p>${esc(where)} has <b>${stats.count.toLocaleString('en-IN')}</b> registered farms covering <b>${Math.round(stats.total).toLocaleString('en-IN')} acres</b>.</p>${statTiles([
          ['Average', acresText(r1(stats.mean))],
          ['Median', acresText(r1(stats.median))],
          ['Under 5 acres', `${stats.smallholders} farms`],
          ['Largest', acresText(stats.largest.acres)],
        ])}`,
        `<p>Largest holding: <b>${esc(stats.largest.name)}</b> (${stats.largest.id}) with ${acresText(stats.largest.acres)} in ${esc(stats.largest.village)}. Smallest: <b>${esc(stats.smallest.name)}</b> (${stats.smallest.id}) with ${acresText(stats.smallest.acres)}.</p>`,
      ],
      chips: [
        landChip(stats.largest),
        chip(`Farms over 15 acres in ${where}`),
        chip(`Farms under 5 acres in ${where}`),
        district ? chip(`Best crops for ${district}`) : chip('Pick a district', '#land'),
        MENU_CHIP,
      ],
    };
  }

  private startSoil(): BotTurn {
    this.flow = { name: 'soil', step: 'fertility' };
    return {
      bubbles: ["<p>Let's check your soil in three quick steps.</p>", this.soilPrompt('fertility')],
      chips: this.soilChips('fertility'),
    };
  }

  private startCrop(): BotTurn {
    this.flow = { name: 'crop' };
    return { bubbles: ['<p>Which crop are you thinking about?</p>'], chips: this.cropChips() };
  }

  private soilPrompt(step: 'fertility' | 'moisture' | 'district'): string {
    if (step === 'fertility') return '<p><b>Step 1 of 3.</b> How fertile is the soil?</p><p class="kc-sub">Pick one, or type a number from 0 to 100.</p>';
    if (step === 'moisture') return '<p><b>Step 2 of 3.</b> How wet does the field usually stay?</p><p class="kc-sub">Pick one, or type the soil moisture in %.</p>';
    return '<p><b>Step 3 of 3.</b> Which district is it in?</p>';
  }

  private soilQuestion(step: 'moisture' | 'district'): BotTurn {
    return { bubbles: [`<p>${pick(['Got it.', 'Noted.', 'Okay.'])}</p>`, this.soilPrompt(step)], chips: this.soilChips(step) };
  }

  private soilChips(step: 'fertility' | 'moisture' | 'district'): Chip[] {
    if (step === 'fertility') return ['Very fertile', 'Fertile', 'Average', 'Weak', 'Not sure'].map((l) => chip(l));
    if (step === 'moisture') return ['Waterlogged', 'Well irrigated', 'Moderate', 'Dry / rain-fed', 'Not sure'].map((l) => chip(l));
    return [...this.districtChips(), chip('Skip')];
  }

  private soilResult(fertility: number | undefined, moisture: number | undefined, district?: string): BotTurn {
    const profile = this.reg.baseline(district);
    const given: (keyof Profile)[] = [];
    if (fertility !== undefined) {
      profile.fertility = fertility;
      given.push('fertility');
    }
    if (moisture !== undefined) {
      profile.rainfall = Math.min(900, Math.max(250, profile.rainfall * (moisture / profile.moisture)));
      profile.moisture = moisture;
      given.push('moisture');
    }
    return this.profileTurn(profile, given, district, moisture !== undefined);
  }

  private parseLevel(lower: string, levels: [RegExp, number][], min: number, max: number): { ok: boolean; value?: number } {
    if (NOT_SURE.test(lower)) return { ok: true };
    const num = lower.match(/-?\d+(?:\.\d+)?/);
    if (num) {
      const v = parseFloat(num[0]);
      if (v >= min && v <= max) return { ok: true, value: v };
    }
    const level = levels.find(([re]) => re.test(lower));
    return level ? { ok: true, value: level[1] } : { ok: false };
  }

  private farmerTurn(p: Parcel): BotTurn {
    const advice = this.reg.adviseParcel(p, this.month());
    const name = firstName(p.name);
    this.setContext({ parcel: p, district: p.district, village: p.village, advice, label: `${name} ji's field` });

    const profile = profileOf(p);
    const ndviMean = p.ndvi.reduce((s, x) => s + x, 0) / p.ndvi.length;
    const peak = p.ndvi.indexOf(Math.max(...p.ndvi));
    const top = advice.ranked[0];
    const current = advice.ranked.find((c) => c.crop.name === p.crop)!;
    const other = top === current ? advice.ranked[1] : current;

    const opener = pick([
      `Here's ${p.name}'s field (${p.id}) in ${p.village}, ${p.district}.`,
      `Found it! ${p.name}, ${p.id}, from ${p.village}, ${p.district}.`,
      `Pulled up ${p.name}'s record (${p.id}) from ${p.village}, ${p.district}.`,
    ]);
    const flag =
      p.violation !== 'none'
        ? `<p class="kc-flag">Heads up: this holding is flagged for ${esc(VIOLATIONS[p.violation] ?? p.violation)}. My advice covers the soil only; the loan desk has to clear the flag first.</p>`
        : '';
    const seen = p.detectedCrop !== p.crop ? ` From orbit the field reads as <b>${esc(p.detectedCrop)}</b>, not ${esc(p.crop)}.` : '';
    const pct = this.reg.landPercentile(p);
    const size = pct >= 75 ? ', one of the larger holdings in the district' : pct <= 25 ? ', one of the smaller holdings in the district' : '';
    const summary = `<p>${esc(name)} ji farms <b>${acresText(p.acres)}</b>${size}. The soil is <b>${fertilityWord(profile.fertility)}</b> (fertility ${profile.fertility.toFixed(0)}) and <b>${moistureWord(profile.moisture)}</b> (${profile.moisture.toFixed(1)}% moisture). NDVI averages ${ndviMean.toFixed(2)} and peaks in ${MONTH_NAMES[peak]}.${seen}</p>${profileChips(profile, p.acres)}`;
    const verdict =
      top === current
        ? pick([`Good news: <b>${esc(p.crop)}</b> is already the best fit here. I'd keep it.`, `<b>${esc(p.crop)}</b> suits this field best, so no change needed.`])
        : pick([
            `I'd suggest switching from ${esc(p.crop)} to <b>${esc(top.crop.name)}</b>. It scores <b>${top.score}</b> here, against ${current.score} for ${esc(p.crop)}.`,
            `<b>${esc(top.crop.name)}</b> looks like the stronger choice: ${top.score}/100, compared with ${current.score} for the current ${esc(p.crop)}.`,
          ]);

    return {
      bubbles: [`<p>${esc(opener)}</p>${flag}`, summary, `<p class="kc-verdict">${verdict}</p>${cropCards(advice.ranked)}${avoidLine(advice.ranked)}`],
      chips: [
        chip(`Why ${top.crop.name}?`),
        chip(`When to sow ${top.crop.name}?`),
        chip(`${top.crop.name} vs ${other.crop.name}`, `Compare ${top.crop.name} and ${other.crop.name}`),
        chip('Land details', `How much land does ${p.id} have?`),
        chip('Another farmer', '#farmer'),
        MENU_CHIP,
      ],
      feedback: true,
    };
  }

  private districtTurn(district: string, village?: string): BotTurn {
    const where = village ? `${village}, ${district}` : district;
    const advice = this.reg.bestInDistrict(district, village, this.month());
    this.setContext({ district, village, advice, label: `a typical field in ${where}` });
    const top = advice.ranked[0];
    const alt = advice.ranked[3];
    const opener = pick([
      `Here's what grows best on a typical field in ${where}.`,
      `For ${where}, these crops do best on approved farms:`,
      `I looked at approved farms across ${where}. Top picks:`,
    ]);
    const land = this.reg.landStats(district);
    const holdings = `<p class="kc-sub">${land.count} registered farms in ${esc(district)}, averaging ${acresText(Math.round(land.mean * 10) / 10)} each.</p>`;
    return {
      bubbles: [`<p>${esc(opener)}</p>${holdings}${profileChips(advice.profile)}`, `${cropCards(advice.ranked)}${avoidLine(advice.ranked)}`],
      chips: [
        chip(`What can I sow now in ${district}?`),
        chip(`Why ${top.crop.name}?`),
        chip(`Is ${alt.crop.name} good for ${district}?`),
        chip('Check my soil', '#soil'),
        MENU_CHIP,
      ],
      feedback: true,
    };
  }

  private sowTurn(district?: string, village?: string): BotTurn {
    const month = this.month();
    const monthName = MONTH_NAMES[month - 1];
    const where = district ? (village ? `${village}, ${district}` : district) : 'Punjab';
    const advice = this.reg.advise(this.reg.baseline(district, village), district, month);
    this.setContext({ district, village, advice, label: `a typical field in ${where}` });
    const open = advice.ranked.filter((c) => c.sowNow);
    const chips = [
      ...(district ? [chip(`Best crops for ${district}`)] : [chip('Pick my district', '#sow')]),
      chip('Check my soil', '#soil'),
      MENU_CHIP,
    ];
    if (!open.length) {
      return { bubbles: [`<p>No crop in my list has its sowing window open in ${monthName} for ${esc(where)}.</p>`], chips };
    }
    const top = advice.ranked[0];
    const note = top.sowNow ? '' : `<p class="kc-sub">${esc(top.crop.name)} fits best overall, but its window is ${esc(top.crop.sowing)}.</p>`;
    return {
      bubbles: [
        `<p>${pick([`It's ${monthName}, so here's what you can sow right now in ${esc(where)}:`, `Sowing windows open this ${monthName} in ${esc(where)}:`])}</p>`,
        `${open.slice(0, 3).map((c, i) => cropCard(c, i + 1, i === 0)).join('')}${note}`,
      ],
      chips: [chip(`Why ${open[0].crop.name}?`), ...chips],
      feedback: true,
    };
  }

  private profileTurn(profile: Profile, given: (keyof Profile)[], district?: string, rainEstimated = false): BotTurn {
    const advice = this.reg.advise(profile, district, this.month());
    this.setContext({ district, advice, label: 'your field' });
    const filled = (['fertility', 'moisture', 'rainfall', 'temp', 'altitude'] as (keyof Profile)[]).filter(
      (k) => !given.includes(k) && !(rainEstimated && k === 'rainfall'),
    );
    const notes = [
      filled.length ? `Used the ${district ?? 'Punjab'} average for ${filled.join(', ')}.` : '',
      rainEstimated ? 'Estimated rainfall from how wet the field stays.' : '',
    ].filter(Boolean);
    const top = advice.ranked[0];
    const second = advice.ranked[1];
    return {
      bubbles: [
        `<p>${pick(["Based on your readings, here's what I'd grow:", 'Thanks! With soil like yours, these crops fit best:'])}</p>${notes.length ? `<p class="kc-sub">${esc(notes.join(' '))}</p>` : ''}${profileChips(profile)}`,
        `${cropCards(advice.ranked)}${avoidLine(advice.ranked)}`,
      ],
      chips: [
        chip(`Why ${top.crop.name}?`),
        chip(`${top.crop.name} vs ${second.crop.name}`, `Compare ${top.crop.name} and ${second.crop.name}`),
        chip('Change my readings', '#soil'),
        MENU_CHIP,
      ],
      feedback: true,
    };
  }

  private cropCheckTurn(name: CropName, advice: Advice, label: string, place: Context): BotTurn {
    this.setContext({ ...place, advice, label });
    const idx = advice.ranked.findIndex((c) => c.crop.name === name);
    const c = advice.ranked[idx];
    const top = advice.ranked[0];
    const limit = c.limits[0] ? ` Main concern: ${esc(c.limits[0])}.` : '';
    const where = esc(label);
    const verdict =
      idx === 0 && c.score >= 60
        ? pick([`Yes! <b>${name}</b> is the best pick for ${where}, at ${c.score}/100.`, `Great choice. <b>${name}</b> tops the list for ${where} with ${c.score}/100.`])
        : c.score >= 80
          ? `<b>${name}</b> is a good choice for ${where} (${c.score}/100), ranked #${idx + 1}.`
          : c.score >= 60
            ? `<b>${name}</b> can work for ${where}, but it isn't ideal (${c.score}/100).${limit}`
            : `I wouldn't recommend <b>${name}</b> for ${where}. It scores only ${c.score}/100.${limit}`;
    const better = idx > 0 ? `<p>If you're open to it, <b>${esc(top.crop.name)}</b> scores ${top.score} here.</p>` : '';
    const other = idx > 0 ? top : advice.ranked[1];
    const holding = place.parcel
      ? `<p class="kc-sub">${esc(place.parcel.name)} · ${place.parcel.id} · ${acresText(place.parcel.acres)} in ${esc(place.parcel.village)}, ${esc(place.parcel.district)}</p>`
      : '';
    return {
      bubbles: [`${holding}<p>${verdict}</p>`, `${cropCard(c, idx + 1, true, 0)}${better}`],
      chips: [
        chip(`Why ${name}?`),
        chip(`When to sow ${name}?`),
        chip(`${name} vs ${other.crop.name}`, `Compare ${name} and ${other.crop.name}`),
        MENU_CHIP,
      ],
      feedback: true,
    };
  }

  private cropInfoTurn(crop: CropInfo): BotTurn {
    this.flow = { name: 'place', purpose: 'crop', crop: crop.name };
    const r = crop.ranges;
    return {
      bubbles: [
        `<p class="kc-title">${esc(crop.name)} · ${esc(crop.local)}</p><p>${esc(crop.note)}</p><p class="kc-meta">${esc(crop.season)} · ${esc(crop.sowing)} · water ${esc(crop.water.toLowerCase())}</p><p class="kc-meta">Likes fertility ${r.fertility[1]}+, moisture ${r.moisture[1]}–${r.moisture[2]}% and rainfall ${r.rainfall[1]}–${r.rainfall[2]} mm. Strong in ${esc(crop.belt.join(', '))}.</p>`,
        '<p>Want me to check how it would do for a district or a farmer? Pick a district or type a farmer ID.</p>',
      ],
      chips: [
        ...(this.ctx.parcel ? [chip(`${firstName(this.ctx.parcel.name)}'s field`, this.ctx.parcel.id)] : []),
        ...crop.belt.slice(0, 3).map((d) => chip(d)),
        MENU_CHIP,
      ],
    };
  }

  private explainTurn(name?: CropName): BotTurn {
    const advice = this.ctx.advice;
    if (!advice) {
      return {
        bubbles: ['<p>Ask me about a farmer, a district or your soil first. Then I can explain why a crop scores the way it does.</p>'],
        chips: [],
        menu: true,
      };
    }
    const idx = name ? advice.ranked.findIndex((c) => c.crop.name === name) : 0;
    const c = advice.ranked[idx];
    const label = this.ctx.label ?? 'this field';
    const plain = c.limits.length
      ? `The main thing holding it back: ${c.limits[0]}.`
      : c.strengths.length
        ? `${capitalise(c.strengths.join(', '))}, so it is comfortable here.`
        : 'Nothing stands out as a problem.';
    const other = idx === 0 ? advice.ranked[1] : advice.ranked[0];
    return {
      bubbles: [
        `<p>${pick([`Here's how <b>${esc(c.crop.name)}</b> gets ${c.score} for ${esc(label)}:`, `Sure. <b>${esc(c.crop.name)}</b> scores ${c.score} for ${esc(label)}. The breakdown:`])}</p>${breakdown(c)}`,
        `<p>${esc(plain)} ${c.peers.count} approved farms with similar soil grow it with average NDVI ${c.peers.ndvi.toFixed(2)} and risk ${c.peers.risk.toFixed(1)}.</p>`,
      ],
      chips: [
        chip(`When to sow ${c.crop.name}?`),
        chip(`${c.crop.name} vs ${other.crop.name}`, `Compare ${c.crop.name} and ${other.crop.name}`),
        MENU_CHIP,
      ],
    };
  }

  private compareTurn(names: CropName[], advice?: Advice, label?: string, place?: Context): BotTurn {
    const base = advice ?? this.ctx.advice ?? this.reg.advise(this.reg.baseline(), undefined, this.month());
    const where = label ?? this.ctx.label ?? 'a typical Punjab field';
    if (place) this.setContext({ ...place, advice: base, label: where });
    const first = base.ranked.find((c) => c.crop.name === names[0])!;
    const second =
      (names[1] && base.ranked.find((c) => c.crop.name === names[1])) ||
      (base.ranked[0] === first ? base.ranked[1] : base.ranked[0]);
    const [win, lose] = first.score >= second.score ? [first, second] : [second, first];
    const verdict =
      win.score === lose.score
        ? `They're neck and neck for ${esc(where)}.`
        : `<b>${esc(win.crop.name)}</b> comes out ahead for ${esc(where)}: ${win.score} vs ${lose.score}.`;
    const water =
      WATER_RANK[lose.crop.water] < WATER_RANK[win.crop.water]
        ? ` But ${esc(lose.crop.name)} needs less water, which matters if irrigation is tight.`
        : '';
    return {
      bubbles: [`<p>${verdict}${water}</p>${compareTable(first, second)}`],
      chips: [chip(`Why ${win.crop.name}?`), chip(`When to sow ${win.crop.name}?`), MENU_CHIP],
      feedback: true,
    };
  }

  private sowingTurn(name: CropName): BotTurn {
    const crop = CROP_BY_NAME.get(name)!;
    const month = this.month();
    const gap = monthsUntilSowing(crop, month);
    const timing =
      gap === 0
        ? 'The window is open right now, so this is a good time to get started.'
        : `That's about ${gap} month${gap > 1 ? 's' : ''} away.`;
    let alternatives = '';
    if (gap > 0) {
      const advice = this.ctx.advice ?? this.reg.advise(this.reg.baseline(this.ctx.district), this.ctx.district, month);
      const open = advice.ranked.filter((c: CropScore) => c.sowNow && c.crop.name !== name).slice(0, 2);
      if (open.length) {
        alternatives = `<p>Meanwhile, ${open.map((c) => `<b>${esc(c.crop.name)}</b>`).join(' or ')} can go in this ${MONTH_NAMES[month - 1]}.</p>`;
      }
    }
    const place = this.ctx.district ?? 'Ludhiana';
    return {
      bubbles: [`<p><b>${esc(crop.name)}</b> (${esc(crop.local)}): ${esc(crop.sowing)}. ${timing}</p>${alternatives}`],
      chips: [
        chip(`Is ${name} good for ${place}?`),
        chip(`What can I sow now${this.ctx.district ? ` in ${this.ctx.district}` : ''}?`),
        MENU_CHIP,
      ],
    };
  }

  private notFound(query: string): BotTurn {
    this.flow = { name: 'farmer' };
    return {
      bubbles: [`<p>I couldn't find <b>${esc(query)}</b> in the registry. IDs look like PB-LDH-0001. Want to try one of these?</p>`],
      chips: [...this.sampleFarmers(), MENU_CHIP],
    };
  }

  private disambiguate(found: Parcel[]): BotTurn {
    this.flow = { name: 'farmer' };
    return {
      bubbles: [`<p>${found.length} farmers are named <b>${esc(found[0].name)}</b>. Which one do you mean?</p>`],
      chips: found.slice(0, 8).map((p) => chip(`${p.id} · ${acresText(p.acres)} · ${p.village}, ${p.district}`, p.id)),
    };
  }

  private sampleFarmers(): Chip[] {
    const clean = this.reg.parcels.filter((p) => p.violation === 'none');
    return Array.from({ length: 3 }, () => pick(clean)).map((p) => chip(`${p.name} · ${acresText(p.acres)}`, p.id));
  }

  private districtChips(): Chip[] {
    const ordered = this.ctx.district
      ? [this.ctx.district, ...this.reg.districts.filter((d) => d !== this.ctx.district)]
      : this.reg.districts;
    return ordered.map((d) => chip(d));
  }

  private cropChips(): Chip[] {
    return CROPS.map((c) => chip(c.name));
  }

  private findParcels(text: string, lower: string): Parcel[] {
    const id = text.match(/\bPB-[A-Z]{3}-\d{4}\b/i);
    if (id) {
      const p = this.reg.byId.get(id[0].toUpperCase());
      return p ? [p] : [];
    }
    return this.names.find(([name]) => lower.includes(name))?.[1] ?? [];
  }

  private partialNameMatches(tokens: string[]): Parcel[] {
    const words = tokens.filter((t) => t.length >= 4);
    if (!words.length) return [];
    return this.names
      .filter(([name]) => {
        const parts = name.split(' ');
        return words.every((w) => parts.some((part) => fuzzyEquals(w, part)));
      })
      .flatMap(([, parcels]) => parcels);
  }

  private findDistrict(lower: string, tokens: string[]): string | undefined {
    const exact = this.reg.districts.find((d) => lower.includes(d.toLowerCase()));
    if (exact) return exact;
    for (const t of tokens) {
      if (DISTRICT_ALIASES[t]) return DISTRICT_ALIASES[t];
      const fuzzy = this.reg.districts.find((d) => fuzzyEquals(t, d.toLowerCase()));
      if (fuzzy) return fuzzy;
    }
    return undefined;
  }

  private findVillage(tokens: string[]): string | undefined {
    return this.reg.villages.find((v) => tokens.includes(v.toLowerCase()));
  }

  private findCrops(lower: string, tokens: string[]): CropName[] {
    const hits = new Map<CropName, { at: number; strong: boolean }>();
    for (const [key, crop, strong] of CROP_KEYWORDS) {
      let at = -1;
      const direct = lower.search(new RegExp(`\\b${key}`));
      if (direct >= 0) at = direct;
      else if (key.length >= 5) {
        const t = tokens.find((tok) => fuzzyEquals(tok, key));
        if (t) at = lower.indexOf(t);
      }
      if (at < 0) continue;
      const prev = hits.get(crop);
      hits.set(crop, { at: prev ? Math.min(prev.at, at) : at, strong: (prev?.strong ?? false) || strong });
    }
    if (hits.has('Basmati') && hits.get('Wheat-Paddy')?.strong === false) hits.delete('Wheat-Paddy');
    return [...hits.entries()].sort((a, b) => a[1].at - b[1].at).map(([c]) => c);
  }
}
