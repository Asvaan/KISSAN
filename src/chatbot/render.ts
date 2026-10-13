import type { CropScore, Profile } from './engine.ts';

export function esc(s: string | number): string {
  return String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function pick<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

export function firstName(name: string): string {
  return name.split(' ')[0];
}

export function fertilityWord(v: number): string {
  return v >= 80 ? 'very fertile' : v >= 65 ? 'fertile' : v >= 45 ? 'average' : 'weak';
}

export function moistureWord(v: number): string {
  return v >= 42 ? 'very wet' : v >= 35 ? 'well-watered' : v >= 29 ? 'moderate' : 'dry';
}

function tone(score: number): string {
  return score >= 80 ? 'good' : score >= 60 ? 'ok' : 'weak';
}

export function bar(percent: number, cls = ''): string {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return `<div class="kc-bar ${cls}"><span class="kc-bar-fill kc-${tone(p)}" style="width:${p}%"></span></div>`;
}

export function cropCard(c: CropScore, rank: number, withNote = false, stagger = rank - 1): string {
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
    <div class="kc-card${rank === 1 ? ' kc-card-top' : ''}" style="--kc-i:${stagger}">
      <div class="kc-card-head">
        <span class="kc-rank">${rank}</span>
        <div class="kc-card-title"><strong>${esc(c.crop.name)}</strong><span>${esc(c.crop.local)}</span></div>
        <span class="kc-score" data-count="${c.score}">${c.score}</span>
      </div>
      ${bar(c.score)}
      <div class="kc-badges">${badges}</div>
      <p class="kc-meta">${esc(c.crop.season)} · ${esc(c.crop.sowing)}</p>
      ${why}
      ${withNote ? `<p class="kc-note">${esc(c.crop.note)}</p>` : ''}
      <p class="kc-peers">${c.peers.count} similar approved farms: NDVI ${c.peers.ndvi.toFixed(2)}, risk ${c.peers.risk.toFixed(1)}</p>
    </div>`;
}

export function cropCards(ranked: CropScore[], n = 3): string {
  return ranked.slice(0, n).map((c, i) => cropCard(c, i + 1, i === 0)).join('');
}

export function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function profileChips(p: Profile): string {
  const items = [
    ['Fertility', p.fertility.toFixed(0)],
    ['Moisture', `${p.moisture.toFixed(1)}%`],
    ['Rainfall', `${p.rainfall.toFixed(0)} mm`],
    ['Temp', `${p.temp.toFixed(1)} °C`],
    ['Altitude', `${p.altitude.toFixed(0)} m`],
  ];
  return `<div class="kc-stats">${items
    .map(([k, v], i) => `<div class="kc-stat" style="--kc-i:${i}"><span>${k}</span><b>${v}</b></div>`)
    .join('')}</div>`;
}

export function avoidLine(ranked: CropScore[]): string {
  const worst = ranked[ranked.length - 1];
  const reason = worst.limits[0] ?? 'weakest match with approved growers of this crop on similar soil';
  return `<p class="kc-avoid">Least suited: <b>${esc(worst.crop.name)}</b> (${worst.score}) – ${esc(reason)}.</p>`;
}

export function breakdown(c: CropScore): string {
  const rows: [string, number, string][] = [
    ['Soil & weather fit', c.agro * 100, '50% of score'],
    ['Match with approved growers', c.fit * 100, '25% of score'],
    ['Growers\' NDVI & risk vs other crops', c.outcome * 100, '10% of score'],
  ];
  return `<div class="kc-breakdown">${rows
    .map(
      ([label, v, w], i) => `
      <div class="kc-break-row" style="--kc-i:${i}">
        <div class="kc-break-head"><span>${label}</span><b data-count="${Math.round(v)}">${Math.round(v)}</b></div>
        ${bar(v)}
        <span class="kc-break-weight">${w}</span>
      </div>`,
    )
    .join('')}
    <div class="kc-break-row" style="--kc-i:3">
      <div class="kc-break-head"><span>District crop belt</span><b>${c.regional ? '+15' : '0'}</b></div>
      <span class="kc-break-weight">${c.regional ? 'This district is an established belt for the crop' : 'Not a traditional belt for this crop here'}</span>
    </div>
  </div>`;
}

export function compareTable(a: CropScore, b: CropScore): string {
  const row = (label: string, x: string, y: string) =>
    `<tr><th>${label}</th><td>${x}</td><td>${y}</td></tr>`;
  const watch = (c: CropScore) => esc(c.limits[0] ?? 'Nothing major');
  return `
    <table class="kc-compare">
      <thead><tr><th></th><th>${esc(a.crop.name)}</th><th>${esc(b.crop.name)}</th></tr></thead>
      <tbody>
        ${row('Score', `<b data-count="${a.score}">${a.score}</b>`, `<b data-count="${b.score}">${b.score}</b>`)}
        ${row('Water', esc(a.crop.water), esc(b.crop.water))}
        ${row('Season', esc(a.crop.season), esc(b.crop.season))}
        ${row('Sow now?', a.sowNow ? 'Yes' : 'No', b.sowNow ? 'Yes' : 'No')}
        ${row('Watch', watch(a), watch(b))}
      </tbody>
    </table>`;
}
