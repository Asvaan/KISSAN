import { CROPS, profileOf } from './engine.ts';
import type { Advice, CropInfo, CropName, CropScore, Parcel, Profile, Registry } from './engine.ts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const VIOLATIONS: Record<string, string> = {
  ghost_cropping: 'ghost cropping (declared crop not seen from orbit)',
  illegal_mining: 'illegal mining (excavated bare ground)',
  illegal_cropping: 'an unpermitted crop',
  double_farming: 'overlapping harvest claims',
  drug_cultivation: 'suspected drug cultivation (off-season closed canopy)',
};

const CROP_WORDS: [RegExp, CropName][] = [
  [/basmati/, 'Basmati'],
  [/wheat|kanak|paddy|jhona|rice|dhan/, 'Wheat-Paddy'],
  [/cotton|narma|kapas/, 'Cotton'],
  [/maize|makki|corn/, 'Maize'],
  [/potato|aloo|alu\b/, 'Potato'],
  [/mustard|sarson|sarhon|raya/, 'Mustard'],
  [/fodder|chara|berseem|jowar/, 'Fodder'],
];

const NUMBER_FIELDS: [RegExp, keyof Profile][] = [
  [/fert\w*|soil\s*(?:health|score)/, 'fertility'],
  [/rain\w*/, 'rainfall'],
  [/moist\w*|soil\s*water/, 'moisture'],
  [/temp\w*/, 'temp'],
  [/alt\w*|elev\w*|height/, 'altitude'],
  [/humid\w*/, 'humidity'],
];

export const SUGGESTIONS = [
  'Advise farmer PB-LDH-0001',
  'Best crops for Bathinda',
  'What can I sow this month in Jalandhar?',
  'Fertility 35, rainfall 420, moisture 26',
  'Is cotton good for Moga?',
];

