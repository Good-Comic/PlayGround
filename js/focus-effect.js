import { t } from './i18n.js';

// 只回報目前選兵對人工目標的實扣HP；不將接令、彈道或盾傷當作命中。
export function observeFocusEffect(g) {
  let last = null;
  const native = g.applyDamage;
  g.applyDamage = function(target, amount, source, kind, ...rest) {
    let before = null;
    try {
      if (['melee','projectile'].includes(kind) && source?.alive && source.team === 'player' && !source.w && !source.hero && source.type !== 'commander' && source.type !== 'villager' && !source.typeDef?.noAttack && g.selection.includes(source) && g.units.includes(source) && source.manualAttack && source.target === target && target?.alive && target.team === 'enemy' && g.isVisible(target)) {
        before = { hp: target.hp, world: g.world, wave: g.waveIndex, source, key: `${target.w ? 'building' : 'unit'}.${target.type}.name` };
      }
    } catch { /* 回讀失敗不得阻斷正式傷害。 */ }
    const result = native.call(this, target, amount, source, kind, ...rest);
    try {
      if (before && before.world === g.world) {
        const loss = Math.max(0, before.hp) - Math.max(0, target.hp);
        if (Number.isFinite(loss) && loss > 0) last = { ...before, loss, killed: !target.alive, at: g.time };
      }
    } catch { /* 保留正式死亡與結算結果。 */ }
    return result;
  };
  return {
    view() {
      if (!last) return null;
      if (last.world !== g.world || last.wave !== g.waveIndex || !['prep','wave'].includes(g.phase) || g.inMenu || g.time < last.at || g.time-last.at > 2.5 || !g.selection.includes(last.source)) { last = null; return null; }
      return { name: t(last.key), loss: last.loss, killed: last.killed };
    },
  };
}
export function focusEffectText(effect) {
  if (!effect) return '';
  const loss = effect.loss < .01 ? '<0.01' : Number(effect.loss.toFixed(2));
  return t(effect.killed ? 'readback.effectKill' : 'readback.effectHit', { name: effect.name, damage: loss });
}
