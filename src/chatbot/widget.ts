import styles from './chatbot.css?inline';
import { loadRegistry } from './engine.ts';
import { Conversation, MENU, type BotTurn, type Chip, type MenuItem } from './conversation.ts';

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

const ICON = {
  sprout: '<path d="M7 20h10"/><path d="M12 20v-8"/><path d="M12 12c0-3.3-2.7-6-6-6H4v1c0 3.3 2.7 6 6 6h2"/><path d="M12 12c0-3.3 2.7-6 6-6h2v1c0 3.3-2.7 6-6 6h-2"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  up: '<path d="M7 10v12"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.4 22H7V10l4-8a3.1 3.1 0 0 1 4 3.9Z"/>',
  down: '<path d="M17 14V2"/><path d="M9 18.1 10 14H4.2a2 2 0 0 1-2-2.3l1.4-8A2 2 0 0 1 5.6 2H17v12l-4 8a3.1 3.1 0 0 1-4-3.9Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  map: '<path d="M14.1 6.1 9.9 3.9a2 2 0 0 0-1.8 0L3.6 6.2A1 1 0 0 0 3 7.1v12.3a1 1 0 0 0 1.4.9l3.7-1.9a2 2 0 0 1 1.8 0l4.2 2.2a2 2 0 0 0 1.8 0l4.5-2.3a1 1 0 0 0 .6-.9V5.1a1 1 0 0 0-1.4-.9l-3.7 1.9a2 2 0 0 1-1.8 0Z"/><path d="M15 6v15"/><path d="M9 3v15"/>',
  soil: '<path d="M2 22h20"/><path d="M5 18c1.5-2 3.5-3 7-3s5.5 1 7 3"/><path d="M12 15V8"/><path d="M12 8c0-2.5 2-4.5 4.5-4.5H18V5c0 2.5-2 4.5-4.5 4.5H12"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
  area: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="1"/>',
} as const;

const MENU_ICON: Record<MenuItem['id'], keyof typeof ICON> = {
  farmer: 'user',
  place: 'map',
  soil: 'soil',
  sow: 'calendar',
  crop: 'leaf',
  land: 'area',
};

const PLACEHOLDERS = [
  'Type a farmer ID, e.g. PB-LDH-0001',
  'Try "best crops for Moga"',
  'Try "fertility 40, moisture 28"',
  'Try "is cotton good for Bathinda?"',
  'Try "what can I sow now?"',
];

