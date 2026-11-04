// 只保存尚未執行的意圖；讀檔不下令、不施法、不推進模擬。
export function planSaveHeaderMatches(g, data) {
  return data && !Array.isArray(data) && data.version === 1
    && data.seed === g.seed && data.cycle === g.cycle
    && data.waveIndex === g.waveIndex && data.phase === g.phase
    && ['prep', 'wave'].includes(g.phase)
    && Array.isArray(data.orders) && data.orders.length <= g.units.length + 2;
}
export function serializeTacticalPlan(g, plan) {
  if (!plan.active()) return null;
  return { version: 1, seed: g.seed, cycle: g.cycle, waveIndex: g.waveIndex, phase: g.phase, orders: plan.list() };
}
export function restoreTacticalPlan(g, plan, data) {
  if (!planSaveHeaderMatches(g, data) || !plan.begin()) return null;
  const result = { restored: 0, skipped: 0 }, usedUnits = new Set(), usedSkills = new Set();
  for (const order of data.orders) {
    let accepted = false;
    if (order && ['mark', 'aegis'].includes(order.type) && !usedSkills.has(order.type)) { accepted = plan.skill(order.type); if(accepted)usedSkills.add(order.type); }
    else if (order && Array.isArray(order.ids) && order.ids.length <= g.units.length
      && order.ids.every(id => Number.isSafeInteger(id) && id > 0 && !usedUnits.has(id))) {
      const units = order.ids.map(id => g.units.find(u => u.id === id));
      if (units.every(u => u?.alive && u.team === 'player' && !u.w && u.type !== 'villager' && !u.typeDef?.noAttack)) {
        const target = [...g.units, ...g.buildings].find(e => e.id === order.targetId);
        accepted = plan.stage(order.type, units, order.point, target);
        if(accepted)for(const u of units)usedUnits.add(u.id);
      }
    }
    accepted ? result.restored++ : result.skipped++;
  }
  return result;
}
export function installPlanPersistence(g, plan) {
  let pending = null;
  const snapshot = g.snapshot.bind(g), restore = g.restore.bind(g), newRun = g.newRun.bind(g);
  g.snapshot = (...args) => {
    const result = snapshot(...args), draft = serializeTacticalPlan(g, plan);
    if (draft) result.tacticalPlan = draft;
    return result;
  };
  g.restore = (saved, ...args) => {
    pending = null; plan.cancel();
    const result = restore(saved, ...args);
    if (planSaveHeaderMatches(g, saved?.tacticalPlan)) pending = saved.tacticalPlan;
    return result;
  };
  g.newRun = (...args) => { pending = null; plan.cancel(); return newRun(...args); };
  return {
    restorePending() {
      if (g.inMenu) return null;
      const draft = pending; pending = null;
      if (!planSaveHeaderMatches(g, draft) || g.placement) return null;
      if (!g.paused) g.togglePause();
      g.keys.clear();
      return restoreTacticalPlan(g, plan, draft);
    },
  };
}
