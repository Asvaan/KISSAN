import css from './motion.css?inline';

type Kind = 'rise' | 'tile' | 'row' | 'bar' | 'count';

const SKIP = '.pigeon-tiles-box, .pigeon-overlays, .recharts-wrapper, #kisaan-crop-advisor';
const COUNT_TARGETS = 'p[class*="text-2xl"], span[class*="text-2xl"], p[class*="text-3xl"]';
const NUMBER = /^(\d[\d,]*)(\.\d+)?$/;
const MAX_STAGGER = 12;

const pending = new WeakMap<Element, Kind>();

function indexInParent(el: Element): number {
  return Math.min(MAX_STAGGER, el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0);
}

function countUp(el: Element): void {
  const node = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim());
  if (!node) return;
  const original = node.nodeValue!;
  const m = original.trim().match(NUMBER);
  if (!m) return;
  const target = parseFloat(m[1].replace(/,/g, '') + (m[2] ?? ''));
  if (!target) return;
  const decimals = m[2] ? m[2].length - 1 : 0;
  const format = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: m[1].includes(','),
  });
  let start = 0;
  let shown = original;
  const step = () => {
    if (node.nodeValue !== shown) return;
    const now = performance.now();
    if (!start) start = now;
    const p = Math.min(1, (now - start) / 900);
    shown = p < 1 ? format.format(target * (1 - (1 - p) ** 3)) : original;
    node.nodeValue = shown;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  window.setTimeout(() => {
    if (node.nodeValue === shown) node.nodeValue = original;
  }, 1500);
}

function play(el: HTMLElement, kind: Kind, index: number): void {
  el.removeAttribute('data-kc-wait');
  if (kind === 'count') {
    countUp(el);
    return;
  }
  el.style.setProperty('--kc-i', String(index));
  const attr = kind === 'bar' ? 'data-kc-bar' : 'data-kc-in';
  el.setAttribute(attr, kind === 'bar' ? '' : kind);
  const done = (e: AnimationEvent) => {
    if (e.target !== el) return;
    el.removeAttribute(attr);
    el.style.removeProperty('--kc-i');
    el.removeEventListener('animationend', done);
  };
  el.addEventListener('animationend', done);
}

const observer = new IntersectionObserver(
  (entries) => {
    let batch = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target as HTMLElement;
      observer.unobserve(el);
      const kind = pending.get(el);
      pending.delete(el);
      if (kind) play(el, kind, Math.min(6, batch++));
    }
  },
  { rootMargin: '0px 0px -40px 0px' },
);

function reveal(el: Element, kind: Kind, index: number): void {
  if (!(el instanceof HTMLElement) || el.hasAttribute('data-kc-in') || el.hasAttribute('data-kc-wait')) return;
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    play(el, kind, index);
  } else if (kind !== 'count') {
    el.setAttribute('data-kc-wait', '');
    pending.set(el, kind);
    observer.observe(el);
  }
}

function watchImage(img: HTMLImageElement): void {
  const show = () => img.setAttribute('data-kc-loaded', '');
  if (img.complete) show();
  else {
    img.addEventListener('load', show, { once: true });
    img.addEventListener('error', show, { once: true });
  }
}

function decorate(scope: HTMLElement): void {
  if (scope.querySelector('.pigeon-tiles-box')) return;
  scope.querySelectorAll('[class*="grid"] > *').forEach((el) => reveal(el, 'tile', indexInParent(el)));
  scope.querySelectorAll('tbody > tr').forEach((el) => reveal(el, 'row', indexInParent(el)));
  scope.querySelectorAll('ul > li').forEach((el) => reveal(el, 'tile', indexInParent(el)));
  scope.querySelectorAll('[style*="width"][class*="rounded-full"]').forEach((el, i) => reveal(el, 'bar', Math.min(MAX_STAGGER, i)));
  scope.querySelectorAll(COUNT_TARGETS).forEach((el) => reveal(el, 'count', 0));
  scope.querySelectorAll('figure img').forEach((el) => watchImage(el as HTMLImageElement));
}

function enhance(el: HTMLElement): void {
  if (el.closest(SKIP)) return;
  const main = document.querySelector('#root main');
  const tabRoot = main?.firstElementChild?.firstElementChild;
  if (!(tabRoot instanceof HTMLElement)) return;

  if (el === tabRoot || el.contains(tabRoot)) {
    const isMap = !!tabRoot.querySelector('.pigeon-tiles-box');
    const sections = isMap || tabRoot.children.length < 2 ? [tabRoot] : [...tabRoot.children];
    sections.forEach((section, i) => reveal(section, 'rise', i));
    decorate(tabRoot);
    return;
  }
  if (!tabRoot.contains(el)) return;
  if (el.tagName === 'TR') reveal(el, 'row', indexInParent(el));
  else if (el.tagName === 'LI') reveal(el, 'tile', indexInParent(el));
  else if (el.matches('[class*="rounded"]') && !el.closest('[data-kc-in], [data-kc-wait]')) reveal(el, 'rise', 0);
  decorate(el);
}

export function startMotion(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const style = document.createElement('style');
  style.id = 'kc-motion-styles';
  style.textContent = css;
  document.head.appendChild(style);
  document.documentElement.classList.add('kc-motion');

  const root = document.getElementById('root');
  if (!root) return;
  new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) enhance(node);
      });
    }
  }).observe(root, { childList: true, subtree: true });
  root.querySelectorAll<HTMLElement>('main').forEach(enhance);
}
