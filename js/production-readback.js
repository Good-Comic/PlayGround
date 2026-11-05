import { t } from './i18n.js';
import { UNIT_TYPES } from './data.js';
import { RESOURCES, reserveCost, canSpend, productionStatus } from './stewards.js';

// 只讀已套用方案；不替換總管、資源或生產游標來預覽草稿。
// Read applied plans only; never substitute draft stewards, stock or production state.
export function productionReadback(game, building) {
  if (!building || building.team !== 'player' || !game.buildings.includes(building) || ['core', 'market'].includes(building.type)) return null;
  const plan = game.stewards.military[building.id], legal = game.trainableFor(building);
  const usesFallback = !plan?.units?.length;
  const types = (usesFallback ? legal.filter(type => !UNIT_TYPES[type].noAttack) : plan.units).filter(type => legal.includes(type));
  const globalFloor = reserveCost(game);
  const producerFloor = Object.fromEntries(RESOURCES.map((resource, i) => [resource, Number(plan?.budget?.[i]) || 0]));
  return {
    producerId: building.id, producerType: building.type, at: game.runTime,
    agePolicy: game.stewards.age, usesFallback, status: productionStatus(game, building),
    globalFloor, producerFloor,
    units: types.map(type => {
      const cost = game.unitCost(type);
      const resources = Object.fromEntries(RESOURCES.map(resource => {
        const stock = game.resources[resource] || 0, fee = cost[resource] || 0;
        const global = globalFloor[resource] || 0, producer = producerFloor[resource] || 0;
        const floor = Math.max(global, producer), after = stock - fee, checked = cost[resource] > 0;
        return [resource, { stock, cost: fee, globalFloor: global, producerFloor: producer, floor, after, checked,
          shortage: checked ? Math.max(0, floor - after) : 0 }];
      }));
      return { type, cost, resources, resourceReady: canSpend(game, cost, producerFloor),
        canTrainNow: game.canTrainNow(type), restriction: game.trainingRestriction(type), populationRoom: game.hasPopulationRoom(type) };
    }),
  };
}

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const tr = (key, vars) => t('production.' + key, vars);

// 玩家畫面明示約數；data-value保留正式計算值，小正缺口不顯示成零。
// Display readable approximations while preserving native values in data attributes.
export function productionNumber(value, compact = false) {
  if (!compact || !Number.isFinite(value)) return String(value);
  if (value > 0 && value < .01) return '<0.01';
  const rounded = Number(value.toFixed(2));
  return (rounded === value ? '' : '≈') + String(rounded);
}

export function productionReadbackHTML(view) {
  if (!view) return `<p>${escape(t('steward.producer.unavailable'))}</p>`;
  const clock = Math.floor(view.at / 60) + ':' + String(Math.floor(view.at % 60)).padStart(2, '0');
  const columns = ['stock', 'cost', 'globalFloor', 'producerFloor', 'floor', 'after', 'shortage'];
  return `<p class="production-snapshot">${escape(tr('snapshot', { time: clock }))}</p>
    <p class="production-rule">${escape(tr('rule'))} ${escape(tr('agePolicy', { policy: t('steward.' + view.agePolicy) }))}</p>
    ${view.usesFallback ? `<p>${escape(tr('fallback'))}</p>` : ''}
    ${view.units.length ? view.units.map(unit => {
      const charged = RESOURCES.filter(resource => unit.resources[resource].checked);
      const summary = (resources, field) => resources.map(resource => t('resourceType.' + resource) + ' ' + productionNumber(unit.resources[resource][field], true)).join(' · ');
      const cost = charged.length ? summary(charged, 'cost') : tr('noCost');
      const missing = charged.filter(resource => unit.resources[resource].shortage > 0);
      const condition = unit.resourceReady ? tr('resourcePassShort') : missing.length ? tr('missing', { resources: summary(missing, 'shortage') }) : tr('resourceWait');
      const restriction = unit.restriction === 'age' ? t('training.ageRequired', { age: t('age.' + (UNIT_TYPES[unit.type]?.minAge || 3)) })
        : unit.restriction ? tr('restricted') : !unit.populationRoom ? t('steward.producer.population') : '';
      return `<details class="production-unit" data-production-unit="${escape(unit.type)}" data-resources-ready="${unit.resourceReady}" data-can-train="${unit.canTrainNow}">
        <summary><strong>${escape(t('unit.' + unit.type + '.name'))}</strong> · ${escape(tr('fee', { cost }))} · <span class="${unit.resourceReady ? 'production-pass' : 'production-shortage'}">${escape(condition)}</span></summary>
        ${restriction ? `<p class="production-restriction">${escape(restriction)}</p>` : ''}
        <p>${escape(tr(unit.resourceReady ? 'resourcePass' : 'resourceWait'))}</p>
        <div class="steward-scroll"><table class="production-resource-table"><caption>${escape(tr('rawHelp'))}</caption><thead><tr><th scope="col">${escape(tr('resource'))}</th>${columns.map(column => `<th scope="col">${escape(tr(column))}</th>`).join('')}</tr></thead><tbody>
        ${RESOURCES.map(resource => {
          const row = unit.resources[resource];
          return `<tr data-resource="${resource}" data-checked="${row.checked}"><th scope="row">${escape(t('resourceType.' + resource))}</th>${columns.map(column => `<td data-value="${escape(productionNumber(row[column]))}" data-column="${column}">${escape(column === 'shortage' && !row.checked ? tr('unused') : productionNumber(row[column], true))}</td>`).join('')}</tr>`;
        }).join('')}</tbody></table></div></details>`;
    }).join('') : `<p>${escape(tr('noUnits'))}</p>`}`;
}
