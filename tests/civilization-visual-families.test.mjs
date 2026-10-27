import test from 'node:test';
import assert from 'node:assert/strict';
import { CIVILIZATIONS } from '../js/data.js';
import { CIV_VISUAL_FAMILIES, civilizationVisualFamily, civilizationVisualProfile } from '../js/visuals.js';

test('all sixteen civilizations resolve to a deliberate non-color visual family', () => {
  assert.equal(CIVILIZATIONS.length, 16);
  for (const civ of CIVILIZATIONS) {
    const profile = civilizationVisualProfile(civ.id);
    assert.ok(CIV_VISUAL_FAMILIES[profile.id]);
    assert.ok(profile.roof);
    assert.ok(profile.kit);
    assert.ok(profile.emblem);
  }
  assert.equal(new Set(CIVILIZATIONS.map(civ => civilizationVisualFamily(civ.id))).size, 5);
});

test('representative civilizations use distinct architectural and military silhouettes', () => {
  const ids = ['MNG', 'TEU', 'SAR', 'CHN', 'AZT'];
  const profiles = ids.map(civilizationVisualProfile);
  assert.equal(new Set(profiles.map(profile => profile.roof)).size, ids.length);
  assert.equal(new Set(profiles.map(profile => profile.kit)).size, ids.length);
});