function esc(s: string | number): string {
  return String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function bar(score: number): string {
  const tone = score >= 80 ? 'good' : score >= 60 ? 'ok' : 'weak';
  return `<div class="kc-bar"><span class="kc-bar-fill kc-${tone}" style="width:${score}%"></span></div>`;
}

function cropCard(c: CropScore, rank: number, withNote = false): string {
  const badges = [
    c.sowNow ? '<span class="kc-badge kc-badge-now">Sow window open now</span>' : '',
    c.regional ? '<span class="kc-badge">District crop belt</span>' : '',
    `<span class="kc-badge kc-badge-water">Water: ${esc(c.crop.water)}</span>`,
  ].join('');
  const why = c.limits.length
    ? `<p class="kc-limit">Watch: ${esc(c.limits.join('; '))}.</p>`
    : c.strengths.length
      ? `<p class="kc-strength">${esc(capitalise(c.strengths.join(', ')))}.</p>`
      : '';
  return `
    <div class="kc-card">
      <div class="kc-card-head">
        <span class="kc-rank">${rank}</span>
        <div class="kc-card-title"><strong>${esc(c.crop.name)}</strong><span>${esc(c.crop.local)}</span></div>
        <span class="kc-score">${c.score}</span>
      </div>
      ${bar(c.score)}
      <div class="kc-badges">${badges}</div>
      <p class="kc-meta">${esc(c.crop.season)} · ${esc(c.crop.sowing)}</p>
      ${why}
      ${withNote ? `<p class="kc-note">${esc(c.crop.note)}</p>` : ''}
      <p class="kc-peers">${c.peers.count} similar approved farms: NDVI ${c.peers.ndvi.toFixed(2)}, risk ${c.peers.risk.toFixed(1)}</p>
    </div>`;
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function profileLine(p: Profile): string {
  return `Soil fertility <b>${p.fertility.toFixed(0)}</b> · moisture <b>${p.moisture.toFixed(1)}%</b> · rainfall <b>${p.rainfall.toFixed(0)} mm</b> · temp <b>${p.temp.toFixed(1)} °C</b> · altitude <b>${p.altitude.toFixed(0)} m</b>`;
}

function topCards(advice: Advice, n = 3): string {
  return advice.ranked.slice(0, n).map((c, i) => cropCard(c, i + 1, i === 0)).join('');
}

function avoidLine(advice: Advice): string {
  const worst = advice.ranked[advice.ranked.length - 1];
  const reason = worst.limits[0] ?? 'weakest match with approved growers of this crop on similar soil';
  return `<p class="kc-avoid">Least suited: <b>${esc(worst.crop.name)}</b> (${worst.score}) – ${esc(reason)}.</p>`;
}

function farmerReply(reg: Registry, p: Parcel): string {
  const advice = reg.adviseParcel(p);
  const profile = profileOf(p);
  const ndviMean = p.ndvi.reduce((s, x) => s + x, 0) / p.ndvi.length;
  const peak = p.ndvi.indexOf(Math.max(...p.ndvi));
  const current = advice.ranked.findIndex((c) => c.crop.name === p.crop);
  const currentScore = advice.ranked[current];
  const flag = p.violation !== 'none'
    ? `<p class="kc-flag">This holding is flagged for ${esc(VIOLATIONS[p.violation] ?? p.violation)}. The crop advice below is for the soil only; the loan desk must clear the flag first.</p>`
    : '';
  const seen = p.detectedCrop !== p.crop
    ? ` Satellite reads the field as <b>${esc(p.detectedCrop)}</b>.`
    : '';
  const top = advice.ranked[0];
  const verdict = top.crop.name === p.crop
    ? `<b>${esc(p.crop)}</b> is already the best fit for this field. Keep it.`
    : `Switching from <b>${esc(p.crop)}</b> (#${current + 1}, ${currentScore.score}) to <b>${esc(top.crop.name)}</b> (${top.score}) is the strongest move for this field.`;

  return `
    <p class="kc-title">${esc(p.name)} · ${esc(p.id)}</p>
    <p class="kc-sub">${esc(p.village)}, ${esc(p.district)} · ${p.acres} acres · credit score ${p.score} · loan ${esc(p.loan)}</p>
    ${flag}
    <p>${profileLine(profile)}</p>
    <p>NDVI averages <b>${ndviMean.toFixed(2)}</b> and peaks in <b>${MONTHS[peak]}</b> (${p.ndvi[peak].toFixed(2)}). Declared crop: <b>${esc(p.crop)}</b>.${seen}</p>
    <p class="kc-verdict">${verdict}</p>
    ${topCards(advice)}
    ${avoidLine(advice)}`;
}

function sowNowReply(reg: Registry, district?: string, village?: string): string {
  const where = village && district ? `${village}, ${district}` : district ?? 'Punjab';
  const advice = reg.advise(reg.baseline(district, village), district);
  const month = MONTHS[new Date().getMonth()];
  const now = advice.ranked.filter((c) => c.sowNow);
  if (!now.length) return `<p>No crop in the registry has its sowing window open in ${month} for ${esc(where)}.</p>`;
  return `
    <p class="kc-title">Sow in ${month} · ${esc(where)}</p>
    <p class="kc-sub">Crops whose sowing window is open now, ranked for a typical ${esc(where)} field.</p>
    ${now.slice(0, 3).map((c, i) => cropCard(c, i + 1)).join('')}`;
}

function districtReply(reg: Registry, district: string, village?: string): string {
  const advice = reg.bestInDistrict(district, village);
  const where = village ? `${village}, ${district}` : district;
  return `
    <p class="kc-title">Best crops for ${esc(where)}</p>
    <p class="kc-sub">Typical approved field in ${esc(where)}. Ask about a farmer ID for field-level advice.</p>
    <p>${profileLine(advice.profile)}</p>
    ${topCards(advice)}
    ${avoidLine(advice)}`;
}

function profileReply(reg: Registry, profile: Profile, given: (keyof Profile)[], district?: string): string {
  const advice = reg.advise(profile, district);
  const filled = (['fertility', 'rainfall', 'moisture', 'temp', 'altitude'] as (keyof Profile)[]).filter((k) => !given.includes(k));
  const note = filled.length
    ? `<p class="kc-sub">Filled ${esc(filled.join(', '))} from the ${esc(district ?? 'Punjab')} average.</p>`
    : '';
  return `
    <p class="kc-title">Recommendation for your field</p>
    ${note}
    <p>${profileLine(profile)}</p>
    ${topCards(advice)}
    ${avoidLine(advice)}`;
}

function cropCheckReply(reg: Registry, crop: CropInfo, advice: Advice, where: string): string {
  const idx = advice.ranked.findIndex((c) => c.crop.name === crop.name);
  const c = advice.ranked[idx];
  const verdict =
    idx === 0 && c.score >= 60 ? 'Best fit' : c.score >= 80 ? 'Good choice' : c.score >= 60 ? 'Workable, with care' : 'Not recommended';
  const better = idx > 0 ? `<p>Better fit: <b>${esc(advice.ranked[0].crop.name)}</b> (${advice.ranked[0].score}).</p>` : '';
  return `
    <p class="kc-title">${esc(crop.name)} in ${esc(where)}: ${verdict}</p>
    <p class="kc-sub">Ranks #${idx + 1} of ${advice.ranked.length} for this field.</p>
    ${cropCard(c, idx + 1)}
    <p class="kc-meta">${esc(crop.note)}</p>
    ${better}`;
}

function cropInfoReply(crop: CropInfo): string {
  const r = crop.ranges;
  return `
    <p class="kc-title">${esc(crop.name)} · ${esc(crop.local)}</p>
    <p>${esc(crop.note)}</p>
    <p class="kc-meta">${esc(crop.season)} · ${esc(crop.sowing)} · water ${esc(crop.water.toLowerCase())}</p>
    <p class="kc-meta">Ideal: fertility ${r.fertility[1]}+, moisture ${r.moisture[1]}–${r.moisture[2]}%, rainfall ${r.rainfall[1]}–${r.rainfall[2]} mm.</p>
    <p class="kc-meta">Strong districts: ${esc(crop.belt.join(', '))}.</p>
    <p>Add a farmer ID or district to check the fit for a specific field.</p>`;
}

function helpReply(): string {
  return `
    <p class="kc-title">Crop advisor</p>
    <p>I read each holding's NDVI, soil fertility, moisture, rainfall and temperature from the registry and suggest what to grow.</p>
    <p class="kc-meta">Try a farmer ID (PB-LDH-0001), a farmer name, a district or village, your own soil numbers, or ask "is cotton good for Moga?".</p>`;
}

export function answer(reg: Registry, text: string): string {
  const q = text.trim();
  const lower = q.toLowerCase();
  if (!q || /^(hi|hello|help|hey|sat sri akal|namaste)[\s!.?]*$/.test(lower)) return helpReply();

  const sowNow = /this month|this season|right now|\bnow\b|\btoday\b/.test(lower);
  const crop = CROP_WORDS.find(([re]) => re.test(lower))?.[1];
  const cropInfo = crop ? CROPS.find((c) => c.name === crop)! : undefined;

  const idMatch = q.match(/\bPB-[A-Z]{3}-\d{4}\b/i);
  const byName = idMatch ? [] : reg.parcels.filter((p) => lower.includes(p.name.toLowerCase()));
  const named = [...new Map(byName.map((p) => [p.id, p])).values()];
  const parcel = idMatch ? reg.byId.get(idMatch[0].toUpperCase()) : named.length === 1 ? named[0] : undefined;

  if (idMatch && !parcel) return `<p>No holding with ID <b>${esc(idMatch[0].toUpperCase())}</b> in the registry. IDs look like PB-LDH-0001.</p>`;
  if (!parcel && named.length > 1) {
    const list = named.slice(0, 8).map((p) => `<li><b>${esc(p.id)}</b> · ${esc(p.village)}, ${esc(p.district)} · ${esc(p.crop)}</li>`).join('');
    return `<p>${named.length} farmers are named <b>${esc(named[0].name)}</b>. Which one?</p><ul class="kc-list">${list}</ul>`;
  }
  if (parcel) {
    if (cropInfo) return cropCheckReply(reg, cropInfo, reg.adviseParcel(parcel), `${parcel.name}'s field`);
    return farmerReply(reg, parcel);
  }

  const district = reg.districts.find((d) => lower.includes(d.toLowerCase()));
  const village = reg.villages.find((v) => new RegExp(`\\b${v.toLowerCase()}\\b`).test(lower));

  const given: (keyof Profile)[] = [];
  const profile = reg.baseline(district, village);
  for (const [re, key] of NUMBER_FIELDS) {
    const m = lower.match(new RegExp(`(?:${re.source})\\s*(?:is|of|=|:|at)?\\s*(-?\\d+(?:\\.\\d+)?)`));
    if (m) {
      profile[key] = parseFloat(m[1]);
      given.push(key);
    }
  }
  if (given.length) {
    if (cropInfo) return cropCheckReply(reg, cropInfo, reg.advise(profile, district), 'your field');
    return profileReply(reg, profile, given, district);
  }

  if (village && !district) {
    return `<p>There is a <b>${esc(village)}</b> in every district of the registry. Which one? For example: "best crops for ${esc(village)}, ${esc(reg.districts[0])}".</p><p class="kc-meta">Districts: ${esc(reg.districts.join(', '))}.</p>`;
  }
  if (district) {
    const place = village ? `${village}, ${district}` : district;
    if (cropInfo) return cropCheckReply(reg, cropInfo, reg.bestInDistrict(district, village), place);
    return sowNow ? sowNowReply(reg, district, village) : districtReply(reg, district, village);
  }
  if (cropInfo) return cropInfoReply(cropInfo);
  if (sowNow) return sowNowReply(reg);

  return `<p>I couldn't match that to a farmer, district or soil reading.</p>${helpReply()}`;
}
