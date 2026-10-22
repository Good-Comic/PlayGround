import { STRINGS } from '../js/locales.js';

const locales = Object.keys(STRINGS);
const base = STRINGS.en;
const baseKeys = Object.keys(base);
const errors = [];

for (const locale of locales) {
  if (locale === 'en') continue;
  const table = STRINGS[locale];
  for (const key of baseKeys) {
    if (!(key in table)) {
      errors.push(`${locale}: missing ${key}`);
      continue;
    }
    if (!String(table[key]).trim()) errors.push(`${locale}: empty ${key}`);
    const expected = new Set([...String(base[key]).matchAll(/\{(\w+)\}/g)].map(match => match[1]));
    const actual = new Set([...String(table[key]).matchAll(/\{(\w+)\}/g)].map(match => match[1]));
    for (const name of expected) if (!actual.has(name)) errors.push(`${locale}: ${key} missing placeholder {${name}}`);
    for (const name of actual) if (!expected.has(name)) errors.push(`${locale}: ${key} has unknown placeholder {${name}}`);
  }
  for (const key of Object.keys(table)) {
    if (!(key in base)) errors.push(`${locale}: stale key ${key}`);
  }
}

if (errors.length) {
  console.error(`Locale validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Locale validation passed: ${locales.length} locales, ${baseKeys.length} keys each.`);
