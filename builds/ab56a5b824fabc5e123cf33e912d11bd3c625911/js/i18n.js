import { LOCALE_META, STRINGS } from './locales.js';

export const LOCALES = Object.keys(LOCALE_META);
const STORAGE_KEY = 'riftwatch.playtest.locale';

function normalizeLocale(value) {
  if (!value) return null;
  const raw = String(value).replace('_', '-');
  if (LOCALE_META[raw]) return raw;
  const lower = raw.toLowerCase();
  if (lower === 'zh-tw' || lower === 'zh-hk' || lower === 'zh-mo' || lower.startsWith('zh-hant')) return 'zh-Hant';
  if (lower.startsWith('zh')) return 'zh-Hans';
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('en')) return 'en';
  return null;
}

function detectLocale() {
  let stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch {}
  return normalizeLocale(stored)
    || normalizeLocale(typeof navigator !== 'undefined' ? navigator.language : '')
    || 'en';
}

let current = detectLocale();

export function getLocale() { return current; }

export function getLocaleMeta(locale = current) {
  return LOCALE_META[locale] || LOCALE_META.en;
}

export function setLocale(locale, { persist = true } = {}) {
  const next = normalizeLocale(locale) || 'en';
  if (next === current && persist) return current;
  current = next;
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  }
  document.documentElement.lang = next;
  document.documentElement.dataset.locale = next;
  document.dispatchEvent(new CustomEvent('localechange', { detail: { locale: next } }));
  return current;
}

export function t(key, vars) {
  const locale = STRINGS[current] || STRINGS.en;
  let value = locale[key] ?? STRINGS.en[key] ?? key;
  if (vars) {
    value = value.replace(/\{(\w+)\}/g, (match, name) => vars[name] != null ? String(vars[name]) : match);
  }
  return value;
}

export function hasKey(locale, key) {
  return !!STRINGS[locale] && Object.prototype.hasOwnProperty.call(STRINGS[locale], key);
}

export function applyStaticTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.setAttribute('title', t(el.dataset.i18nTitle));
  });
  root.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
  });
  document.title = t('app.title');
}

export function localeOptions() {
  return LOCALES.map(id => ({ id, ...LOCALE_META[id] }));
}

setLocale(current, { persist: false });