function svg(name: keyof typeof ICON, size = 18): string {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clock(): string {
  return new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

export function mountChatbot(): void {
  document.getElementById('kisaan-crop-advisor')?.remove();
  const host = document.createElement('div');
  host.id = 'kisaan-crop-advisor';
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: 'open' });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.innerHTML = `
    <style>${styles}</style>
    <button class="kc-launcher" type="button" aria-label="Chat with Kisaan Mitra" aria-expanded="false">
      <span class="kc-launcher-label">Ask Kisaan Mitra</span>
      <span class="kc-launcher-orb"><span class="kc-icon-open">${svg('sprout', 24)}</span><span class="kc-icon-close">${svg('close', 22)}</span></span>
    </button>
    <section class="kc-panel" role="dialog" aria-label="Kisaan Mitra crop advisor" hidden>
      <header class="kc-header">
        <div class="kc-avatar">${svg('sprout', 20)}<span class="kc-online"></span></div>
        <div class="kc-header-text">
          <h2>Kisaan Mitra <span>ਕਿਸਾਨ ਮਿੱਤਰ</span></h2>
          <p class="kc-status"><span class="kc-status-dot"></span><span class="kc-status-text">Online · crop advisor for Punjab</span></p>
        </div>
        <button class="kc-icon-btn kc-menu-btn" type="button" aria-label="Main menu" title="Main menu">${svg('grid', 16)}</button>
        <button class="kc-icon-btn kc-close" type="button" aria-label="Close chat" title="Close">${svg('close', 16)}</button>
      </header>
      <div class="kc-log" aria-live="polite"></div>
      <form class="kc-form">
        <input class="kc-input" type="text" autocomplete="off" aria-label="Message Kisaan Mitra" />
        <button class="kc-icon-btn kc-mic" type="button" aria-label="Speak your question" title="Speak" hidden>${svg('mic', 17)}</button>
        <button class="kc-send" type="submit" aria-label="Send">${svg('send', 16)}</button>
      </form>
      <p class="kc-foot">Advice is based on registry NDVI, soil and weather data.</p>
    </section>`;

  const $ = <T extends Element>(sel: string) => root.querySelector<T>(sel)!;
  const launcher = $<HTMLButtonElement>('.kc-launcher');
  const panel = $<HTMLElement>('.kc-panel');
  const log = $<HTMLDivElement>('.kc-log');
  const form = $<HTMLFormElement>('.kc-form');
  const input = $<HTMLInputElement>('.kc-input');
  const mic = $<HTMLButtonElement>('.kc-mic');
  const statusText = $<HTMLSpanElement>('.kc-status-text');

  let conversation: Promise<Conversation> | null = null;
  let queue: Promise<void> = Promise.resolve();
  let greeted = false;

  const ensureConversation = () => {
    if (!conversation) {
      conversation = loadRegistry().then((reg) => {
        const clean = reg.parcels.filter((p) => p.violation === 'none').length;
        statusText.textContent = `Online · ${reg.parcels.length.toLocaleString()} holdings, ${clean.toLocaleString()} clean fields`;
        return new Conversation(reg);
      });
      conversation.catch(() => {
        conversation = null;
      });
    }
    return conversation;
  };

  const scrollIntoView = (el: HTMLElement) => {
    const top = el.offsetTop - 12;
    const bottom = el.offsetTop + el.offsetHeight + 12;
    const target = el.offsetHeight + 24 > log.clientHeight ? top : bottom - log.clientHeight;
    if (target > log.scrollTop) log.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' });
  };

  const countUp = (scope: HTMLElement) => {
    if (reduced) return;
    scope.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      const target = Number(el.dataset.count);
      if (!Number.isFinite(target) || target <= 0) return;
      let start = 0;
      const step = () => {
        const now = performance.now();
        if (!start) start = now;
        const p = Math.min(1, (now - start) / 800);
        el.textContent = String(Math.round(target * (1 - (1 - p) ** 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      window.setTimeout(() => (el.textContent = String(target)), 1400);
    });
  };

  const botRow = (html: string, first: boolean) => {
    const row = document.createElement('div');
    row.className = `kc-row kc-row-bot${first ? '' : ' kc-cont'}`;
    row.innerHTML = `<span class="kc-avatar-sm">${svg('sprout', 14)}</span><div class="kc-bubble">${html}</div>`;
    log.appendChild(row);
    return row;
  };

  const userRow = (text: string) => {
    const row = document.createElement('div');
    row.className = 'kc-row kc-row-user';
    const bubble = document.createElement('div');
    bubble.className = 'kc-bubble';
    bubble.textContent = text;
    const time = document.createElement('span');
    time.className = 'kc-time';
    time.textContent = clock();
    row.append(bubble, time);
    log.appendChild(row);
    scrollIntoView(row);
  };

  const typing = (first: boolean) => {
    const row = botRow('<span class="kc-typing" aria-label="Kisaan Mitra is typing"><i></i><i></i><i></i></span>', first);
    row.classList.add('kc-row-typing');
    scrollIntoView(row);
    return row;
  };

  const clearInteractive = () => {
    log.querySelectorAll('.kc-chips').forEach((el) => el.remove());
  };

  const addChips = (chips: Chip[]) => {
    if (!chips.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'kc-chips';
    chips.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `kc-chip${c.send === '#menu' ? ' kc-chip-menu' : ''}`;
      b.style.setProperty('--kc-i', String(i));
      b.textContent = c.label;
      b.addEventListener('click', () => send(c.send, c.label));
      wrap.appendChild(b);
    });
    log.appendChild(wrap);
    scrollIntoView(wrap);
  };

  const addMenu = () => {
    const wrap = document.createElement('div');
    wrap.className = 'kc-menu';
    MENU.forEach((item, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'kc-menu-item';
      b.style.setProperty('--kc-i', String(i));
      b.innerHTML = `<span class="kc-menu-icon">${svg(MENU_ICON[item.id], 18)}</span><span class="kc-menu-text"><b>${item.label}</b><span>${item.hint}</span></span><span class="kc-menu-chevron">${svg('chevron', 16)}</span>`;
      b.addEventListener('click', () => send(`#${item.id}`, item.label));
      wrap.appendChild(b);
    });
    log.appendChild(wrap);
    scrollIntoView(wrap);
  };

  const addFeedback = () => {
    const wrap = document.createElement('div');
    wrap.className = 'kc-feedback';
    wrap.innerHTML = `<span>Was this helpful?</span><button type="button" data-v="good" aria-label="Yes, helpful">${svg('up', 14)}</button><button type="button" data-v="bad" aria-label="Not helpful">${svg('down', 14)}</button>`;
    wrap.querySelectorAll<HTMLButtonElement>('button').forEach((b) =>
      b.addEventListener('click', () => {
        wrap.classList.add('kc-voted');
        b.classList.add('kc-chosen');
        wrap.querySelectorAll('button').forEach((x) => ((x as HTMLButtonElement).disabled = true));
        send(`#${b.dataset.v}`, b.dataset.v === 'good' ? 'Yes, that helped' : 'Not really');
      }),
    );
    log.appendChild(wrap);
  };

  const play = async (turn: BotTurn) => {
    for (const [i, html] of turn.bubbles.entries()) {
      const len = html.replace(/<[^>]+>/g, '').length;
      const delay = reduced ? 120 : i === 0 ? 420 + Math.min(380, len * 4) : 260 + Math.min(620, len * 1.4);
      const dots = typing(i === 0);
      await wait(delay);
      dots.remove();
      const row = botRow(html, i === 0);
      countUp(row);
      scrollIntoView(row);
      if (i === turn.bubbles.length - 1) {
        const time = document.createElement('span');
        time.className = 'kc-time';
        time.textContent = `Kisaan Mitra · ${clock()}`;
        row.appendChild(time);
      }
    }
    if (turn.menu) addMenu();
    if (turn.feedback) addFeedback();
    addChips(turn.chips);
  };

  const run = (job: (c: Conversation) => BotTurn) => {
    queue = queue.then(async () => {
      try {
        const c = await ensureConversation();
        await play(job(c));
      } catch {
        await play({
          bubbles: ["<p>I couldn't load the farm registry just now. Please check your connection and try again.</p>"],
          chips: [{ label: 'Try again', send: '#menu' }],
        });
      }
    });
    return queue;
  };

  function send(text: string, label = text) {
    const q = text.trim();
    if (!q) return;
    clearInteractive();
    userRow(label.trim());
    input.value = '';
    run((c) => c.respond(q));
  }

  const open = () => {
    launcher.classList.add('kc-active', 'kc-seen');
    launcher.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    panel.classList.remove('kc-closing');
    ensureConversation();
    if (!greeted) {
      greeted = true;
      run((c) => c.greet());
    }
    window.setTimeout(() => input.focus(), reduced ? 0 : 180);
  };

  const close = () => {
    launcher.classList.remove('kc-active');
    launcher.setAttribute('aria-expanded', 'false');
    if (reduced) {
      panel.hidden = true;
      return;
    }
    panel.classList.add('kc-closing');
    window.setTimeout(() => {
      panel.hidden = true;
      panel.classList.remove('kc-closing');
    }, 200);
  };

  launcher.addEventListener('click', () => (panel.hidden ? open() : close()));
  $<HTMLButtonElement>('.kc-close').addEventListener('click', close);
  $<HTMLButtonElement>('.kc-menu-btn').addEventListener('click', () => send('#menu', 'Main menu'));
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    send(input.value);
  });

  let placeholder = 0;
  input.placeholder = PLACEHOLDERS[0];
  window.setInterval(() => {
    if (document.activeElement === host && input.value) return;
    placeholder = (placeholder + 1) % PLACEHOLDERS.length;
    input.placeholder = PLACEHOLDERS[placeholder];
  }, 4000);

  const Speech = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike });
  const Recognition = Speech.SpeechRecognition ?? Speech.webkitSpeechRecognition;
  if (Recognition) {
    mic.hidden = false;
    let rec: SpeechRecognitionLike | null = null;
    mic.addEventListener('click', () => {
      if (rec) {
        rec.stop();
        return;
      }
      rec = new Recognition();
      rec.lang = 'en-IN';
      rec.interimResults = true;
      mic.classList.add('kc-listening');
      input.placeholder = 'Listening…';
      rec.onresult = (e) => {
        const result = e.results[e.results.length - 1];
        input.value = result[0].transcript;
        if (result.isFinal) send(input.value);
      };
      rec.onend = rec.onerror = () => {
        mic.classList.remove('kc-listening');
        input.placeholder = PLACEHOLDERS[placeholder];
        rec = null;
      };
      rec.start();
    });
  }

  window.setTimeout(() => ensureConversation(), 2000);
}
