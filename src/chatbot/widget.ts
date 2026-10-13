import styles from './chatbot.css?inline';
import { loadRegistry, type Registry } from './engine.ts';
import { answer, SUGGESTIONS } from './reply.ts';

const SPROUT = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 20h10"/><path d="M12 20v-8"/><path d="M12 12c0-3.3-2.7-6-6-6H4v1c0 3.3 2.7 6 6 6h2"/><path d="M12 12c0-3.3 2.7-6 6-6h2v1c0 3.3-2.7 6-6 6h-2"/></svg>`;
const CLOSE = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
const SEND = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`;

export function mountChatbot(): void {
  const host = document.createElement('div');
  host.id = 'kisaan-crop-advisor';
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: 'open' });

  root.innerHTML = `
    <style>${styles}</style>
    <button class="kc-launcher" type="button" aria-label="Open crop advisor">${SPROUT}<span>Crop advisor</span></button>
    <section class="kc-panel" role="dialog" aria-label="Crop advisor" hidden>
      <header class="kc-header">
        <div class="kc-header-icon">${SPROUT}</div>
        <div class="kc-header-text">
          <p class="kc-eyebrow">Kisaan Credit</p>
          <h2>Crop advisor <span>ਫ਼ਸਲ ਸਲਾਹ</span></h2>
          <p class="kc-status">Connecting to registry…</p>
        </div>
        <button class="kc-close" type="button" aria-label="Close crop advisor">${CLOSE}</button>
      </header>
      <div class="kc-log" aria-live="polite"></div>
      <div class="kc-chips"></div>
      <form class="kc-form">
        <input class="kc-input" type="text" autocomplete="off" placeholder="Farmer ID, district, or your soil numbers" aria-label="Ask the crop advisor" />
        <button class="kc-send" type="submit" aria-label="Send">${SEND}</button>
      </form>
    </section>`;

  const launcher = root.querySelector<HTMLButtonElement>('.kc-launcher')!;
  const panel = root.querySelector<HTMLElement>('.kc-panel')!;
  const close = root.querySelector<HTMLButtonElement>('.kc-close')!;
  const log = root.querySelector<HTMLDivElement>('.kc-log')!;
  const chips = root.querySelector<HTMLDivElement>('.kc-chips')!;
  const form = root.querySelector<HTMLFormElement>('.kc-form')!;
  const input = root.querySelector<HTMLInputElement>('.kc-input')!;
  const status = root.querySelector<HTMLParagraphElement>('.kc-status')!;

  let registry: Promise<Registry> | null = null;

  const push = (who: 'bot' | 'user', html: string) => {
    const el = document.createElement('div');
    el.className = `kc-msg kc-${who}`;
    if (who === 'user') el.textContent = html;
    else el.innerHTML = html;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  };

  const ensureRegistry = () => {
    if (!registry) {
      registry = loadRegistry();
      registry
        .then((r) => {
          const clean = r.parcels.filter((p) => p.violation === 'none').length;
          status.textContent = `${r.parcels.length.toLocaleString()} holdings · ${clean.toLocaleString()} clean fields used for advice`;
        })
        .catch(() => {
          status.textContent = 'Registry unavailable';
          registry = null;
        });
    }
    return registry;
  };

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q) return;
    push('user', q);
    input.value = '';
    const pending = push('bot', '<p class="kc-typing"><span></span><span></span><span></span></p>');
    try {
      const reg = await ensureRegistry();
      pending.innerHTML = answer(reg, q);
    } catch {
      pending.innerHTML = '<p>Could not load the parcel registry. Check your connection and try again.</p>';
    }
    log.scrollTop = pending.offsetTop - log.offsetTop - 12;
  };

  SUGGESTIONS.forEach((s) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'kc-chip';
    chip.textContent = s;
    chip.addEventListener('click', () => ask(s));
    chips.appendChild(chip);
  });

  const open = () => {
    panel.hidden = false;
    launcher.hidden = true;
    ensureRegistry();
    if (!log.childElementCount) {
      push(
        'bot',
        `<p class="kc-title">Sat Sri Akal</p>
         <p>I check each field's NDVI, soil fertility, moisture, rainfall and temperature against approved farms in the registry, then suggest the best crop to grow.</p>
         <p class="kc-meta">Ask about a farmer ID or name, a district, or type your own soil readings.</p>`,
      );
    }
    input.focus();
  };

  const hide = () => {
    panel.hidden = true;
    launcher.hidden = false;
    launcher.focus();
  };

  launcher.addEventListener('click', open);
  close.addEventListener('click', hide);
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    ask(input.value);
  });
}
